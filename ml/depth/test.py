"""
Quick local test for the au7o depth endpoint.

Usage:  python ml/depth/test.py path/to/car_photo.jpg
Reads DEPTH_ENDPOINT_URL + DEPTH_TOKEN from .env.local (or the environment).
Tries to pull the focal length (in pixels) from the photo's EXIF so you get
metric meters; falls back to relative depth if it can't.
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


def focal_px_from_exif(path, img_w):
    """Estimate focal length in pixels from EXIF FocalLengthIn35mmFilm."""
    try:
        from PIL import Image, ExifTags

        img = Image.open(path)
        exif = img._getexif() or {}
        tag = {v: k for k, v in ExifTags.TAGS.items()}.get("FocalLengthIn35mmFilm")
        f35 = exif.get(tag) if tag else None
        if f35:
            # 35mm-equivalent sensor width is 36mm; focal_px = f35/36 * image_width
            return round(float(f35) / 36.0 * img_w)
    except Exception:
        pass
    return None


def main():
    if len(sys.argv) < 2:
        print("usage: python ml/depth/test.py <image>")
        sys.exit(1)
    load_env()
    url = os.environ.get("DEPTH_ENDPOINT_URL")
    token = os.environ.get("DEPTH_TOKEN")
    if not url:
        print("DEPTH_ENDPOINT_URL not set (deploy the Modal app first).")
        sys.exit(1)

    path = sys.argv[1]
    raw = open(path, "rb").read()
    b64 = base64.b64encode(raw).decode()

    img_w = None
    try:
        from PIL import Image

        img_w = Image.open(path).width
    except Exception:
        pass
    focal = focal_px_from_exif(path, img_w) if img_w else None

    payload = {"image": b64, "token": token}
    if focal:
        payload["focalPx"] = focal
    print(f"POST {url}  (focalPx={focal or 'none -> relative'})")

    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        print(json.dumps(json.load(r), indent=2))


if __name__ == "__main__":
    main()
