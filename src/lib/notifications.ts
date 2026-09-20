/**
 * Notification System
 *
 * Epic 5, Story 5.4b: Maintenance Notifications
 * Handles email and push notifications for maintenance reminders.
 */

import { prisma } from './db';
import { productEntitlements, entitlementSelect } from './product-entitlements';
import { renderMaintenanceAlertEmail, type MaintenanceAlertEmailItem } from './maintenance-alert-email';
import { buildMaintenanceReminders, buildOwnerMaintenanceReminders, maintenanceEmailDeliveryKey } from './maintenance-reminder-data';
import { getTwinHubData } from './twin-hub-data';

// Types
export interface NotificationPayload {
  userId: string;
  type: 'maintenance_due' | 'maintenance_overdue' | 'weekly_summary';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export type MaintenanceAlert = MaintenanceAlertEmailItem;

/**
 * Get all users with upcoming or overdue maintenance
 */
export async function getUsersWithDueMaintenance(now = new Date()): Promise<
  Array<{
    user: {
      id: string;
      email: string;
      name: string | null;
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
    alerts: MaintenanceAlert[];
  }>
> {
  // Get all premium users with vehicles
  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: { in: ['active', 'trialing'] },
      vehicles: {
        some: {},
      },
    },
    select: {
      ...entitlementSelect,
      id: true,
      email: true,
      name: true,
      emailNotifications: true,
      pushNotifications: true,
      vehicles: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          nickname: true,
          trim: true,
          transmission: true,
          color: true,
          currentMileage: true,
          annualMileage: true,
          lastMileageUpdate: true,
          maintenanceRecords: {
            select: {
              id: true,
              type: true,
              mileage: true,
              date: true,
              nextDueMileage: true,
              nextDueDate: true,
            },
          },
        },
      },
    },
  });

  const results: Array<{
    user: {
      id: string;
      email: string;
      name: string | null;
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
    alerts: MaintenanceAlert[];
  }> = [];

  for (const user of users) {
    if (!productEntitlements(user).maintenance) continue;
    const alerts: MaintenanceAlert[] = [];

    for (const vehicle of user.vehicles) {
      try {
        const outcome = await getTwinHubData(user.id, user.email, vehicle.id);
        if (outcome.access.kind === 'allowed' && outcome.data) {
          alerts.push(...buildOwnerMaintenanceReminders(vehicle, outcome.data));
        } else {
          alerts.push(...buildMaintenanceReminders(vehicle, vehicle.maintenanceRecords, now));
        }
      } catch {
        // Uncertain access or installed clocks must not produce a stale reminder.
        console.error('[Maintenance] Skipped vehicle after owner data could not be loaded', vehicle.id);
      }
    }

    if (alerts.length > 0) {
      results.push({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailNotifications: user.emailNotifications,
          pushNotifications: user.pushNotifications,
        },
        alerts,
      });
    }
  }

  return results;
}

/**
 * Send email notification using Resend (or log if not configured)
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string,
  idempotencyKey?: string,
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('[Email] Resend not configured, logging email:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Au7o <notifications@au7o.io>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Failed to send:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] Error sending notification:', error);
    return false;
  }
}

/**
 * Send push notification via Web Push
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<number> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log('[Push] VAPID keys not configured');
    return 0;
  }

  // Get user's push subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return 0;
  }

  // Real delivery via the Web Push protocol. This was a console.log stub
  // behind a fully working subscribe UI — users granted permission, saw
  // success, were logged as notified, and never received anything
  // (2026-06-11 review finding).
  const webpush = (await import('web-push')).default;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:devonsroberson24@yahoo.com',
    vapidPublicKey,
    vapidPrivateKey,
  );

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
      sent++;
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      console.error(`[Push] Failed to send (${statusCode ?? 'unknown'}):`, error);
      // 404/410 = the browser revoked this subscription — clean it up.
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }

  return sent;
}

/**
 * Log notification to database
 */
export async function logNotification(
  userId: string,
  type: string,
  channel: 'email' | 'push',
  title: string,
  body: string
): Promise<void> {
  await prisma.notificationLog.create({
    data: {
      userId,
      type,
      channel,
      title,
      body,
    },
  });
}

/**
 * Generate maintenance reminder email HTML
 */
export function generateMaintenanceEmailHtml(
  userName: string | null,
  alerts: MaintenanceAlert[]
): string {
  return renderMaintenanceAlertEmail({ userName, alerts });
}

/**
 * Process and send maintenance notifications for all users
 */
export async function processMaintenanceNotifications(): Promise<{
  usersProcessed: number;
  emailsSent: number;
  pushSent: number;
}> {
  const now = new Date();
  const dayStart = new Date(`${now.toISOString().slice(0,10)}T00:00:00.000Z`);
  const usersWithAlerts = await getUsersWithDueMaintenance(now);

  let emailsSent = 0;
  let pushSent = 0;

  for (const { user, alerts } of usersWithAlerts) {
    const overdueCount = alerts.filter((a) => a.status.status === 'overdue').length;
    const dueSoonCount = alerts.filter((a) => a.status.status === 'due_soon').length;

    // Determine notification type
    const notificationType = overdueCount > 0 ? 'maintenance_overdue' : 'maintenance_due';

    // Generate notification content
    const title =
      overdueCount > 0
        ? `${overdueCount} maintenance item${overdueCount > 1 ? 's' : ''} overdue`
        : `${dueSoonCount} maintenance item${dueSoonCount > 1 ? 's' : ''} due soon`;

    const body = alerts
      .slice(0, 3)
      .map((a) => `${a.maintenanceName} - ${a.vehicleName}`)
      .join(', ');

    // Send email notification
    if (user.emailNotifications) {
      const alreadySent = await prisma.notificationLog.findFirst({ where:{ userId:user.id, channel:'email', type:{ in:['maintenance_due','maintenance_overdue'] }, sentAt:{ gte:dayStart } }, select:{ id:true } });
      const html = generateMaintenanceEmailHtml(user.name, alerts);
      // Resend retains this daily key for 24 hours. Changed retry payloads fail
      // closed rather than sending a second reminder; next day remains eligible.
      const sent = !alreadySent && await sendEmailNotification(user.email, `Au7o: ${title}`, html, maintenanceEmailDeliveryKey(user.id, now));
      if (sent) {
        emailsSent++;
        await logNotification(user.id, notificationType, 'email', title, body);
      }
    }

    // Send push notification
    if (user.pushNotifications) {
      const count = await sendPushNotification(user.id, {
        userId: user.id,
        type: notificationType,
        title,
        body,
        data: {
          url: '/garage',
        },
      });
      if (count > 0) {
        pushSent += count;
        await logNotification(user.id, notificationType, 'push', title, body);
      }
    }
  }

  return {
    usersProcessed: usersWithAlerts.length,
    emailsSent,
    pushSent,
  };
}
