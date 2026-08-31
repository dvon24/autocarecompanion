import type { MaintenanceStatusResult } from '@/lib/maintenance';

export interface MaintenanceAlertEmailItem {
  vehicleId: string;
  vehicleName: string;
  currentMileage: number | null;
  maintenanceType: string;
  maintenanceName: string;
  status: MaintenanceStatusResult;
}

export function escapeEmailHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function maintenanceEmailBaseUrl(value = process.env.NEXT_PUBLIC_APP_URL): string {
  try {
    const parsed = new URL(value || 'https://au7o.io');
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Unsupported protocol');
    return parsed.origin;
  } catch {
    return 'https://au7o.io';
  }
}

function internalUrl(baseUrl: string, path: string): string {
  return escapeEmailHtml(new URL(path, `${baseUrl}/`).toString());
}

function formatMileage(value: number | undefined): string | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? `${Math.round(value).toLocaleString('en-US')} mi`
    : null;
}

function formatDueDate(value: Date | undefined): string | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function dueFacts(alert: MaintenanceAlertEmailItem): string[] {
  const facts: string[] = [];
  const dueMileage = formatMileage(alert.status.dueAtMileage);
  const dueDate = formatDueDate(alert.status.dueAtDate);
  if (dueMileage) facts.push(`Due at ${dueMileage}`);
  if (dueDate) facts.push(`Due ${dueDate}`);
  if (alert.status.isEstimated) facts.push('Schedule includes an estimate');
  return facts;
}

function alertCard(alert: MaintenanceAlertEmailItem, overdue: boolean): string {
  const accent = overdue ? '#B42318' : '#9A6700';
  const tint = overdue ? '#FFF1F0' : '#FFF8E1';
  const facts = dueFacts(alert);
  return `<tr>
    <td style="padding:0 0 10px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;background:${tint};border:1px solid ${overdue ? '#F4C7C3' : '#EAD8A0'};border-radius:12px;">
        <tr><td style="padding:14px 15px;">
          <div style="font-family:Arial,sans-serif;font-size:15px;line-height:20px;font-weight:700;color:#111827;">${escapeEmailHtml(alert.maintenanceName)}</div>
          <div style="margin-top:4px;font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:${accent};">${escapeEmailHtml(alert.status.message)}</div>
          ${facts.length ? `<div style="margin-top:5px;font-family:Arial,sans-serif;font-size:11px;line-height:16px;color:#667085;">${facts.map(escapeEmailHtml).join(' &middot; ')}</div>` : ''}
        </td></tr>
      </table>
    </td>
  </tr>`;
}

export function renderMaintenanceAlertEmail(input: {
  userName: string | null;
  alerts: MaintenanceAlertEmailItem[];
  appUrl?: string;
}): string {
  const baseUrl = maintenanceEmailBaseUrl(input.appUrl);
  const actionable = input.alerts.filter((alert) => alert.status.status === 'overdue' || alert.status.status === 'due_soon');
  const grouped = new Map<string, MaintenanceAlertEmailItem[]>();
  for (const alert of actionable) {
    const group = grouped.get(alert.vehicleId) ?? [];
    group.push(alert);
    grouped.set(alert.vehicleId, group);
  }
  const overdueCount = actionable.filter((alert) => alert.status.status === 'overdue').length;
  const upcomingCount = actionable.length - overdueCount;
  const firstVehicleId = actionable[0]?.vehicleId;
  const primaryUrl = firstVehicleId
    ? internalUrl(baseUrl, `/garage/${encodeURIComponent(firstVehicleId)}/maintenance`)
    : internalUrl(baseUrl, '/garage');
  const greetingName = input.userName?.trim() || 'there';

  const vehicleSections = [...grouped.entries()].map(([vehicleId, alerts]) => {
    const first = alerts[0];
    const overdue = alerts.filter((alert) => alert.status.status === 'overdue');
    const upcoming = alerts.filter((alert) => alert.status.status === 'due_soon');
    const mileage = formatMileage(first.currentMileage ?? undefined);
    const historyUrl = internalUrl(baseUrl, `/garage/${encodeURIComponent(vehicleId)}/maintenance?view=history`);
    return `<tr><td style="padding:0 24px 22px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr><td style="padding:16px 0 12px;border-top:1px solid #DED8CB;">
          <div style="font-family:Arial,sans-serif;font-size:11px;line-height:15px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#3767C8;">Vehicle</div>
          <div style="margin-top:3px;font-family:Georgia,serif;font-size:21px;line-height:26px;font-weight:700;color:#111827;">${escapeEmailHtml(first.vehicleName)}</div>
          ${mileage ? `<div style="margin-top:3px;font-family:Arial,sans-serif;font-size:12px;line-height:17px;color:#667085;">Current odometer: ${escapeEmailHtml(mileage)}</div>` : ''}
        </td></tr>
        ${overdue.length ? `<tr><td style="padding:4px 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#B42318;">Overdue</td></tr>${overdue.map((alert) => alertCard(alert, true)).join('')}` : ''}
        ${upcoming.length ? `<tr><td style="padding:8px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9A6700;">Coming up</td></tr>${upcoming.map((alert) => alertCard(alert, false)).join('')}` : ''}
        <tr><td style="padding-top:3px;"><a href="${historyUrl}" style="font-family:Arial,sans-serif;font-size:12px;line-height:18px;font-weight:700;color:#2459C4;text-decoration:underline;">Review this vehicle's service records</a></td></tr>
      </table>
    </td></tr>`;
  }).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Au7o maintenance alert</title></head>
<body style="margin:0;padding:0;background:#E9E4D8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#E9E4D8;"><tr><td align="center" style="padding:24px 10px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border-collapse:separate;background:#FBF8F1;border:1px solid #D9D1C2;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:22px 24px;background:#111827;color:#FFFFFF;">
        <div style="font-family:Arial,sans-serif;font-size:20px;line-height:24px;font-weight:700;">Au<span style="color:#6EA0FF;">7</span>o</div>
        <div style="margin-top:5px;font-family:Arial,sans-serif;font-size:10px;line-height:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#CBD5E1;">Maintenance alert</div>
      </td></tr>
      <tr><td style="padding:28px 24px 22px;">
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:#475467;">Hi ${escapeEmailHtml(greetingName)},</div>
        <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:30px;line-height:35px;letter-spacing:-.02em;color:#111827;">Your service schedule needs attention.</h1>
        <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:21px;color:#475467;">${overdueCount ? `${overdueCount} overdue item${overdueCount === 1 ? '' : 's'}` : 'No overdue items'}${upcomingCount ? `${overdueCount ? ' and ' : ''}${upcomingCount} upcoming item${upcomingCount === 1 ? '' : 's'}` : ''} are shown below from your saved vehicle data.</p>
      </td></tr>
      ${vehicleSections || `<tr><td style="padding:0 24px 24px;font-family:Arial,sans-serif;font-size:14px;line-height:21px;color:#475467;">There are no overdue or upcoming maintenance items to show.</td></tr>`}
      <tr><td align="center" style="padding:0 24px 28px;"><a href="${primaryUrl}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#2459C4;font-family:Arial,sans-serif;font-size:14px;line-height:18px;font-weight:700;color:#FFFFFF;text-decoration:none;">Open maintenance status</a></td></tr>
      <tr><td style="padding:18px 24px;border-top:1px solid #DED8CB;background:#F4F0E7;font-family:Arial,sans-serif;font-size:11px;line-height:17px;color:#667085;">You receive this because maintenance email alerts are enabled. <a href="${internalUrl(baseUrl, '/account')}" style="color:#475467;text-decoration:underline;">Manage preferences</a>.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

