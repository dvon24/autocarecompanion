# au7o depth service (Depth Anything 3 metric, on Modal)

Phase 1a of the vision pipeline. A scale-to-zero GPU endpoint that turns a
diagnosis photo into real-world geometry, so the OpenAI vision diagnosis is
**grounded** instead of guessing. au7o calls it; users only ever see the result.

**License note:** uses `depth-anything/DA3METRIC-LARGE` (**Apache-2.0** — the
commercial-safe variant). Do NOT switch to the Giant/Nested models — those are
CC-BY-NC (no commercial use).

---

## One-time setup (~5–10 min)

1. **Make a Modal account** → https://modal.com (free tier; you only pay for
   GPU-seconds actually used — it scales to **zero** when idle).

2. **Install + authenticate** (run these in `! ` from the au7o chat, or a terminal):
   ```
   pip install modal
   modal token new
   ```
   (`modal token new` opens a browser to link your account.)

3. **Create the shared auth token** (so only au7o can call the endpoint). Pick any
   long random string and store it as a Modal secret named `au7o-depth-token`
   with key `DEPTH_TOKEN`:
   ```
   modal secret create au7o-depth-token DEPTH_TOKEN=<paste-a-long-random-string>
   ```
   Save that same string — it goes in Vercel next.

4. **Deploy:**
   ```
   modal deploy ml/depth/app.py
   ```
   Modal prints a URL like `https://<you>--au7o-depth-depth-infer.modal.run`.

5. **Wire au7o to it** — add to Vercel (Production) **and** `.env.local`:
   ```
   DEPTH_ENDPOINT_URL=<the URL modal printed>
   DEPTH_TOKEN=<the same random string from step 3>
   ```

That's it. First call cold-starts (~20–40s while it downloads weights once into a
cached Volume); after that warm calls are ~1–3s, and it idles back to $0 after 5 min.

---

## Test it

```
python ml/depth/test.py path/to/a/car_photo.jpg
```
(reads `DEPTH_ENDPOINT_URL` + `DEPTH_TOKEN` from `.env.local`).

## Request / response

POST JSON:
```json
{ "image": "<base64 or data: URL>",
  "focalPx": 1400,
  "regions": [{ "name": "left front tire", "x1": 120, "y1": 400, "x2": 520, "y2": 760 }] }
```
- `focalPx` (optional): focal length in **pixels** from the photo's EXIF →
  returns **metric meters**. Without it you get **relative** depth (ratios still
  valid; good for "is this bulged/flat/closer", not absolute mm).
- `regions` (optional): bboxes to measure (later these come from SAM 3 masks).

Returns `{ overall:{nearest,farthest,median}, regions:[{name,median,min,max,unit}], unit, note }`.

## What depth does / doesn't do (set expectations)

- **Great for:** macro geometry — sidewall bulge vs flat, dent depth, panel-gap
  and puddle size, "is the car sitting low", relative closeness. This is the
  accuracy win that makes the photo diagnosis trustworthy enough to charge for.
- **Not for:** sub-millimeter tread depth (monocular metric depth can't resolve
  ~1mm grooves). Tread still routes to the penny/quarter test. Keep that honest.

## Next phases (same Modal app pattern)
- **1b:** SAM 3 segmentation endpoint → returns the part mask → feeds `regions` here.
- **3:** SAM 3D Objects endpoint → Gaussian splat (.ply) for the 3D/explode work.
