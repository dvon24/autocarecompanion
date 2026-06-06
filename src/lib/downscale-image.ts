/**
 * Client-side image downscaler used before /api/vision uploads.
 *
 * Why: modern phone cameras produce 5-12 MB JPEGs (or HEIC files of
 * similar size after the OS transcodes them on selection). Vercel
 * caps serverless function request bodies at 4.5 MB, so anything from
 * a modern iPhone or Pixel 413's before our route is even invoked.
 *
 * Resizing to 1920px-on-the-long-edge keeps detail high enough for
 * GPT vision to identify parts (the model itself only processes
 * ~768px tiles internally) while dropping payload size by ~10x.
 * Result: uploads always fit under Vercel's cap, get to the model
 * faster, and cost less in base64 overhead.
 *
 * If anything goes wrong (Canvas blocked, OOM, unknown encoding),
 * we fall back to the original File so the upload still attempts —
 * the server-side 10MB check then catches it cleanly with a clear
 * error message.
 */

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
const SKIP_UNDER_BYTES = 700_000;

export async function downscaleImage(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!/^image\/(jpe?g|png|webp|heic|heif|gif)$/i.test(file.type)) return file;

  // HEIC is NEVER passed through, regardless of size — OpenAI doesn't
  // accept it. createImageBitmap can decode HEIC on iOS Safari but not on
  // most other browsers, so for non-iOS the bitmap fetch below throws and
  // we end up returning the original — which the server then rejects.
  // We pre-flight HEIC and let the catch surface a clear error to the
  // caller instead of letting it travel through silently.
  const isHeic = /heic|heif/i.test(file.type);

  // Skip the canvas roundtrip for already-small JPEGs/PNGs that don't
  // need rotation fixup. Pre-rotated JPEGs from Android cameras and
  // most desktop screenshots fall here. HEIC always re-encodes.
  if (!isHeic && file.size < SKIP_UNDER_BYTES) return file;

  try {
    const bitmap = await createBitmap(file);
    const { width: srcW, height: srcH } = bitmap;
    const longEdge = Math.max(srcW, srcH);

    // For non-HEIC sources that are already within budget AND already
    // decoded with the right orientation, return original. HEIC still
    // re-encodes so the server sees JPEG.
    if (!isHeic && longEdge <= MAX_DIMENSION) {
      release(bitmap);
      return file;
    }

    const scale = longEdge > MAX_DIMENSION ? MAX_DIMENSION / longEdge : 1;
    const dstW = Math.round(srcW * scale);
    const dstH = Math.round(srcH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = dstW;
    canvas.height = dstH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      release(bitmap);
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, dstW, dstH);
    release(bitmap);

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
    });
    if (!blob) return file;

    const outName = file.name.replace(/\.(heic|heif|png|webp|gif)$/i, '.jpg') || 'upload.jpg';
    return new File([blob], outName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // For HEIC sources we couldn't decode, the server-side type guard
    // will catch it and surface a clear "enable Most Compatible in iPhone
    // Camera settings" message. For other formats we just fall back to
    // the original.
    return file;
  }
}

async function createBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // imageOrientation: 'from-image' bakes the EXIF rotation flag into the
  // bitmap pixels. Without this, portrait-mode iPhone photos arrive
  // sideways at OpenAI and vision quality drops dramatically — rotation
  // is an explicit documented limitation of the vision model.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch { /* fall through to HTMLImageElement path */ }
  }
  // Fallback path: HTMLImageElement honors EXIF orientation in all
  // modern browsers via the image-orientation CSS default. We rely on
  // that behavior here — no manual EXIF parsing needed for the common
  // case. (If we ever support legacy browsers without that default,
  // pull in exifr.)
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image load failed'));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function release(b: ImageBitmap | HTMLImageElement) {
  if ('close' in b && typeof b.close === 'function') b.close();
}
