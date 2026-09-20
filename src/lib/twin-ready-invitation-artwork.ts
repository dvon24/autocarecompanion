import { open } from 'node:fs/promises';
import path from 'node:path';
import { escapeEmailHtml } from './maintenance-alert-email';
import { READY_EMAIL_ARTWORK, readyEmailArtworkUrl, type twinReadyEmail } from './twin-ready-email';

export const READY_INVITATION_CONTENT_ID = 'au7o-ready-twin';
export const READY_INVITATION_MAX_ARTWORK_BYTES = 200_000;

/** Internal prepared content only: no attachment URL or caller-selected path. */
export interface ReadyInvitationInlineAttachment {
  filename: string;
  contentType: 'image/jpeg';
  content: string;
  contentId: typeof READY_INVITATION_CONTENT_ID;
}
export type ReadyInvitationMail = ReturnType<typeof twinReadyEmail> & {
  attachments?: [ReadyInvitationInlineAttachment];
};

async function loadBoundedJpeg(mappedPath: string): Promise<Buffer> {
  const file = await open(mappedPath, 'r');
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size > READY_INVITATION_MAX_ARTWORK_BYTES) throw new Error('Invalid artwork');
    // The extra byte detects a file growing after stat without an unbounded read.
    const bytes = Buffer.alloc(READY_INVITATION_MAX_ARTWORK_BYTES + 1);
    let length = 0;
    while (length < bytes.length) {
      const { bytesRead } = await file.read(bytes, length, bytes.length - length, length);
      if (!bytesRead) break;
      length += bytesRead;
    }
    return bytes.subarray(0, length);
  } finally { await file.close(); }
}

/** Node/server only. Complete before allocating a durable delivery or acquiring
 * the final consent lease. The injectable loader is for isolated failure tests. */
export async function prepareTwinReadyInvitationArtwork(input: {
  mail: ReturnType<typeof twinReadyEmail>;
  artwork: string;
  baseUrl: string;
}, deps: { loadBytes?: (mappedPath: string) => Promise<Buffer> } = {}): Promise<ReadyInvitationMail & { attachments: [ReadyInvitationInlineAttachment] }> {
  try {
    const source = readyEmailArtworkUrl(input.artwork, input.baseUrl);
    const mapped = READY_EMAIL_ARTWORK[input.artwork];
    if (!/^\/twin-stage\/email\/[a-z0-9-]+-600\.jpg$/.test(mapped)) throw new Error('Invalid artwork mapping');
    const images = input.mail.html.match(/<img\b[^>]*>/g) ?? [];
    const expected = `src="${escapeEmailHtml(source)}"`;
    if (images.length !== 1 || !images[0].startsWith(`<img ${expected} `)) throw new Error('Unexpected invitation artwork');
    const bytes = await (deps.loadBytes ?? loadBoundedJpeg)(path.join(process.cwd(), 'public', mapped.slice(1)));
    if (!Buffer.isBuffer(bytes) || bytes.length < 4 || bytes.length > READY_INVITATION_MAX_ARTWORK_BYTES
      || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff
      || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) throw new Error('Invalid JPEG');
    const inlineImage = images[0].replace(expected, `src="cid:${READY_INVITATION_CONTENT_ID}"`);
    return {
      ...input.mail,
      html: input.mail.html.replace(images[0], inlineImage),
      attachments: [{ filename: path.basename(mapped), contentType: 'image/jpeg', content: bytes.toString('base64'), contentId: READY_INVITATION_CONTENT_ID }],
    };
  } catch {
    // Do not disclose local filesystem paths, credentials, or native IO errors.
    throw new Error('Invitation artwork could not be prepared. Refresh the preview and try again.');
  }
}
