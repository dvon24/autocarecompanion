import { reservationClaimHref, reservationOfferId } from './reservation-identity';
import { signinHref } from './auth-callback';
import { escapeEmailHtml as escape } from './maintenance-alert-email';

/** Email clients do not consistently render full-size WebP artwork inline.
 * These JPEG derivatives retain the entire source frame at 600px wide. Keep
 * new owner-ready vehicles closed until their email derivative is prepared. */
export const READY_EMAIL_ARTWORK: Readonly<Record<string, string>> = Object.freeze({
  '/twin-stage/challenger/base-granite-crystal.webp': '/twin-stage/email/challenger-granite-crystal-600.jpg',
  '/twin-stage/camaro/base-summit.webp': '/twin-stage/email/camaro-summit-600.jpg',
  '/twin-stage/lincoln/base-gray.webp': '/twin-stage/email/nautilus-gray-600.jpg',
  '/twin-stage/murano/base-red.webp': '/twin-stage/email/murano-red-600.jpg',
  '/twin-stage/cadillac/base-satin-steel.webp': '/twin-stage/email/xt6-satin-steel-600.jpg',
  '/twin-stage/kicks/base-gun-metallic.webp': '/twin-stage/email/kicks-gun-metallic-600.jpg',
  '/twin-stage/acura-mdx/base-lunar-silver.webp': '/twin-stage/email/mdx-lunar-silver-600.jpg',
  '/twin-stage/lincoln-aviator/base-red-carpet.webp': '/twin-stage/email/aviator-red-carpet-600.jpg',
});

