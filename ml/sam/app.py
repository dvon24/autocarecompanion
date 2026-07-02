"""
au7o SAM segmentation service — the WHERE stage of the vision tap-to-identify
pipeline. Turns a user's POINT or BOX tap on a photo into a tight object MASK
(bbox + outline polygon) so the app can highlight the exact segmented part the
user pointed at (Phase 2), instead of a fixed square box.

This is the LIGHT sibling of ml/sam3d (which builds 3D splats). It's 2D
promptable segmentation only — fast, cheap, T4-class. It matches the contract
in src/lib/sam.ts exactly, so the Next app lights up the moment SAM_ENDPOINT_URL
points here.

Model: Meta Segment Anything (SAM) ViT-B. Public checkpoint (no gated HF access
needed), cached to a Modal Volume on first load. Commercial-clean: we ship only
the derived MASK of the user's own photo, never the weights.

PREREQS (Devon, one-time):
  1. Modal secret `au7o-depth-token` already exists — reused here as the shared
     bearer token (env DEPTH_TOKEN). No new secret needed.

Deploy:   python -m modal deploy ml/sam/app.py
Then in Vercel set:
  SAM_ENDPOINT_URL = <the deployed .modal.run URL for `segment`>
  SAM_TOKEN        = <same value as your au7o-depth-token secret>

Contract (src/lib/sam.ts):
  POST JSON { image: "<base64/data-url RGB>",
              token: "<SAM_TOKEN>",
              prompt: {kind:"point", x, y} | {kind:"box", x, y, w, h} }   # PERCENT 0-100
  -> { ok, box:{x,y,w,h}, polygon:[{x,y}...], score }                     # PERCENT 0-100
"""

import base64
import io
import os

import modal

# CPU-light but GPU makes SAM interactive (~0.3-0.8s/predict on T4). ViT-B is
# ~375MB. Standard slim image + torch (cu121) + segment-anything + opencv.
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libgl1", "libglib2.0-0")  # opencv runtime libs
    .pip_install(
        "torch==2.5.1", "torchvision==0.20.1",
        extra_options="--index-url https://download.pytorch.org/whl/cu121",
    )
    .pip_install(
        "segment-anything",
        "opencv-python-headless",
        "numpy",
        "pillow",
        "fastapi[standard]",
    )
)

app = modal.App("au7o-sam")
weights = modal.Volume.from_name("au7o-sam-weights", create_if_missing=True)

# ViT-B: best speed/quality tradeoff for interactive tap segmentation. Public
# download (no HF gate). Swap to vit_h for max quality at ~3x the load.
SAM_MODEL_TYPE = "vit_b"
SAM_CKPT_URL = "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth"
SAM_CKPT_PATH = "/cache/sam_vit_b_01ec64.pth"
MAX_POLYGON_POINTS = 48  # keep the outline light for JSON + SVG render


@app.cls(
    image=image,
    gpu="T4",
    volumes={"/cache": weights},
    scaledown_window=240,   # stay warm 4 min between taps
    timeout=120,
    secrets=[modal.Secret.from_name("au7o-depth-token")],  # DEPTH_TOKEN bearer
)
class Sam:
    @modal.enter()
    def load(self):
        import urllib.request

        import numpy as np
        import torch
        from segment_anything import SamPredictor, sam_model_registry

        self.np = np
        self.torch = torch

        if not os.path.exists(SAM_CKPT_PATH):
            os.makedirs("/cache", exist_ok=True)
            urllib.request.urlretrieve(SAM_CKPT_URL, SAM_CKPT_PATH)
            weights.commit()

        device = "cuda" if torch.cuda.is_available() else "cpu"
        sam = sam_model_registry[SAM_MODEL_TYPE](checkpoint=SAM_CKPT_PATH)
        sam.to(device=device)
        self.predictor = SamPredictor(sam)
        self.device = device

    @modal.fastapi_endpoint(method="POST", docs=True)
    def segment(self, data: dict):
        from fastapi import HTTPException
        from PIL import Image as PILImage

        expected = os.environ.get("SAM_TOKEN") or os.environ.get("DEPTH_TOKEN")
        if expected and (data.get("token") or "").strip() != expected:
            raise HTTPException(status_code=401, detail="unauthorized")

        np = self.np

        # ── decode image ──
        v = data.get("image")
        if not v:
            raise HTTPException(status_code=400, detail="image required")
        if isinstance(v, str) and v.startswith("data:") and "," in v:
            v = v.split(",", 1)[1]
        try:
            pil = PILImage.open(io.BytesIO(base64.b64decode(v))).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="bad image")
        rgb = np.array(pil, dtype="uint8")
        h, w = rgb.shape[:2]

        # ── parse the PERCENT prompt into pixel SAM inputs ──
        prompt = data.get("prompt") or {}
        kind = prompt.get("kind")
        point_coords = point_labels = input_box = None
        if kind == "point":
            px = float(prompt.get("x", 50)) / 100.0 * w
            py = float(prompt.get("y", 50)) / 100.0 * h
            point_coords = np.array([[px, py]], dtype=np.float32)
            point_labels = np.array([1], dtype=np.int32)
        elif kind == "box":
            x1 = float(prompt.get("x", 0)) / 100.0 * w
            y1 = float(prompt.get("y", 0)) / 100.0 * h
            x2 = (float(prompt.get("x", 0)) + float(prompt.get("w", 0))) / 100.0 * w
            y2 = (float(prompt.get("y", 0)) + float(prompt.get("h", 0))) / 100.0 * h
            input_box = np.array([x1, y1, x2, y2], dtype=np.float32)
        else:
            raise HTTPException(status_code=400, detail="prompt.kind must be 'point' or 'box'")

        # ── predict; SAM returns 3 masks at different granularities, pick best ──
        self.predictor.set_image(rgb)
        masks, scores, _ = self.predictor.predict(
            point_coords=point_coords,
            point_labels=point_labels,
            box=input_box,
            multimask_output=True,
        )
        best = int(np.argmax(scores))
        mask = masks[best].astype("uint8")  # (H,W) 0/1
        score = float(scores[best])

        ys, xs = np.where(mask > 0)
        if xs.size == 0:
            raise HTTPException(status_code=422, detail="no mask")
        x0, x1 = int(xs.min()), int(xs.max())
        y0, y1 = int(ys.min()), int(ys.max())

        box_pct = {
            "x": x0 / w * 100.0,
            "y": y0 / h * 100.0,
            "w": (x1 - x0) / w * 100.0,
            "h": (y1 - y0) / h * 100.0,
        }

        polygon = self._mask_to_polygon(mask, w, h)

        return {"ok": True, "box": box_pct, "polygon": polygon, "score": score}

    def _mask_to_polygon(self, mask, w, h):
        """Largest external contour of the mask, simplified, as PERCENT points."""
        import cv2

        np = self.np
        contours, _ = cv2.findContours(
            (mask > 0).astype("uint8"), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        if not contours:
            return []
        c = max(contours, key=cv2.contourArea)
        # simplify until the point count is manageable
        peri = cv2.arcLength(c, True)
        eps = 0.005 * peri
        approx = cv2.approxPolyDP(c, eps, True)
        while approx.shape[0] > MAX_POLYGON_POINTS and eps < 0.05 * peri:
            eps *= 1.4
            approx = cv2.approxPolyDP(c, eps, True)
        pts = approx.reshape(-1, 2)
        return [{"x": float(px) / w * 100.0, "y": float(py) / h * 100.0} for px, py in pts]
