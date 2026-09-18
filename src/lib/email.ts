/**
 * Resend email helper.
 *
 * Wraps the Resend SDK so the rest of the app can send transactional
 * email without re-importing/configuring per call. Honors env vars:
 *
 *   RESEND_API_KEY  — required to actually send (no-ops if missing,
 *                     logs to console so dev/preview deploys don't
 *                     blow up).
 *   FROM_EMAIL      — sender address; falls back to "Au7o
 *                     <onboarding@resend.dev>" which works for testing
 *                     but should be replaced with a verified domain.
 *   APP_URL         — used to build links inside emails (e.g.
 *                     password reset URLs).
 */

import { Resend } from 'resend';
import { isSuppressed } from '@/lib/email-suppression';
import { stagingRecipientAllowed } from '@/lib/staging-email-policy';
import type { ReadyInvitationInlineAttachment } from '@/lib/twin-ready-invitation-artwork';

let _resend: Resend | null = null;
function client(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export function appUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://au7o.io'
  );
}

/**
 * The sender address, normalized so a slightly-malformed FROM_EMAIL env value
 * (stray whitespace/quotes, or a bare "Name email@x.com" missing the angle
 * brackets) can't break every send with Resend's "Invalid `from` field" error.
 * Accepts "email@x.com" or "Name <email@x.com>"; otherwise extracts the email
 * and wraps it; falls back to the Resend test sender only if there's no email.
 */
