/**
 * Client-side video processing for the multimodal /api/vision flow.
 *
 * The video-upload path sends:
 *   - 3-5 still frames sampled evenly across the clip → input_image
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
const MAX_VIDEO_SECONDS = 30;
const AUDIO_CAPTURE_TIMEOUT_MS = 35_000;
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

  const frames: File[] = [];
  for (let i = 0; i < stamps.length; i++) {
    try {
      const frame = await captureFrameAt(video, stamps[i], i);
      if (frame) frames.push(frame);
    } catch {
      /* skip individual frame failures, keep going */
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

async function captureFrameAt(video: HTMLVideoElement, t: number, idx: number): Promise<File | null> {
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

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', FRAME_JPEG_QUALITY);
  });
  if (!blob) return null;
  return new File([blob], `frame_${idx}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
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
    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      try {
        const maybePromise = ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
        if (maybePromise && typeof (maybePromise as Promise<AudioBuffer>).then === 'function') {
          (maybePromise as Promise<AudioBuffer>).then(resolve).catch(reject);
        }
      } catch (err) {
        reject(err);
      }
    });
    try { await ctx.close(); } catch { /* */ }

    if (audioBuffer.duration < 0.3) return null;

    // Re-encode to mono 16kHz WAV — Whisper's optimal input.
    // Downmix multi-channel to mono by averaging samples.
    const targetSampleRate = 16_000;
    const ratio = audioBuffer.sampleRate / targetSampleRate;
    const outLen = Math.floor(audioBuffer.length / ratio);
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
