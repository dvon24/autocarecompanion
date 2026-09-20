'use client';

import { ServiceReview } from '@/components/maintenance/ServiceReview';

/**
 * Maintenance log-completion flow — three states inline below a
 * schedule row:
 *
 *   idle     "Mark complete + log to history" button (rendered by the
 *            parent ScheduleRow; this module owns logging + done states)
 *   logging  LogCompletionForm: odometer reading, who did it (DIY vs
 *            shop), date, cost, optional note. Confirm POSTs to
 *            /api/maintenance and transitions to done.
 *   done     LogCompletionDone: "Logged to history" green card showing
 *            the next-due mileage. Undo button reverts to idle (server
 *            row stays — undo here is purely UX, the user gets the
 *            real undo by deleting from history).
 *
 * Source: design/au7o (3)/bmad-handoff/screens/02-WebHubSignedIn.jsx
 * (LogCompletionForm + LogCompletionDone). Adapted to React/TS with
 * the existing /api/maintenance POST as the persistence layer — the
 * MaintenanceRecord Prisma model already carries every field we need.
 */

export interface LogFlowService {
  /** Maintenance type id from MAINTENANCE_SCHEDULES (oil_change, brake_fluid, ...) */
  typeId: string;
  /** Human-readable label, e.g. "Oil change" */
  label: string;
  /** Recommended interval in miles for this service — used to compute
   *  "next due in X mi" on the done state. */
  intervalMiles?: number | null;
  /** Calendar interval for services such as brake fluid that are due by time
   * even when the manufacturer does not publish a mileage interval. */
  intervalMonths?: number | null;
  /** Pre-fill for the cost input (DIY estimate, dollars only) */
  diyCost?: number | null;
}

interface Props {
  vehicleId: string;
  currentMileage: number;
  service: LogFlowService;
  accent: string;
  onLogged?: () => void;
}


export function resolveNextServiceDue(
  service: Pick<LogFlowService, 'intervalMiles' | 'intervalMonths'>,
  mileage: number,
  date: string,
): { nextDueMileage: number | null; nextDueDate: string | null } {
  const nextDueMileage = typeof service.intervalMiles === 'number' && service.intervalMiles > 0
    ? mileage + service.intervalMiles
    : null;
  let nextDueDate: string | null = null;
  if (typeof service.intervalMonths === 'number' && service.intervalMonths > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    const targetMonth = month - 1 + service.intervalMonths;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
    nextDueDate = new Date(Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay)))
      .toISOString()
      .slice(0, 10);
  }
  return { nextDueMileage, nextDueDate };
}

export function MaintenanceLogFlow({ vehicleId, currentMileage, service, onLogged }: Props) {
  return <ServiceReview key={vehicleId + ":" + service.typeId} vehicleId={vehicleId} currentMileage={currentMileage} service={service} onSaved={() => onLogged?.()} />;
}
