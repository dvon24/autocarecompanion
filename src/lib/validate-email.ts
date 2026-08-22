import { promises as dns } from 'dns';

/**
 * Lead-capture email validation.
 *
 * Background (2026-08-21): /api/interest accepted anything containing "@". A
 * visitor annoyed at the AI submitted `fuck@off.now` on the Audi A6 page. The
 * cost of junk here is not the row — it is that the weekly digest then tries to
 * deliver to it, and a hard bounce is charged against our Resend sending
 * reputation, which degrades delivery for the real 170+ leads.
 *
 * Two independent checks, because they stop different things:
 *
 *   1. JUNK LOCAL PART — what actually stops the troll. Note that `off.now` is
 *      a REAL registered domain (Dynadot nameservers, a live MX) and `.now` is
 *      a live Amazon gTLD, so no amount of DNS work rejects `fuck@off.now`.
 *      Only the local part gives it away.
 *   2. DNS — proves the domain can receive mail. This catches invented domains
 *      and ordinary typos ("gmial.com"), which is the far more common case and
 *      the one that silently loses REAL leads.
 *
 * DELIBERATE LIMIT: neither check proves the MAILBOX exists or that the
 * submitter owns it. `notmyemail@gmail.com` passes and always will. Only
 * double opt-in closes that, and it is not worth the drop in a capture rate
 * that is currently the only converting step in the funnel. The right
 * complement is a Resend hard-bounce webhook that suppresses an address after
 * its first failed delivery — that protects sending reputation without asking
 * the visitor for anything.
 */

// Deliberately stricter than RFC 5322 (which permits quoted local parts and
// bracketed IP domains that no lead-capture form should ever see): one @, no
// whitespace, a dotted domain, and a TLD of at least two letters.
const SYNTAX = /^[^\s@]{1,64}@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

// Throwaway providers. Short on purpose — a long blocklist is a maintenance
// treadmill, and the DNS check already removes the invented domains. These are
// the handful common enough to be worth a hardcoded line.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'yopmail.com', '10minutemail.com',
  'tempmail.com', 'temp-mail.org', 'throwawaymail.com', 'trashmail.com',
  'sharklasers.com', 'getnada.com', 'maildrop.cc', 'fakeinbox.com',
  'dispostable.com', 'mailnesia.com', 'spamgourmet.com', 'mintemail.com',
]);

// Junk local parts, matched EXACTLY after stripping separators and digits —
// never as a substring. Substring matching would hit the Scunthorpe problem and
// reject real people: assange@, cummings@, dickinson@, hancock@ all contain a
// banned string. Exact matching costs nothing and is safe.
const JUNK_LOCAL = new Set([
  'fuck', 'fuckoff', 'fuckyou', 'fuckthis', 'gofuckyourself', 'shit', 'bullshit',
  'asshole', 'arsehole', 'bollocks', 'piss', 'pissoff', 'wanker', 'cunt',
  'nothanks', 'nope', 'noway', 'none', 'noemail', 'noneofyourbusiness', 'nunya',
  'asdf', 'asdfasdf', 'qwerty', 'aaaa', 'xxxx', 'test', 'testtest', 'fake',
  'idontcare', 'whocares', 'leavemealone', 'stopit', 'goaway', 'anonymous',
]);

// Domains that only ever appear as part of a joke address.
const JUNK_DOMAIN = new Set(['off.now', 'fuckoff.com', 'nowhere.com', 'nothing.com', 'example.com', 'test.com']);

const DNS_TIMEOUT_MS = 3000;

// Vercel's resolver works; a dev machine pointing at 127.0.0.1 with nothing
// listening does not, and every lookup then fails open (harmless, but it means
// the DNS half is untestable locally). Set EMAIL_DNS_SERVERS="1.1.1.1,8.8.8.8"
// to pin public resolvers when you need to verify this path.
function resolver() {
  const pinned = (process.env.EMAIL_DNS_SERVERS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const r = new dns.Resolver();
  if (pinned.length > 0) r.setServers(pinned);
  return r;
}

export interface EmailCheck {
  ok: boolean;
  /** Safe to show a visitor verbatim — never leaks why beyond the address. */
  reason?: string;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('ETIMEOUT')), ms).unref?.(),
    ),
  ]);
}

/** DNS error codes that mean "this domain genuinely does not exist". Anything
 *  else (SERVFAIL, timeout, refused) is our problem, not the visitor's. */
const NO_SUCH_DOMAIN = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN']);

function isNoSuchDomain(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return typeof code === 'string' && NO_SUCH_DOMAIN.has(code);
}

/**
 * Can this domain receive mail? MX first, then A/AAAA — RFC 5321 §5.1 lets a
 * host with an address record but no MX accept mail, and a few small business
 * domains in the current lead list are configured exactly that way.
 */
async function domainAcceptsMail(domain: string): Promise<EmailCheck> {
  const r = resolver();
  try {
    const mx = await withTimeout(r.resolveMx(domain), DNS_TIMEOUT_MS);
    if (mx && mx.length > 0) return { ok: true };
  } catch (err) {
    if (!isNoSuchDomain(err)) return { ok: true }; // FAIL OPEN: DNS blip must never cost a real lead
  }
  try {
    await withTimeout(r.resolve4(domain), DNS_TIMEOUT_MS);
    return { ok: true };
  } catch (err) {
    if (!isNoSuchDomain(err)) return { ok: true };
  }
  try {
    await withTimeout(r.resolve6(domain), DNS_TIMEOUT_MS);
    return { ok: true };
  } catch (err) {
    if (!isNoSuchDomain(err)) return { ok: true };
  }
  return { ok: false, reason: 'That email domain does not exist — check the spelling.' };
}

/**
 * Validate a submitted address. Returns a visitor-safe `reason` on failure.
 * Expects a raw submission; normalization is the caller's job.
 */
export async function validateEmailAddress(raw: unknown): Promise<EmailCheck> {
  if (typeof raw !== 'string') return { ok: false, reason: 'Enter a valid email address.' };
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 320) {
    return { ok: false, reason: 'Enter a valid email address.' };
  }
  if (!SYNTAX.test(email)) return { ok: false, reason: 'Enter a valid email address.' };

  const at = email.lastIndexOf('@');
  const domain = email.slice(at + 1);
  // Strip separators and trailing digits so fuck.off / fuck_off / fuck123 all
  // reduce to the same token. Still an EXACT match, never a substring.
  const localToken = email.slice(0, at).replace(/[._+-]/g, '').replace(/\d+$/, '');

  if (JUNK_LOCAL.has(localToken) || JUNK_DOMAIN.has(domain)) {
    return { ok: false, reason: 'Please enter a real email address if you want the alerts.' };
  }
  if (DISPOSABLE.has(domain)) {
    return { ok: false, reason: 'Please use an address you actually check — alerts are sent by email.' };
  }
  return domainAcceptsMail(domain);
}
