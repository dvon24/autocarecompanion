/**
 * Client-side image-quality assessment for the diagnose flow.
 *
 * A dark, blurry, or tiny photo is a leading cause of the vision model
 * inventing defects (e.g. a false "replace tires" / phantom bulge). This
 * computes two cheap, standard metrics on a downscaled copy — mean luma
 * (brightness) and Laplacian variance (focus/sharpness) — so the UI can
 * warn the user to retake BEFORE the photo reaches the model.
 *
 * Advisory only: thresholds are deliberately conservative (warn only on
 * clearly-bad input) and the warning never BLOCKS — the user may know
 * better, and a hard block on a borderline photo is its own bad UX. This
 * is the photo counterpart to video-extract.ts's best-frame selection.
 * No GPU, no upload, no new infra — runs entirely in the browser.
 */

export interface ImageQuality {
  brightness: number; // 0-255 mean luma
  sharpness: number; // Laplacian variance (higher = sharper)
  level: 'ok' | 'dark' | 'blurry' | 'small';
  /** Advisory message when level !== 'ok'; undefined when ok. */
  message?: string;
}

const OK: ImageQuality = { brightness: 128, sharpness: 999, level: 'ok' };

export async function assessImageQuality(file: File): Promise<ImageQuality> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return OK;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
    if (!longEdge) return OK;

    // Analyse a small copy — fast and the metrics are scale-stable enough.
    const scale = Math.min(1, 256 / longEdge);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || w < 3 || h < 3) return OK;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    const gray = new Float32Array(w * h);
    let bSum = 0;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray[p] = g;
      bSum += g;
    }
    const brightness = bSum / (w * h);

    let sum = 0;
    let sumSq = 0;
    let n = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const lap = 4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - w] - gray[idx + w];
        sum += lap;
        sumSq += lap * lap;
        n++;
      }
    }
    const lapMean = n ? sum / n : 0;
    const sharpness = n ? sumSq / n - lapMean * lapMean : 999;

    // Conservative thresholds — only flag clearly-bad input.
    if (longEdge < 400) {
      return { brightness, sharpness, level: 'small', message: 'This photo is low-resolution — move closer or use a higher-quality camera setting for a reliable read.' };
    }
    if (brightness < 42) {
      return { brightness, sharpness, level: 'dark', message: 'Looks dark — for a reliable read, add light or use your flash and retake. You can still diagnose.' };
    }
    if (sharpness < 35) {
      return { brightness, sharpness, level: 'blurry', message: 'Looks blurry — hold steady, tap to focus, and retake. You can still diagnose.' };
    }
    return { brightness, sharpness, level: 'ok' };
  } catch {
    return OK;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image-quality: load failed'));
    img.src = src;
  });
}
