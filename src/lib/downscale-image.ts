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
const SKIP_UNDER_BYTES = 1_500_000;

export async function downscaleImage(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (file.size < SKIP_UNDER_BYTES) return file;
  if (!/^image\/(jpe?g|png|webp|heic|heif)$/i.test(file.type)) return file;

  try {
    const bitmap = await createBitmap(file);
    const { width: srcW, height: srcH } = bitmap;
    const longEdge = Math.max(srcW, srcH);

    if (longEdge <= MAX_DIMENSION) {
      release(bitmap);
      return file;
    }

    const scale = MAX_DIMENSION / longEdge;
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

    const outName = file.name.replace(/\.(heic|heif|png|webp)$/i, '.jpg') || 'upload.jpg';
    return new File([blob], outName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

async function createBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch { /* fall through to HTMLImageElement path */ }
  }
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
