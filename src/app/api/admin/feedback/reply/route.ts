import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { sendEmailDetailed } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/admin/feedback/reply  { id, message }  — founder-only.
 *
 * Sends a personal reply to the feedback submitter FROM au7o's verified sender
 * (so the founder can respond in-app instead of via a mailto handoff). The
 * user's response routes back to FEEDBACK_NOTIFY_EMAIL (or the founder) via
 * replyTo. Best-effort send; requires RESEND_API_KEY + FROM_EMAIL.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  const founderEmail = session?.user?.email;
  if (!isFounderEmail(founderEmail)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  let id: string | undefined;
  let message: string | undefined;
  try { ({ id, message } = await request.json()); } catch { /* */ }
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'missing id' }, { status: 400 });
  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
  }

  const fb = await prisma.feedback.findUnique({ where: { id }, select: { email: true, message: true, kind: true } });
  if (!fb) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (!fb.email) return NextResponse.json({ error: 'That feedback has no email to reply to' }, { status: 400 });

  const reply = message.trim().slice(0, 5000);
  const safeReply = reply.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const quoted = String(fb.message || '').slice(0, 2000).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // NEVER expose the founder's personal email. Only use a dedicated support
  // address if one is configured (FEEDBACK_NOTIFY_EMAIL); otherwise omit
  // reply-to entirely so replies default to the au7o FROM address (alerts@au7o.io).
  const replyTo = process.env.FEEDBACK_NOTIFY_EMAIL || undefined;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0b1220;background:#f7f6f2;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
    <p style="margin:0 0 14px;color:#0b1220;line-height:1.55;white-space:pre-wrap">${safeReply}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0;">
    <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;">You wrote to au7o:</p>
    <blockquote style="margin:0;padding:8px 12px;border-left:3px solid #e5e7eb;color:#64748b;font-size:13px;white-space:pre-wrap">${quoted}</blockquote>
    <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;">— The au7o team</p>
  </div></body></html>`;
  const text = `${reply}\n\n— The au7o team\n\n---\nYou wrote to au7o:\n${String(fb.message || '').slice(0, 2000)}`;

  const { ok, error } = await sendEmailDetailed({
    to: fb.email,
    subject: 'Re: your au7o feedback',
    html,
    text,
    replyTo,
  });
  // Founder-only endpoint, so it's safe to surface the real Resend error.
  if (!ok) return NextResponse.json({ error: `Send failed: ${error || 'unknown'}` }, { status: 502 });

  return NextResponse.json({ success: true });
}