function fromAddress(): string {
  const raw = (process.env.FROM_EMAIL || '').trim().replace(/^["']|["']$/g, '');
  const bare = /^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/;
  const named = /^.+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/;
  if (bare.test(raw) || named.test(raw)) return raw;
  const m = raw.match(/[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+/);
  if (m) return `Au7o <${m[0]}>`;
  return 'Au7o <onboarding@resend.dev>';
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Where replies from the recipient should go (e.g. a founder replying to
   *  feedback wants the user's response routed back to their inbox). */
  replyTo?: string;
  idempotencyKey?: string;
  /** Prepared invitation JPEG bytes; attachment preparation occurs before claiming delivery. */
  attachments?: [ReadyInvitationInlineAttachment];
  /** Invitation-only: checks suppression and email-wide consent on its held
   * transaction, probes liveness, then returns a synchronous dispatch lease.
   * Replaces the root suppression lookup to avoid acquiring a second connection. */
  invitationConsentGuard?: () => Promise<() => boolean>;
  /** Synchronous notification only after the guarded provider method is invoked. */
  onInvitationProviderInvocation?: () => void;
}

/** Returns true if the send appeared to succeed (or was a no-op in dev). */
export async function sendEmail(args: SendArgs): Promise<boolean> {
  return (await sendEmailDetailed(args)).ok;
}

/** Like sendEmail but returns the actual failure reason (for surfacing to a
 *  founder-only admin action instead of a generic "failed"). */
export function createEmailSender(deps: {
  client: () => Pick<Resend,'emails'> | null;
  isSuppressed: (email:string) => Promise<boolean>;
  recipientAllowed: (email:string) => boolean;
}) {
return async function sendDetailed({ to, subject, html, text, replyTo, idempotencyKey, attachments, invitationConsentGuard, onInvitationProviderInvocation }: SendArgs): Promise<{ ok: boolean; error?: string; providerId?: string; outcome?: 'not_sent' | 'unknown' | 'suppressed' }> {
  if (!deps.recipientAllowed(to)) {
    return { ok: false, outcome: 'not_sent', error: 'Recipient is not permitted in this isolated preview' };
  }
  const c = deps.client();
  if (!c) {
    console.warn('[email] RESEND_API_KEY not set; skipping send. To:', to, 'Subject:', subject);
    return { ok: false, outcome: 'not_sent', error: 'RESEND_API_KEY is not set in this environment' };
  }
  // Suppression chokepoint. An address that permanently bounced or filed a spam
  // complaint is never retried — each retry is charged against our sending
  // reputation, which costs delivery for every real lead. Checked here rather
  // than at each call site so no future sender can forget it. isSuppressed()
  // fails OPEN, so a DB fault can never silently swallow a password reset.
  if (!invitationConsentGuard && await deps.isSuppressed(to)) {
    console.warn('[email] suppressed address, not sending. To:', to, 'Subject:', subject);
    return { ok: false, outcome: 'suppressed', error: 'Address is on the suppression list (hard bounce or spam complaint)' };
  }
  try {
    const payload = {
      from: fromAddress(),
      to,
      subject,
      html,
      text,
      ...(attachments ? { attachments } : {}),
      // Only a valid-looking address (guards against a bad env value breaking the send).
      ...(replyTo && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(replyTo) ? { replyTo } : {}),
    };
    // Invitations perform suppression on their already-held transaction here.
    // Any future attachment/payload preparation must precede this guard.
    // No unguarded async work may occur between this final check and invocation.
    const leaseIsLive = invitationConsentGuard ? await invitationConsentGuard() : null;
    if (invitationConsentGuard && (typeof leaseIsLive !== 'function' || !leaseIsLive())) return {ok:false,outcome:'not_sent',error:'Invitation consent check expired. Review before sending again.'};
    const providerResponse = c.emails.send(payload, idempotencyKey ? { idempotencyKey } : undefined);
    // Invocation has happened synchronously under the live lease. Release consent
    // now; the exact same response promise is still awaited and reconciled below.
    let signalFailed=false;
    try { if(invitationConsentGuard)onInvitationProviderInvocation?.(); } catch { signalFailed=true; }
    const result = await providerResponse;
    if(signalFailed)return {ok:false,outcome:'unknown',providerId:result.data?.id,error:'Invocation notification failed; delivery requires reconciliation.'};
    if (result.error) {
      const e = result.error as { message?: string; name?: string; statusCode?: number | null };
      const msg = e.message || e.name || JSON.stringify(result.error);
      console.error('[email] Resend error:', result.error);
      // The SDK returns network failures as application_error/statusCode:null.
      // Only explicit client rejections prove that no message was accepted.
      const definitelyRejected = typeof e.statusCode === 'number' && [400, 401, 403, 404, 405, 413, 422, 429].includes(e.statusCode);
      return { ok: false, outcome: definitelyRejected ? 'not_sent' : 'unknown', error: msg };
    }
    if (!result.data?.id) return { ok: false, outcome: 'unknown', error: 'Email acceptance could not be confirmed' };
    return { ok: true, providerId: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] send threw:', err);
    return { ok: false, outcome: 'unknown', error: msg };
  }
};
}
export const sendEmailDetailed = createEmailSender({
  client,
  isSuppressed,
  recipientAllowed: to => stagingRecipientAllowed(to, process.env.AU7O_STAGING_EMAIL_ALLOWLIST),
});

/**
 * Build the HTML body of the password-reset email. Kept here so the
 * template lives next to the send helper.
 */
export function passwordResetEmail(resetLink: string, expiresInMin: number = 60): { html: string; text: string } {
  const text = `Reset your Au7o password

Click the link below to set a new password. This link expires in ${expiresInMin} minutes
and can be used only once.

${resetLink}

If you didn't request a password reset, you can safely ignore this email.

— Au7o`;

  const html = `<!doctype html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#0b1220; background:#f7f6f2; padding:24px;">
  <div style="max-width:480px; margin:0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:24px;">
    <h2 style="margin:0 0 12px; font-size:18px;">Reset your Au7o password</h2>
    <p style="margin:0 0 16px; color:#475569; line-height:1.5;">
      Click the button below to set a new password. This link expires in
      ${expiresInMin} minutes and can only be used once.
    </p>
    <p style="margin:0 0 20px;">
      <a href="${resetLink}" style="display:inline-block; background:#0b1220; color:#fff; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:600;">
        Reset password
      </a>
    </p>
    <p style="margin:0 0 8px; color:#64748b; font-size:12px;">
      If the button doesn't work, paste this URL into your browser:
    </p>
    <p style="margin:0 0 16px; word-break:break-all;">
      <a href="${resetLink}" style="color:#2563eb; font-size:12px;">${resetLink}</a>
    </p>
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;">
    <p style="margin:0; color:#94a3b8; font-size:12px;">
      Didn't request a reset? You can safely ignore this email — no changes
      have been made to your account.
    </p>
  </div>
</body>
</html>`;
  return { html, text };
}
