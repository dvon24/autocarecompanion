# au7o SAM 3D Objects service (complete 3D splat from one photo)

Phase 3. Image (+ mask, + optional DA3 pointmap) → a complete, spinnable
Gaussian-splat `.ply`. Heavy deploy — torch 2.5.1+cu121, PyTorch3D + Kaolin +
gsplat, gated weights. **Expect a few deploy→fix cycles** (paste build logs and
we iterate). Commercial-clean: serves outputs only (SAM License).

## Prereqs (one-time)
1. **Accept gated access:** huggingface.co/facebook/sam-3d-objects → request/accept.
2. **HF token secret on Modal:**
   ```
   python -m modal secret create huggingface HF_TOKEN=hf_xxxxxxxx
   ```
   (a HuggingFace **Read** token, from huggingface.co/settings/tokens)
3. `au7o-depth-token` secret already exists (reused as the bearer here).

## Deploy
```
python -m modal deploy ml\sam3d\app.py
```
First boot downloads the gated weights into a cached Volume (one-time, slow).
Then it's scale-to-zero like the depth app. A10G GPU.

## Why DA3 helps (Devon's call)
`inference(image, mask, seed, pointmap=)` takes an optional **pointmap** — a 3D
point per pixel. Our DA3 depth (commercial) produces exactly that. We keep DA3 in
its own container and pass its pointmap in to ground SAM 3D's geometry. The
endpoint already accepts `pointmap` (base64 .npy); we wire DA3→pointmap once
SAM 3D builds clean.

## Endpoint
POST JSON `{ image, mask?, pointmap?, seed?, token }` → `{ ok, bytes, ply_b64 }`.
For the demo we return the splat as base64; if responses get too big we'll switch
to uploading the `.ply` to Vercel Blob and returning a URL.

## Likely iteration points (heads-up)
- PyTorch3D / Kaolin wheel-vs-torch matching (the usual pain).
- Exact extras names `.[dev]` / `.[p3d]` / `.[inference]` and the hydra patch path.
- Weights nesting under `checkpoints/` after `snapshot_download`.
- Splat `.ply` size vs Modal response limit (→ Blob if needed).
