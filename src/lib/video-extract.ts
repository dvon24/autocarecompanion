/**
 * Client-side video processing for the multimodal /api/vision flow.
 *
 * The video-upload path sends:
 *   - N still frames, one per evenly-spaced slot, each the SHARPEST of a
 *     few candidates in that slot (Laplacian-variance best-frame selection
 *     drops motion-blurred frames that make the model hallucinate) → input_image
 *   - The audio track extracted and re-encoded → Whisper transcribes
 *     server-side → transcript injected into the gpt-5.5 prompt
 *
 * Why client-side: video files from iPhone are routinely 50-200MB.
 * Sending them to the server hits Vercel's 4.5MB body cap before the
 * route even runs. Extracting frames + audio in the browser gets the
 * upload payload to <2MB while keeping the diagnostic detail.
 *
 * Privacy: nothing is stored. Frames + audio live as in-memory Blobs
 * until upload, then get garbage-collected. Same posture as
 * src/lib/downscale-image.ts.
 */

const FRAME_MAX_DIMENSION = 1024;
const FRAME_JPEG_QUALITY = 0.82;
const MAX_VIDEO_SECONDS = 15; // we sample frames + transcribe only the first 15s (Devon: cap clips short)
const AUDIO_CAPTURE_TIMEOUT_MS = 14_000; // bounded so frames(≤~28s)+audio fits the 45s overall race
const VIDEO_LOAD_TIMEOUT_MS = 12_000;
const SEEK_TIMEOUT_MS = 4_000;
const OVERALL_EXTRACT_TIMEOUT_MS = 45_000;

export interface VideoExtractResult {
  frames: File[];
  audio: File | null;
  durationSeconds: number;
  /** True when audio extraction succeeded; false on browser unsupported
   *  paths so the caller can fall back to frames-only. */
  audioOk: boolean;
}

/**
 * Extract N evenly-spaced still frames + the audio track from a video
 * file. Caller passes the File from <input type="file"> or a camera
 * capture; we return frames as JPEG Files (ready for /api/vision
 * multipart) and audio as a single WebM/Opus File.
 */
export async function extractVideoFrames(
  file: File,
  frameCount = 4,
): Promise<VideoExtractResult> {
  if (typeof window === 'undefined') {
    throw new Error('video-extract: server-side call');
  }

  // Hard wall-clock timeout on the whole extraction so a stuck
  // HEVC decode or never-fired 'seeked' event surfaces as an error
  // instead of pinning the spinner forever.
  return Promise.race([
    extractVideoFramesInner(file, frameCount),
    new Promise<VideoExtractResult>((_, reject) =>
      setTimeout(() => reject(new Error('extraction timed out — try a shorter clip or a different format (MP4 if possible)')), OVERALL_EXTRACT_TIMEOUT_MS),
    ),
  ]);
}