/** Shared by the remote browser preview and the server's inline-image preparation. */
export function readyEmailArtworkUrl(artwork: string, baseUrl: string): string {
  const base = new URL(baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('Invalid email origin');
  if (!Object.hasOwn(READY_EMAIL_ARTWORK, artwork)) throw new Error('No reviewed email artwork available for this twin');
  return new URL(READY_EMAIL_ARTWORK[artwork], base).href;
}

/** Shares the warm paper/table layout of the supplied maintenance email.
 * Ready offers intentionally contain no demo mileage, prices or overdue claims. */
export function twinReadyEmail(input: {
  vehicle: string;
  transmission?: 'manual' | 'automatic' | null;
  equipment?: string;
  artwork: string;
  trialDays: 7 | 30;
  baseUrl: string;
  unsubscribeToken: string;
  reservationId?: string;
}) {
  const base = new URL(input.baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('Invalid email origin');
  if (!input.artwork.startsWith('/twin-stage/') || input.artwork.includes('..')) throw new Error('Invalid twin artwork');
  const selected = reservationOfferId(input.reservationId);
  const activate = new URL('/auth/signup?product=hub&intent=reservation' + (selected ? '&reservationId=' + encodeURIComponent(selected) : ''), base).href;
  const account = new URL(signinHref(reservationClaimHref(selected)), base).href;
  const unsubscribe = new URL(`/api/reservation/unsubscribe?token=${encodeURIComponent(input.unsubscribeToken)}`, base).href;
  const image = readyEmailArtworkUrl(input.artwork, input.baseUrl);
  const transmission = input.transmission === 'manual' ? 'Manual' : input.transmission === 'automatic' ? 'Automatic' : null;
  const subject = `Your ${input.vehicle} twin is ready`;
  const text = `${subject}${transmission ? `\nTransmission: ${transmission}` : ''}\n\nYour vehicle's personal Hub is ready to activate. Your ${input.trialDays}-day complimentary access begins when you activate it, not when you receive this email. Verify the same email you reserved with, confirm your vehicle and current mileage, and start with your own service history.\n\nNo payment card is required for this invitation. It does not automatically renew or start a paid subscription. After your offer ends, you can choose Hub at $14.99/month USD.\n\nActivate your Hub: ${activate}\nAlready have an account? Sign in: ${account}\nStop reservation emails: ${unsubscribe}`;
  // Fixed table layout stops large remote/CID artwork from determining the email's
  // intrinsic width. Mobile sizing must also work when a client strips the head CSS.
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escape(subject)}</title><style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}@media(max-width:620px){.outer-pad{padding:12px 8px!important}.pad{padding:24px 20px!important}.headline{font-size:28px!important;line-height:34px!important}.offer-pad{padding:20px 16px!important}}</style></head><body style="margin:0;padding:0;width:100%;min-width:0;background:#EDEAE2;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#0B1220;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse"><tr><td class="outer-pad" align="center" style="padding:24px 12px;min-width:0">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" data-email-container width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;table-layout:fixed;border-collapse:separate;border-spacing:0;background:#FAF7F0;border:1px solid #E4DED0;border-radius:14px;overflow:hidden;overflow-wrap:anywhere;word-wrap:break-word">
<!--au7o-email-preview-slot-->
<tr><td class="pad" style="padding:28px 32px;border-bottom:1px solid #E4DED0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse"><tr><td width="30%" style="font-size:23px;line-height:28px;font-weight:800">Au<span style="color:#2563EB">7</span>o</td><td width="70%" align="right" style="font-size:14px;line-height:20px;letter-spacing:0.5px;color:#64748B">YOUR VEHICLE IS READY</td></tr></table></td></tr>
<tr><td class="pad" style="padding:30px 32px;overflow-wrap:anywhere;word-wrap:break-word;word-break:break-word"><h1 class="headline" style="font-size:30px;line-height:36px;margin:0 0 16px;overflow-wrap:anywhere;word-wrap:break-word;word-break:break-word">Your ${escape(input.vehicle)},<br>ready for you.</h1>${transmission ? `<p style="font-size:16px;line-height:25px;color:#0B1220;margin:0 0 16px;font-weight:700">Transmission: ${transmission}</p>` : ''}<p style="font-size:16px;line-height:25px;color:#536174;margin:0">Explore its parts and known issues, keep service records, and ask Au7o for help in your own Hub.</p></td></tr>
<tr><td data-email-artwork style="padding:0;background:#0A0D14;font-size:16px;line-height:24px;color:#FFFFFF;overflow-wrap:anywhere;word-wrap:break-word"><img src="${escape(image)}" alt="${escape(input.vehicle)} visual twin" width="100%" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;font-size:16px;line-height:24px;color:#FFFFFF;overflow-wrap:anywhere;word-wrap:break-word"></td></tr>
<tr><td class="pad" style="padding:28px 32px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;background:#FFFFFF;border:1px solid #E4DED0;border-radius:12px"><tr><td class="offer-pad" style="padding:22px"><p style="margin:0 0 10px;font-size:20px;line-height:28px;font-weight:700">${input.trialDays} days, on us.</p><p style="margin:0;font-size:16px;line-height:25px;color:#536174">Your access starts when you activate it. Confirm your vehicle and current mileage; your records start with the work you actually log.</p><p style="margin:14px 0 0;font-size:16px;line-height:25px">No card required. No automatic billing. At the end, you can choose Hub for <strong>$14.99/month USD</strong>.</p></td></tr></table><p style="margin:24px 0;text-align:center"><a href="${escape(activate)}" style="display:inline-block;max-width:100%;box-sizing:border-box;background:#2563EB;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:16px;line-height:24px;padding:15px 24px;border-radius:9px">Activate my Hub</a></p><p style="font-size:16px;line-height:25px;text-align:center;color:#536174;margin:0">Use the email you reserved with.<br>Already registered? <a href="${escape(account)}" style="color:#2563EB;text-decoration:underline">Sign in to your account</a>.</p></td></tr>
<tr><td class="pad" style="padding:22px 32px;border-top:1px solid #E4DED0;font-size:14px;line-height:22px;color:#64748B">You received this because you reserved a vehicle twin with Au7o.<br><a href="${escape(unsubscribe)}" style="color:#64748B;text-decoration:underline">Stop reservation emails</a> · <a href="${escape(account)}" style="color:#64748B;text-decoration:underline">Your account</a></td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  const equipment = input.equipment ? `Reviewed configuration to confirm: ${input.equipment}. If your equipment differs or is unknown, do not activate this configuration; contact Au7o. Individual VIN/build-date and installed-part checks still apply.` : '';
  return { subject,
    html:equipment ? html.replace('<!--au7o-email-preview-slot-->', `<!--au7o-email-preview-slot--><tr><td class="pad" style="padding:20px 32px;color:#0B1220;font-size:15px;line-height:24px">${escape(equipment)}</td></tr>`) : html,
    text:equipment ? `${text}\n\n${equipment}` : text,
  };
}
