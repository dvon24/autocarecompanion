import type { MaintenanceStatusResult } from '@/lib/maintenance';
import type { SavedHubVehicle } from './hub-vehicle-selection';
import { maintenanceReminderHref } from './maintenance-reminder-entry';
import { sameTwinVehicleIdentity } from './twin-fulfillment';

export interface MaintenanceAlertEmailItem {
  vehicleId: string;
  vehicleName: string;
  currentMileage: number | null;
  vehicle?: SavedHubVehicle & { color?: string | null };
  destination?: 'hub' | 'records';
  maintenanceType: string;
  maintenanceName: string;
  lastServiceDate?: string;
  deadlineNote?: string;
  status: MaintenanceStatusResult;
}

export function escapeEmailHtml(value: unknown): string {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
const esc = escapeEmailHtml;

export function maintenanceEmailBaseUrl(value = process.env.NEXT_PUBLIC_APP_URL): string {
  try {
    const parsed = new URL(value || 'https://au7o.io');
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Unsupported origin');
    return parsed.origin;
  } catch { return 'https://au7o.io'; }
}

// Full-frame JPEG derivatives only; no different trim/color or generic-car fallback.
const EMAIL_TWINS = [
  { year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',color:'Granite Crystal Metallic',path:'/twin-stage/email/challenger-granite-crystal-600.jpg' },
  { year:2019,make:'Chevrolet',model:'Camaro',trim:'ZL1 1LE',color:'Summit White',path:'/twin-stage/email/camaro-summit-600.jpg' },
];
export function maintenanceEmailArtwork(vehicle: MaintenanceAlertEmailItem['vehicle']): string | null {
  if (!vehicle?.color) return null;
  return EMAIL_TWINS.find(twin => sameTwinVehicleIdentity(twin,vehicle) && twin.color.toLowerCase() === vehicle.color!.trim().toLowerCase())?.path ?? null;
}
const miles = (value: number | null | undefined) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.round(value).toLocaleString('en-US') + ' mi' : null;
const dateLabel = (value: Date | string | undefined) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : null;
const table = 'width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0';
const copy = 'font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#3F4A5C;overflow-wrap:anywhere;word-wrap:break-word';

export function maintenanceEmailVehicleLinks(alert: MaintenanceAlertEmailItem, origin: string) {
  const supportsHub = alert.destination === 'hub' && alert.vehicle?.id === alert.vehicleId;
  const schedule = new URL(maintenanceReminderHref(alert.vehicleId, supportsHub ? 'schedule' : 'records'), origin);
  const tree = new URL(maintenanceReminderHref(alert.vehicleId, supportsHub ? 'tree' : 'records'), origin);
  return { records: new URL(maintenanceReminderHref(alert.vehicleId, 'records'), origin).href, schedule:schedule.href, tree:tree.href, supportsHub };
}

function alertRow(alert: MaintenanceAlertEmailItem, treeUrl: string): string {
  const overdue = alert.status.status === 'overdue';
  const dueMiles = miles(alert.status.dueAtMileage);
  const dueDate = dateLabel(alert.status.dueAtDate);
  const lastDate = dateLabel(alert.lastServiceDate);
  const facts = [dueMiles ? 'Due at ' + dueMiles : null, dueDate ? 'Due ' + dueDate : null].filter(Boolean).join(' · ') + (dueMiles && dueDate ? ' — whichever comes first' : '');
  return `<tr><td style="padding-bottom:10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table};background:#FFFFFF;border:1px solid ${overdue ? '#E9DAD6' : '#E4DED0'};border-radius:11px"><tr>
<td width="4" style="width:4px;background:${overdue ? '#C0392F' : '#B8872D'};border-radius:11px 0 0 11px;font-size:0">&nbsp;</td>
<td style="padding:15px;${copy}"><a href="${esc(treeUrl)}" style="color:#0B1220;font-size:17px;line-height:25px;font-weight:bold;text-decoration:underline">${esc(alert.maintenanceName)}</a>
<p style="margin:6px 0;color:${overdue ? '#B02F27' : '#8A6D3B'}">${esc(alert.status.message)}</p>
${facts ? `<p style="margin:6px 0;font-size:14px;line-height:21px">${esc(facts)}</p>` : ''}
${lastDate ? `<p style="margin:6px 0 0;font-size:14px;line-height:21px;color:#5A6473">Last logged ${esc(lastDate)}</p>` : ''}
${alert.deadlineNote ? `<p style="margin:6px 0 0;font-size:14px;line-height:21px;color:#5A6473">${esc(alert.deadlineNote)}</p>` : ''}
${alert.status.isEstimated ? '<p style="margin:6px 0 0;font-size:14px;line-height:21px">Schedule includes an estimate.</p>' : ''}
</td></tr></table></td></tr>`;
}

/** Approved August 29 layout with saved facts, not prototype prices/milestones. */
export function renderMaintenanceAlertEmail(input: { userName:string | null; alerts:MaintenanceAlertEmailItem[]; appUrl?:string }): string {
  const origin = maintenanceEmailBaseUrl(input.appUrl);
  const actionable = input.alerts.filter(alert => ['overdue','due_soon'].includes(alert.status.status));
  const groups = new Map<string,MaintenanceAlertEmailItem[]>();
  for (const alert of actionable) {
    const rows = groups.get(alert.vehicleId) || [];
    if (!rows.some(row => row.maintenanceType === alert.maintenanceType)) rows.push(alert);
    groups.set(alert.vehicleId,rows);
  }
  const sections = [...groups.values()].map(alerts => {
    const first = alerts[0];
    const links = maintenanceEmailVehicleLinks(first,origin);
    const overdue = alerts.filter(alert => alert.status.status === 'overdue');
    const upcoming = alerts.filter(alert => alert.status.status === 'due_soon');
    const image = first.vehicle?.id === first.vehicleId ? maintenanceEmailArtwork(first.vehicle) : null;
    const odometer = miles(first.currentMileage);
    const summary = overdue.length ? `${overdue.length} item${overdue.length === 1 ? ' is' : 's are'} overdue.` : `${upcoming.length} service item${upcoming.length === 1 ? ' is' : 's are'} coming up.`;
    return `<tr><td class="pad" style="padding:26px 28px 12px;${copy}">
<h1 style="margin:0;font-size:28px;line-height:34px;letter-spacing:-.6px;color:#0B1220">${esc(summary)}</h1>
<p style="margin:12px 0 0">${esc(first.vehicleName)}${odometer ? ` · <strong>${esc(odometer)}</strong> saved odometer` : ' · Odometer not supplied'}</p></td></tr>
${image ? `<tr><td class="pad" style="padding:8px 28px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table};background:#0A0D14;border-radius:12px"><tr><td data-maintenance-artwork style="padding:0;${copy};color:#FFFFFF"><img src="${esc(new URL(image,origin).href)}" width="542" alt="${esc(first.vehicleName)} visual twin" style="display:block;width:100%!important;max-width:100%!important;height:auto!important;border:0;border-radius:11px;color:#FFFFFF;font-size:16px;line-height:24px"></td></tr></table></td></tr>` : ''}
<tr><td class="pad" style="padding:10px 28px 0;${copy}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table}">
${overdue.length ? `<tr><td style="padding:0 0 12px;font-size:14px;font-weight:bold;color:#B02F27">OVERDUE · ${overdue.length}</td></tr>${overdue.map(alert => alertRow(alert,links.tree)).join('')}` : ''}
${upcoming.length ? `<tr><td style="padding:12px 0;font-size:14px;font-weight:bold;color:#8A6D3B">THE ROAD AHEAD · ${upcoming.length}</td></tr>${upcoming.map(alert => alertRow(alert,links.tree)).join('')}` : ''}
</table></td></tr>
<tr><td class="pad" style="padding:16px 28px 28px;${copy}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table};background:#F3EFE4;border:1px solid #E4DED0;border-radius:12px"><tr><td style="padding:18px;${copy}">
<p style="margin:0">${links.supportsHub ? 'Open your schedule to review the work and available parts. Already done it? Log the completed service in your Tech Tree with the actual date and mileage.' : 'Review your saved service history and update the completed work with its actual date and mileage.'}</p>
<p style="margin:18px 0"><a href="${esc(links.schedule)}" style="display:inline-block;max-width:100%;box-sizing:border-box;background:#2563EB;color:#FFFFFF;padding:14px 18px;border-radius:9px;font-weight:bold;text-decoration:none">${links.supportsHub ? 'Open my schedule →' : 'Review service records →'}</a></p>
${links.supportsHub ? `<a href="${esc(links.tree)}" style="color:#2563EB;text-decoration:underline">Open the Tech Tree</a> · ` : ''}<a href="${esc(links.records)}" style="color:#2563EB;text-decoration:underline">Service records</a>
</td></tr></table></td></tr>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>Au7o maintenance alert</title><style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}@media(max-width:620px){.outer-pad{padding:12px 8px!important}.pad{padding-left:18px!important;padding-right:18px!important}}</style></head>
<body style="margin:0;padding:0;width:100%;min-width:0;background:#EDEAE2;${copy}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table}"><tr><td class="outer-pad" align="center" style="padding:26px 12px">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table data-email-container role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table};max-width:600px;background:#FAF7F0;border:1px solid #E4DED0;border-radius:14px;overflow-wrap:anywhere;word-wrap:break-word">
<tr><td class="pad" style="padding:22px 28px;border-bottom:1px solid #E9E2D4;${copy}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${table}"><tr><td width="30%" style="font-weight:bold;font-size:23px;color:#0B1220">Au<span style="color:#2563EB">7</span>o</td><td align="right" style="font-size:14px;line-height:20px;color:#B02F27">MAINTENANCE ALERT</td></tr></table></td></tr>
<tr><td class="pad" style="padding:22px 28px 0;${copy}">Hi ${esc(input.userName?.trim() || 'there')},</td></tr>
${sections || `<tr><td class="pad" style="padding:24px 28px;${copy}">There are no overdue or upcoming maintenance items to show.</td></tr>`}
<tr><td class="pad" style="padding:22px 28px;border-top:1px solid #E9E2D4;${copy};font-size:14px;line-height:22px;color:#5A6473">These reminders use your saved odometer and logged service history, not a live reading from your car. Missing history does not mean service is overdue.<br><br>Maintenance emails are enabled in your account. <a href="${esc(new URL('/account/notifications',origin).href)}" style="color:#2563EB;text-decoration:underline">Manage notification preferences</a>.</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}