async function extractVideoFramesInner(
  file: File,
  frameCount: number,
): Promise<VideoExtractResult> {
  const startedAt = performance.now();
  const url = URL.createObjectURL(file);
  const video = await loadVideo(url);
  const rawDuration = Number.isFinite(video.duration) ? video.duration : 0;
  const duration = Math.min(rawDuration, MAX_VIDEO_SECONDS);

  if (duration <= 0) {
    URL.revokeObjectURL(url);
    if (video.parentNode) video.parentNode.removeChild(video);
    throw new Error('video-extract: could not read duration');
  }

  // Sample frame timestamps. Skip the first 5% and last 5% — those
  // tend to be black frames or motion-blur transitions.
  const margin = Math.max(0.1, duration * 0.05);
  const usableDuration = Math.max(0.1, duration - margin * 2);
  const stamps: number[] = [];
  for (let i = 0; i < frameCount; i++) {
    const t = margin + (usableDuration * i) / Math.max(1, frameCount - 1);
    stamps.push(Math.min(t, duration - 0.05));
  }

  // Best-frame selection: for each evenly-spaced slot, sample a few
  // candidate timestamps and keep ONLY the sharpest (highest Laplacian
  // variance). A blurry frame is a leading cause of the vision model
  // inventing defects (e.g. a "sidewall bulge" that isn't there), so
  // dropping blur improves accuracy AND keeps token cost down (we encode
  // only the winner per slot, not every candidate). Winners stay spread
  // across the clip because each slot's candidates are local to it.
  const CANDIDATES_PER_SLOT = 3;
  const slotWindow = usableDuration / Math.max(1, frameCount);
  // Soft deadline: bound frame capture so a slow-seeking clip (HEVC on an old
  // phone) ships the frames it HAS by returning normally — instead of the
  // per-slot seek budget blowing the overall hard timeout, which REJECTS and
  // throws away the good frames already captured. Headroom = audio budget + ONE
  // full worst-case slot (so even a slot that starts just under the deadline
  // finishes before the overall race fires) + 2s cleanup margin.
  const frameSoftDeadlineMs = OVERALL_EXTRACT_TIMEOUT_MS - (AUDIO_CAPTURE_TIMEOUT_MS + CANDIDATES_PER_SLOT * SEEK_TIMEOUT_MS + 2_000);
  const frames: File[] = [];
  const overDeadline = () => frames.length > 0 && performance.now() - startedAt > frameSoftDeadlineMs;
  for (let i = 0; i < stamps.length; i++) {
    // Always capture the first slot; bail later slots once over the deadline.
    if (overDeadline()) break;
    let best: { canvas: HTMLCanvasElement; score: number } | null = null;
    for (let k = 0; k < CANDIDATES_PER_SLOT; k++) {
      // Also bail mid-slot so a slow slot can't overrun the deadline by ~12s.
      if (overDeadline()) break;
      const offset = (k - (CANDIDATES_PER_SLOT - 1) / 2) * (slotWindow / CANDIDATES_PER_SLOT);
      const t = Math.min(Math.max(margin, stamps[i] + offset), duration - 0.05);
      try {
        const cand = await captureFrameCandidate(video, t);
        if (cand && (!best || cand.score > best.score)) best = cand;
      } catch {
        /* skip individual candidate failures, keep going */
      }
    }
    if (best) {
      try {
        const frame = await canvasToFile(best.canvas, i);
        if (frame) frames.push(frame);
      } catch {
        /* skip encode failure */
      }
    }
  }

  // Extract audio in parallel with frame capture cleanup. Audio
  // extraction is best-effort — on iOS Safari versions that block
  // MediaElementAudioSource for security reasons, we surface
  // audioOk:false and the caller can decide whether to upload
  // frames-only.
  let audio: File | null = null;
  let audioOk = false;
  try {
    audio = await extractAudio(file);
    audioOk = !!audio;
  } catch {
    audio = null;
    audioOk = false;
  }

  URL.revokeObjectURL(url);
  if (video.parentNode) video.parentNode.removeChild(video);

  return {
    frames,
    audio,
    durationSeconds: duration,
    audioOk,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    // iOS Safari requires muted+playsInline to allow programmatic
    // play() + read. DO NOT set crossOrigin on blob URLs — it puts
    // the element into a tainted state that prevents canvas draw
    // (and on some Safari versions blocks loadedmetadata entirely).
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('webkit-playsinline', 'true');
    // Position offscreen but ATTACH to DOM. iOS Safari does not fire
    // loadedmetadata on detached <video> elements with HEVC MOV
    // content from iPhone — that's the bug that caused
    // extract_start with no extract_done on the user's 19MB MOV.
    video.style.position = 'fixed';
    video.style.left = '-9999px';
    video.style.top = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    video.src = src;

    let done = false;
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onErr);
      clearTimeout(timer);
    };
    const onMeta = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve(video);
    };
    const onErr = () => {
      if (done) return;
      done = true;
      cleanup();
      if (video.parentNode) video.parentNode.removeChild(video);
      reject(new Error('video load failed — format may be unsupported (try MP4)'));
    };
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      if (video.parentNode) video.parentNode.removeChild(video);
      reject(new Error('video metadata load timed out — try a shorter or different-format clip'));
    }, VIDEO_LOAD_TIMEOUT_MS);

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('error', onErr);
    // Kick the load explicitly (some Safari versions hold off when
    // preload='auto' is the default).
    try { video.load(); } catch { /* */ }
  });
}

/** Seek to t, draw the frame to a downscaled canvas, and score its
 *  sharpness — WITHOUT encoding (encoding only the winning candidate
 *  saves work). Returns the canvas + score, or null on failure. */
async function captureFrameCandidate(
  video: HTMLVideoElement,
  t: number,
): Promise<{ canvas: HTMLCanvasElement; score: number } | null> {
  await seekTo(video, t);
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  // Downscale to <=1024px longest edge to keep upload + OpenAI token
  // cost bounded. Same pattern as downscale-image.ts.
  const scale = Math.min(1, FRAME_MAX_DIMENSION / Math.max(vw, vh));
  const dw = Math.round(vw * scale);
  const dh = Math.round(vh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, dw, dh);

  let score = 0;
  try { score = laplacianVariance(ctx, dw, dh); } catch { score = 0; }
  return { canvas, score };
}

