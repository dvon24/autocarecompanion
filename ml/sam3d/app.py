"""
au7o SAM 3D Objects service — complete 3D object (Gaussian splat) from one photo.

Phase 3 of the vision pipeline: image (+ object mask, + optional DA3 pointmap to
ground geometry) -> a complete, fully-spinnable Gaussian-splat .ply that the
founder /lab/3d page renders. Outputs only (the splat), never the weights ->
commercial-clean under Meta's SAM License.

⚠️ THIS IS THE HEAVY DEPLOY. torch 2.5.1+cu121, PyTorch3D + NVIDIA Kaolin +
gsplat (all CUDA-compiled, version-pinned), a Hydra patch, and GATED weights.
Expect a few deploy->fix cycles — paste build logs and we iterate. The DA3
depth service (au7o-depth) is separate and unaffected.

PREREQS (Devon, one-time):
  1. Accept gated access at huggingface.co/facebook/sam-3d-objects
  2. Modal secret `huggingface` with HF_TOKEN=hf_... (a HF read token)
  3. Modal secret `au7o-depth-token` already exists (reused for auth here)

Deploy:  python -m modal deploy ml\sam3d\app.py
"""

import base64
import io
import os
import sys
import tempfile

import modal

# CUDA 12.1 *devel* base (nvcc present) so pytorch3d/kaolin can compile if a
# prebuilt wheel is missing. add_python gives us a clean 3.11.
image = (
    modal.Image.from_registry("nvidia/cuda:12.1.1-devel-ubuntu22.04", add_python="3.11")
    .apt_install("git", "build-essential", "ninja-build", "libgl1", "libglib2.0-0")
    # A10G = sm_86. Set arch list so any source build targets the right GPU.
    # PIP_DEFAULT_TIMEOUT/PIP_RETRIES: the .[dev] extra pulls many/large pkgs and
    # Modal's pip mirror occasionally ReadTimeouts on a big one — give pip room.
    .env({
        "TORCH_CUDA_ARCH_LIST": "8.6",
        "FORCE_CUDA": "1",
        "PIP_DEFAULT_TIMEOUT": "300",
        "PIP_RETRIES": "10",
    })
    .pip_install(
        "torch==2.5.1", "torchvision==0.20.1",
        extra_options="--index-url https://download.pytorch.org/whl/cu121",
    )
    .pip_install("huggingface-hub[cli]<1.0", "numpy", "pillow", "fastapi[standard]")
    .run_commands(
        "git clone https://github.com/facebookresearch/sam-3d-objects /opt/sam3d",
        # nvidia-pyindex (a transitive dep) is a pip-config hack whose setup.py
        # shells out to `pip` — which doesn't exist in pip's ISOLATED build env
        # ("No module named 'pip'"). Pre-install it with --no-build-isolation so
        # it uses the container's real pip; then the editable install sees it
        # satisfied and won't rebuild it. (We don't need its index hack anyway —
        # PIP_EXTRA_INDEX_URL already points at NVIDIA's index.)
        "pip install --no-build-isolation nvidia-pyindex",
        # Base package only — NOT '.[dev]'. The dev extra drags in bpy (Blender,
        # 377MB) + viz/test tooling we don't need for headless inference, and it
        # was the thing timing out the build. Base deps + the two inference
        # extras below are what's actually needed to produce a splat.
        "cd /opt/sam3d && PIP_EXTRA_INDEX_URL='https://pypi.ngc.nvidia.com https://download.pytorch.org/whl/cu121' pip install -e .",
        "cd /opt/sam3d && PIP_EXTRA_INDEX_URL='https://download.pytorch.org/whl/cu121' pip install -e '.[p3d]'",
        "cd /opt/sam3d && PIP_FIND_LINKS='https://nvidia-kaolin.s3.us-east-2.amazonaws.com/torch-2.5.1_cu121.html' pip install -e '.[inference]'",
        # Hydra patch the repo ships (best-effort; don't fail the build if absent).
        "cd /opt/sam3d && (bash ./patching/hydra || true)",
        gpu="A10G",  # some of these wheels probe CUDA at install
    )
)

