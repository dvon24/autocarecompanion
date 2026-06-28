"""
Smoke test for the au7o SAM 3D endpoint.
  python ml/sam3d/test.py path/to/image.jpg
Reads SAM3D_ENDPOINT_URL + DEPTH_TOKEN from .env.local. Sends the image (no mask
=> whole-frame fallback), saves the returned Gaussian splat to ml/sam3d/out.ply.
First call cold-starts + downloads gated weights — be patient (can be minutes).
"""
import base64
import json
import os
import sys
import urllib.request


def load_env():
    for path in (".env.local", ".env"):
        if os.path.exists(path):
            for line in open(path, encoding="utf-8"):
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"'))


def main():
    if len(sys.argv) < 2:
        print("usage: python ml/sam3d/test.py <image>")
        sys.exit(1)
    load_env()
    url = os.environ.get("SAM3D_ENDPOINT_URL")
    token = os.environ.get("DEPTH_TOKEN")
    if not url:
        print("SAM3D_ENDPOINT_URL not set in .env.local")
        sys.exit(1)

    b64 = base64.b64encode(open(sys.argv[1], "rb").read()).decode()
    payload = {"image": b64, "token": token, "seed": 42}
    print(f"POST {url}  (cold start downloads weights; be patient)")
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=900) as r:
        data = json.load(r)
    if not data.get("ok"):
        print("response:", json.dumps(data)[:600])
        return
    ply = base64.b64decode(data["ply_b64"])
    out = os.path.join("ml", "sam3d", "out.ply")
    open(out, "wb").write(ply)
    print(f"OK — splat {data.get('bytes')} bytes saved to {out}")


if __name__ == "__main__":
    main()
