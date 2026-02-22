/**
 * Notification System
 *
 * Epic 5, Story 5.4b: Maintenance Notifications
 * Handles email and push notifications for maintenance reminders.
 */

import { prisma } from './db';
import {
  MAINTENANCE_SCHEDULES,
  getUpcomingMaintenance,
  type MaintenanceStatusResult,
} from './maintenance';

// Types
export interface NotificationPayload {
  userId: string;
  type: 'maintenance_due' | 'maintenance_overdue' | 'weekly_summary';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface MaintenanceAlert {
  vehicleId: string;
  vehicleName: string;
  maintenanceType: string;
  maintenanceName: string;
  status: MaintenanceStatusResult;
}

/**
 * Get all users with upcoming or overdue maintenance
 */
export async function getUsersWithDueMaintenance(): Promise<
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
      subscriptionStatus: 'active',
      vehicles: {
        some: {},
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailNotifications: true,
      pushNotifications: true,
      vehicles: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          nickname: true,
          currentMileage: true,
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
    const alerts: MaintenanceAlert[] = [];

    for (const vehicle of user.vehicles) {
      const vehicleName =
        vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

      const upcoming = getUpcomingMaintenance(
        {
          currentMileage: vehicle.currentMileage,
          lastMileageUpdate: vehicle.lastMileageUpdate,
        },
        vehicle.maintenanceRecords.map((r) => ({
          ...r,
          date: new Date(r.date),
          nextDueDate: r.nextDueDate ? new Date(r.nextDueDate) : null,
        }))
      );

      for (const { type, status } of upcoming) {
        alerts.push({
          vehicleId: vehicle.id,
          vehicleName,
          maintenanceType: type.id,
          maintenanceName: type.name,
          status,
        });
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
  html: string
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

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      // In production, use web-push library
      // For now, we'll just log
      console.log(`[Push] Would send to endpoint: ${sub.endpoint.slice(0, 50)}...`);
      console.log(`  Title: ${payload.title}`);
      console.log(`  Body: ${payload.body}`);
      sent++;
    } catch (error) {
      console.error('[Push] Failed to send:', error);
      // Remove invalid subscription
      await prisma.pushSubscription.delete({
        where: { id: sub.id },
      });
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
  const overdueAlerts = alerts.filter((a) => a.status.status === 'overdue');
  const dueSoonAlerts = alerts.filter((a) => a.status.status === 'due_soon');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; color: #1a1a1a;">
          Au<span style="color: #3B82F6;">7</span>o
        </h1>
        <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Maintenance Reminder</p>
      </div>

      <!-- Greeting -->
      <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
        Hi ${userName || 'there'},
      </p>

      ${
        overdueAlerts.length > 0
          ? `
      <!-- Overdue Section -->
      <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <h2 style="margin: 0 0 12px; font-size: 16px; color: #DC2626;">
          ⚠️ Overdue Maintenance (${overdueAlerts.length})
        </h2>
        ${overdueAlerts
          .map(
            (alert) => `
          <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${alert.maintenanceName}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #666;">${alert.vehicleName}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #DC2626;">${alert.status.message}</p>
          </div>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }

      ${
        dueSoonAlerts.length > 0
          ? `
      <!-- Due Soon Section -->
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <h2 style="margin: 0 0 12px; font-size: 16px; color: #D97706;">
          🔔 Due Soon (${dueSoonAlerts.length})
        </h2>
        ${dueSoonAlerts
          .map(
            (alert) => `
          <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${alert.maintenanceName}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #666;">${alert.vehicleName}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #D97706;">${alert.status.message}</p>
          </div>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }

      <!-- CTA -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://au7o.io'}/garage"
           style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View My Garage
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          You're receiving this because you have maintenance notifications enabled.
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://au7o.io'}/account" style="color: #666;">Manage preferences</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Process and send maintenance notifications for all users
 */
export async function processMaintenanceNotifications(): Promise<{
  usersProcessed: number;
  emailsSent: number;
  pushSent: number;
}> {
  const usersWithAlerts = await getUsersWithDueMaintenance();

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
      const html = generateMaintenanceEmailHtml(user.name, alerts);
      const sent = await sendEmailNotification(user.email, `Au7o: ${title}`, html);
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