app = modal.App("au7o-sam3d")
weights = modal.Volume.from_name("au7o-sam3d-weights", create_if_missing=True)
TAG = "hf"


@app.cls(
    image=image,
    gpu="A10G",
    volumes={"/cache": weights},
    scaledown_window=240,
    timeout=600,
    secrets=[
        modal.Secret.from_name("huggingface"),      # HF_TOKEN for gated weights
        modal.Secret.from_name("au7o-depth-token"),  # DEPTH_TOKEN reused as the shared bearer
    ],
)
class Sam3d:
    @modal.enter()
    def load(self):
        import numpy as np
        from huggingface_hub import snapshot_download

        self.np = np
        ckpt_root = "/cache/checkpoints"
        ckpt_dir = f"{ckpt_root}/{TAG}"
        if not os.path.exists(f"{ckpt_dir}/pipeline.yaml"):
            os.makedirs(ckpt_root, exist_ok=True)
            dl = snapshot_download(
                repo_id="facebook/sam-3d-objects",
                repo_type="model",
                local_dir=f"{ckpt_root}/{TAG}-download",
                token=os.environ.get("HF_TOKEN"),
                max_workers=1,
            )
            # repo nests weights under checkpoints/ — move into checkpoints/hf
            src = os.path.join(dl, "checkpoints")
            if os.path.isdir(src):
                os.rename(src, ckpt_dir)
            else:  # fallback: use the download root directly
                ckpt_dir = dl

        sys.path.append("/opt/sam3d/notebook")
        from inference import Inference  # noqa: E402

        self.Inference = Inference
        self.inf = Inference(f"{ckpt_dir}/pipeline.yaml", compile=False)

    @modal.fastapi_endpoint(method="POST", docs=True)
    def infer(self, data: dict):
        """
        POST JSON:
          { "image": "<base64/data-url RGB>",      # required
            "mask":  "<base64 PNG binary mask>",     # optional -> whole frame if omitted
            "pointmap": "<base64 .npy HxWx3 float>", # optional (DA3 geometry to ground it)
            "seed": 42, "token": "<DEPTH_TOKEN>" }
        Returns { ok, ply_b64 } — a Gaussian-splat .ply (base64).
        """
        from fastapi import HTTPException
        from PIL import Image as PILImage

        expected = os.environ.get("DEPTH_TOKEN")
        if expected and (data.get("token") or "").strip() != expected:
            raise HTTPException(status_code=401, detail="unauthorized")

        np = self.np

        def _b64img(key):
            v = data.get(key)
            if not v:
                return None
            if isinstance(v, str) and v.startswith("data:") and "," in v:
                v = v.split(",", 1)[1]
            return PILImage.open(io.BytesIO(base64.b64decode(v)))

        pil = _b64img("image")
        if pil is None:
            raise HTTPException(status_code=400, detail="image required")
        rgb = np.array(pil.convert("RGB"), dtype="uint8")
        h, w = rgb.shape[:2]

        mpil = _b64img("mask")
        if mpil is not None:
            mask = np.array(mpil.convert("L")) > 0
        else:
            mask = np.ones((h, w), dtype=bool)  # whole-frame fallback

        pointmap = None
        if data.get("pointmap"):
            pm = base64.b64decode(data["pointmap"])
            pointmap = np.load(io.BytesIO(pm))

        out = self.inf(rgb, mask, seed=int(data.get("seed", 42)), pointmap=pointmap)
        with tempfile.NamedTemporaryFile(suffix=".ply", delete=False) as f:
            out["gs"].save_ply(f.name)
            ply = open(f.name, "rb").read()

        return {"ok": True, "bytes": len(ply), "ply_b64": base64.b64encode(ply).decode()}
