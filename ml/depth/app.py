"""
au7o depth service — Depth Anything 3 (metric) on Modal.

Phase 1a of the vision pipeline: take a diagnosis photo, return real-world
geometry (relative depth everywhere + metric depth where we know the camera
focal length) so the OpenAI vision diagnosis can be GROUNDED instead of
guessing ("is that tire actually flat / is that a real bulge / how big is that
gap-or-puddle"). The model lives here on a scale-to-zero GPU; au7o only ever
receives the OUTPUT (depth stats), never the weights — which keeps us clean
under both the Depth-Anything-3 Apache-2.0 license (we use the DA3METRIC-LARGE
variant, NOT the CC-BY-NC giant) and our own product terms.

Deploy:  modal deploy ml/depth/app.py
Result:  a POST URL you put in au7o's DEPTH_ENDPOINT_URL env var.
Auth:    a shared bearer token (Modal secret `au7o-depth-token`) so only au7o
         can call it. See ml/depth/README.md for the 5-minute setup.

Model: depth-anything/DA3METRIC-LARGE (Apache-2.0). Metric depth in meters =
focal_px * net_output / 300  (focal_px from the caller's EXIF; if absent we
return RELATIVE depth only and say so).
"""

import base64
import io
import os
import tempfile

import modal

# Build the image: clone the DA3 repo and install it (it is NOT on PyPI).
# Pinned to a clone at build time; bump the commit to upgrade deliberately.
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .pip_install("torch>=2", "torchvision", "xformers", "pillow", "numpy", "huggingface_hub", "fastapi[standard]")
    .run_commands(
        "git clone https://github.com/ByteDance-Seed/Depth-Anything-3 /opt/da3",
        "cd /opt/da3 && pip install -e .",
    )
)

app = modal.App("au7o-depth")

# Cache the HF weights in a Modal Volume so cold starts don't re-download.
weights = modal.Volume.from_name("au7o-da3-weights", create_if_missing=True)
MODEL_ID = "depth-anything/DA3METRIC-LARGE"


@app.cls(
    image=image,
    gpu="A10G",                       # 0.35B model fits comfortably; T4 also works if cost matters
    volumes={"/cache": weights},
    scaledown_window=300,             # keep warm 5 min after a request, then scale to zero ($0 idle)
    secrets=[modal.Secret.from_name("au7o-depth-token")],
)
class Depth:
    @modal.enter()
    def load(self):
        import torch
        from depth_anything_3.api import DepthAnything3

        os.environ.setdefault("HF_HOME", "/cache/hf")
        self.torch = torch
        self.np = __import__("numpy")
        self.model = DepthAnything3.from_pretrained(MODEL_ID).to(device=torch.device("cuda"))
        self.model.eval()

    def _region_stats(self, depth, box, focal_px):
        """median/min/max for a bbox, in meters if focal known else raw."""
        np = self.np
        h, w = depth.shape
        x1 = max(0, min(w - 1, int(box.get("x1", 0))))
        y1 = max(0, min(h - 1, int(box.get("y1", 0))))
        x2 = max(x1 + 1, min(w, int(box.get("x2", w))))
        y2 = max(y1 + 1, min(h, int(box.get("y2", h))))
        patch = depth[y1:y2, x1:x2]
        scale = (focal_px / 300.0) if focal_px else 1.0
        return {
            "name": box.get("name", "region"),
            "unit": "m" if focal_px else "relative",
            "median": round(float(np.median(patch)) * scale, 4),
            "min": round(float(patch.min()) * scale, 4),
            "max": round(float(patch.max()) * scale, 4),
        }

    @modal.fastapi_endpoint(method="POST", docs=True)
    def infer(self, data: dict):
        """
        POST JSON:
          { "image": "<base64 or data: URL>",   # required
            "focalPx": 1400,                      # optional: focal length in PIXELS (from EXIF) -> metric meters
            "regions": [{"name":"tire","x1":..,"y1":..,"x2":..,"y2":..}] }  # optional bboxes to measure
        Returns depth stats (relative, or metric meters when focalPx given).
        Bearer-token gated via the au7o-depth-token secret.
        """
        from fastapi import HTTPException, Request  # noqa: F401

        # --- auth: shared bearer token ---
        expected = os.environ.get("DEPTH_TOKEN")
        got = (data.get("token") or "").strip()
        if expected and got != expected:
            raise HTTPException(status_code=401, detail="unauthorized")

        b64 = data.get("image") or ""
        if "," in b64 and b64.strip().startswith("data:"):
            b64 = b64.split(",", 1)[1]
        try:
            raw = base64.b64decode(b64)
        except Exception:
            raise HTTPException(status_code=400, detail="image must be base64 (optionally a data: URL)")

        from PIL import Image as PILImage

        pil = PILImage.open(io.BytesIO(raw)).convert("RGB")
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
            pil.save(f.name)
            path = f.name

        pred = self.model.inference([path])
        depth = pred.depth[0]
        # to numpy on CPU
        if hasattr(depth, "detach"):
            depth = depth.detach().float().cpu().numpy()
        else:
            depth = self.np.asarray(depth, dtype="float32")

        focal_px = data.get("focalPx")
        focal_px = float(focal_px) if focal_px else None
        scale = (focal_px / 300.0) if focal_px else 1.0
        h, w = depth.shape

        regions = [self._region_stats(depth, b, focal_px) for b in (data.get("regions") or [])]

        return {
            "ok": True,
            "model": MODEL_ID,
            "width": int(w),
            "height": int(h),
            "unit": "m" if focal_px else "relative",
            "note": None if focal_px
            else "No focalPx provided — depth is RELATIVE (ratios valid, absolute mm not). Pass EXIF focal in pixels for metric meters.",
            "overall": {
                "nearest": round(float(depth.min()) * scale, 4),
                "farthest": round(float(depth.max()) * scale, 4),
                "median": round(float(self.np.median(depth)) * scale, 4),
            },
            "regions": regions,
        }
