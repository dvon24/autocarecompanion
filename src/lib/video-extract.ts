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

  // Load the video into a hidden HTMLVideoElement.
  const url = URL.createObjectURL(file);
  const video = await loadVideo(url);
  const rawDuration = Number.isFinite(video.duration) ? video.duration : 0;
  const duration = Math.min(rawDuration, MAX_VIDEO_SECONDS);

  if (duration <= 0) {
    URL.revokeObjectURL(url);
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
  video.remove?.();

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
    // iOS Safari requires these to allow programmatic seek + read.
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.src = src;
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onErr);
    };
    const onMeta = () => { cleanup(); resolve(video); };
    const onErr = () => { cleanup(); reject(new Error('video load failed')); };
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('error', onErr);
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
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    // Some browsers don't fire 'seeked' if the target is already the
    // current time — guard with a small offset.
    video.currentTime = Math.max(0, t);
  });
}

/**
 * Pull audio out of the video via MediaElementAudioSource + MediaRecorder.
 *
 * The pattern: silently "play" the video into a MediaElementAudioSourceNode,
 * route its output into a MediaStreamDestinationNode (no speakers), and
 * MediaRecorder captures the stream into a webm/opus Blob.
 *
 * Constraints:
 *   - Video element MUST have crossOrigin='anonymous' set BEFORE src
 *     (handled by loadVideo) or MediaElementAudioSource throws "tainted".
 *   - Only works on iOS Safari 14.1+; we catch and return null for older.
 *   - Plays back at 1x — a 20s video takes 20s to extract. Acceptable
 *     for MVP; future iteration could use OfflineAudioContext with
 *     decodeAudioData for instant extraction.
 */
async function extractAudio(file: File): Promise<File | null> {
  if (!('MediaRecorder' in window) || typeof AudioContext === 'undefined') {
    return null;
  }
  const supportedMime = pickAudioMime();
  if (!supportedMime) return null;

  const url = URL.createObjectURL(file);
  try {
    const video = await loadVideo(url);
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(video);
    const dest = ctx.createMediaStreamDestination();
    source.connect(dest);

    const recorder = new MediaRecorder(dest.stream, { mimeType: supportedMime });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    const finished = new Promise<Blob>((resolve, reject) => {
      const timer = setTimeout(() => {
        try { recorder.stop(); } catch { /* */ }
        reject(new Error('audio extract timeout'));
      }, AUDIO_CAPTURE_TIMEOUT_MS);
      recorder.onstop = () => {
        clearTimeout(timer);
        resolve(new Blob(chunks, { type: supportedMime }));
      };
      recorder.onerror = (e) => {
        clearTimeout(timer);
        reject(new Error(`MediaRecorder error: ${(e as ErrorEvent).message || 'unknown'}`));
      };
    });

    recorder.start();
    // Play the video so audio flows through the source node. Muted
    // means no speaker output. We stop the recorder on 'ended'.
    video.muted = true;
    await video.play().catch(() => { /* play may reject if autoplay blocked */ });
    video.addEventListener('ended', () => { try { recorder.stop(); } catch { /* */ } }, { once: true });

    const blob = await finished;
    try { await ctx.close(); } catch { /* */ }
    URL.revokeObjectURL(url);

    if (blob.size < 1000) return null; // too small to be real audio

    const ext = supportedMime.includes('opus') ? 'webm' : supportedMime.includes('mp4') ? 'm4a' : 'webm';
    return new File([blob], `audio.${ext}`, { type: supportedMime, lastModified: Date.now() });
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

function pickAudioMime(): string | null {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch { /* not supported */ }
  }
  return null;
}
