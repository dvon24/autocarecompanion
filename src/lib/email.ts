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

function fromAddress(): string {
  return process.env.FROM_EMAIL || 'Au7o <onboarding@resend.dev>';
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Where replies from the recipient should go (e.g. a founder replying to
   *  feedback wants the user's response routed back to their inbox). */
  replyTo?: string;
}

/** Returns true if the send appeared to succeed (or was a no-op in dev). */
export async function sendEmail({ to, subject, html, text, replyTo }: SendArgs): Promise<boolean> {
  const c = client();
  if (!c) {
    console.warn('[email] RESEND_API_KEY not set; skipping send. To:', to, 'Subject:', subject);
    return false;
  }
  try {
    const result = await c.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (result.error) {
      console.error('[email] Resend error:', result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] send threw:', err);
    return false;
  }
}

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