/** Encode a chosen candidate canvas to a JPEG File for /api/vision. */
async function canvasToFile(canvas: HTMLCanvasElement, idx: number): Promise<File | null> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', FRAME_JPEG_QUALITY);
  });
  if (!blob) return null;
  return new File([blob], `frame_${idx}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

/** Variance of the Laplacian — a standard, cheap focus/sharpness metric.
 *  Higher = sharper (more high-frequency edge energy); a blurry frame
 *  scores low. Computed on grayscale with a 4-neighbour Laplacian; a
 *  pixel stride keeps it fast on big frames / low-end phones. */
function laplacianVariance(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  if (w < 3 || h < 3) return 0;
  const { data } = ctx.getImageData(0, 0, w, h);
  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const stride = Math.max(1, Math.floor(Math.max(w, h) / 512)); // cap work on huge frames
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y += stride) {
    for (let x = 1; x < w - 1; x += stride) {
      const idx = y * w + x;
      const lap = 4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - w] - gray[idx + w];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener('seeked', onSeeked);
      clearTimeout(timer);
      resolve();
    };
    const onSeeked = () => finish();
    // Hard timeout — if 'seeked' never fires (HEVC quirk, codec
    // hiccup) we resolve anyway and the next captureFrameAt attempt
    // either gets the current frame or fails downstream.
    const timer = setTimeout(finish, SEEK_TIMEOUT_MS);
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Math.max(0, t);
  });
}

/**
 * Pull audio out of the video by decoding the file's raw bytes via
 * Web Audio's `decodeAudioData`, then re-encode to a small WAV blob.
 *
 * Why this approach (over the previous MediaElementAudioSource +
 * MediaRecorder path):
 *   - iPhone HEVC MOV silently failed to decode through the play()
 *     + capture path — confirmed via user trace where audioOk was
 *     false on a working 6s clip.
 *   - decodeAudioData handles iOS-native containers including MOV
 *     (it uses the same demuxer Safari uses for <audio>/<video>).
 *   - No playback required — extracts in O(filesize) time, not
 *     O(duration) like MediaRecorder.
 *   - WAV output is uncompressed but tiny for short clips: a 6s
 *     mono 16kHz clip is ~190KB. Whisper accepts WAV directly.
 *
 * Returns null on any failure so the caller can proceed
 * frames-only with audioOk:false.
 */
async function extractAudio(file: File): Promise<File | null> {
  const win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const AudioCtxCls = win.AudioContext || win.webkitAudioContext;
  if (!AudioCtxCls) return null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const ctx = new AudioCtxCls();
    // decodeAudioData with the iOS/Safari signature (returns a promise
    // on modern browsers, accepts callbacks on older). We pass a sliced
    // ArrayBuffer because some implementations consume it in-place.
    // Race the decode against a hard timeout. A hung decodeAudioData (the
    // iPhone HEVC MOV failure mode this function was written for) must NOT take
    // the whole extraction down with it — on timeout we resolve null and the
    // caller proceeds frames-only with audioOk:false, instead of the entire
    // clip's frames being thrown away by the 45s overall race.
    const decoded = await Promise.race<AudioBuffer | null>([
      new Promise<AudioBuffer>((resolve, reject) => {
        try {
          const maybePromise = ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
          if (maybePromise && typeof (maybePromise as Promise<AudioBuffer>).then === 'function') {
            (maybePromise as Promise<AudioBuffer>).then(resolve).catch(reject);
          }
        } catch (err) {
          reject(err);
        }
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), AUDIO_CAPTURE_TIMEOUT_MS)),
    ]);
    try { await ctx.close(); } catch { /* */ }
    if (!decoded) return null;
    const audioBuffer = decoded;

    if (audioBuffer.duration < 0.3) return null;

    // Re-encode to mono 16kHz WAV — Whisper's optimal input.
    // Downmix multi-channel to mono by averaging samples.
    const targetSampleRate = 16_000;
    const ratio = audioBuffer.sampleRate / targetSampleRate;
    // Cap the transcript window to the SAME span the frames cover
    // (MAX_VIDEO_SECONDS) — no point transcribing 2 minutes of audio when the
    // visual analysis only sees the first 30s. Bounds the WAV (~1MB) and keeps
    // upload + Whisper well under their timeouts.
    const outLen = Math.min(
      Math.floor(audioBuffer.length / ratio),
      MAX_VIDEO_SECONDS * targetSampleRate,
    );
    const mono = new Float32Array(outLen);
    const channels = audioBuffer.numberOfChannels;
    const channelData: Float32Array[] = [];
    for (let c = 0; c < channels; c++) channelData.push(audioBuffer.getChannelData(c));
    for (let i = 0; i < outLen; i++) {
      const srcIdx = Math.floor(i * ratio);
      let sum = 0;
      for (let c = 0; c < channels; c++) sum += channelData[c][srcIdx] || 0;
      mono[i] = sum / channels;
    }

    const wav = encodeWav(mono, targetSampleRate);
    if (wav.byteLength < 5_000) return null; // sanity check

    return new File([wav], 'audio.wav', { type: 'audio/wav', lastModified: Date.now() });
  } catch {
    return null;
  }
}

/**
 * Encode a Float32Array mono PCM buffer to a 16-bit PCM WAV file.
 * Tiny pure-JS encoder — no deps. Whisper accepts this directly.
 */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);                  // chunk size
  view.setUint16(20, 1, true);                   // PCM format
  view.setUint16(22, 1, true);                   // mono
  view.setUint32(24, sampleRate, true);          // sample rate
  view.setUint32(28, sampleRate * 2, true);      // byte rate (mono × 2 bytes)
  view.setUint16(32, 2, true);                   // block align
  view.setUint16(34, 16, true);                  // bits per sample
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // PCM samples — clamp to [-1,1] and convert to 16-bit signed.
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
