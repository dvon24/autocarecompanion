'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

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

type State = 'logging' | 'done';

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

export function MaintenanceLogFlow({ vehicleId, currentMileage, service, accent, onLogged }: Props) {
  const [state, setState] = useState<State>('logging');
  const [loggedMileage, setLoggedMileage] = useState<number>(currentMileage);
  const [loggedDate, setLoggedDate] = useState<string>(toISODate(new Date()));

  if (state === 'logging') {
    return (
      <LogCompletionForm
        vehicleId={vehicleId}
        currentMileage={currentMileage}
        service={service}
        accent={accent}
        onConfirmed={(mi, date) => {
          setLoggedMileage(mi);
          setLoggedDate(date);
          setState('done');
          onLogged?.();
        }}
      />
    );
  }
  return (
    <LogCompletionDone
      service={service}
      accent={accent}
      mileage={loggedMileage}
      date={loggedDate}
    />
  );
}

function LogCompletionForm({
  vehicleId,
  currentMileage,
  service,
  accent,
  onConfirmed,
}: {
  vehicleId: string;
  currentMileage: number;
  service: LogFlowService;
  accent: string;
  onConfirmed: (mileage: number, date: string) => void;
}) {
  const today = toISODate(new Date());
  const [mi, setMi] = useState<string>(String(currentMileage));
  const [who, setWho] = useState<'diy' | 'shop'>('diy');
  const [date, setDate] = useState<string>(today);
  const [cost, setCost] = useState<string>(service.diyCost != null ? String(service.diyCost) : '');
  const [shopName, setShopName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ mileage?: string; date?: string; cost?: string; shopName?: string }>({});

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'inherit',
    background: '#fff',
    border: '1px solid #E3DFD4',
    borderRadius: 8,
    color: '#0B1220',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9.5,
    letterSpacing: '0.07em',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 5,
    display: 'block',
  };

  const submit = async () => {
    if (pending) return;
    const miNum = Number(mi);
    const costNumber = cost === '' ? null : Number(cost);
    const dateTimestamp = Date.parse(`${date}T00:00:00.000Z`);
    const realDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
      && Number.isFinite(dateTimestamp)
      && toISODate(new Date(dateTimestamp)) === date;
    const nextFieldErrors = {
      ...(!mi.trim() || !Number.isInteger(miNum) || miNum < 0 ? { mileage: 'Enter a whole, non-negative odometer reading.' } : {}),
      ...(!realDate || date > today ? { date: 'Choose a real completion date that is not in the future.' } : {}),
      ...(costNumber != null && (!Number.isFinite(costNumber) || costNumber < 0) ? { cost: 'Enter a non-negative cost or leave it blank.' } : {}),
      ...(who === 'shop' && !shopName.trim() ? { shopName: 'Enter the shop or provider so this record is not mislabeled as owner-entered.' } : {}),
    };
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length) return;
    setPending(true);
    setError(null);
    try {
      const nextDue = resolveNextServiceDue(service, miNum, date);
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          type: service.typeId,
          mileage: miNum,
          cost: costNumber ?? undefined,
          date,
          nextDueMileage: nextDue.nextDueMileage,
          nextDueDate: nextDue.nextDueDate,
          notes: note || undefined,
          shopName: who === 'shop' && shopName.trim() ? shopName.trim() : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.error || `Couldn't log (HTTP ${res.status}).`);
        return;
      }
      onConfirmed(miNum, date);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      style={{
        paddingTop: 14,
        borderTop: '1px solid #E3DFD4',
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: accent,
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="check" size={12} />
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }}>
            When did you last do this?
          </div>
          <div style={{ fontSize: 11, color: '#64748B' }}>
            {service.label} · set the date + odometer (past dates are fine) and we&apos;ll recalculate what&apos;s due.
          </div>
        </div>
      </div>

      {/* Odometer — headline field */}
      <div
        style={{
          background: '#FAF8F2',
          border: `1px solid ${accent}`,
          borderRadius: 10,
          padding: '12px 14px',
        }}
      >
        <label style={labelStyle}>Odometer reading when completed</label>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 'min(100%, 220px)' }}>
            <input
              type="number"
              inputMode="numeric"
              value={mi}
              onChange={(e) => { setMi(e.target.value); setFieldErrors((previous) => ({ ...previous, mileage: undefined })); }}
              aria-invalid={Boolean(fieldErrors.mileage)}
              aria-describedby={fieldErrors.mileage ? 'maintenance-mileage-error' : undefined}
              style={{
                ...fieldStyle,
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                padding: '6px 52px 6px 12px',
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 12,
                color: '#64748B',
                fontWeight: 600,
                pointerEvents: 'none',
              }}
            >
              miles
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMi(String(currentMileage));
              setFieldErrors((previous) => ({ ...previous, mileage: undefined }));
            }}
            style={{ ...chipStyle, flex: '1 1 170px', minHeight: 42, whiteSpace: 'normal' }}
          >
            Use current · {currentMileage.toLocaleString()}
          </button>
        </div>
        {fieldErrors.mileage && <p id="maintenance-mileage-error" role="alert" style={{ margin: '6px 0 0', fontSize: 11.5, color: '#B91C1C' }}>{fieldErrors.mileage}</p>}
      </div>

      {/* Who + date */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        <div>
          <label style={labelStyle}>Who completed it</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['diy', 'shop'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setWho(k);
                  if (k === 'diy') setFieldErrors((previous) => ({ ...previous, shopName: undefined }));
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderRadius: 8,
                  background: who === k ? accent : '#fff',
                  color: who === k ? '#fff' : '#475569',
                  border: `1px solid ${who === k ? accent : '#E3DFD4'}`,
                }}
              >
                {k === 'diy' ? 'I did it' : 'A shop'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            max={today}
            value={date}
            onChange={(e) => { setDate(e.target.value); setFieldErrors((previous) => ({ ...previous, date: undefined })); }}
            aria-invalid={Boolean(fieldErrors.date)}
            aria-describedby={fieldErrors.date ? 'maintenance-date-error' : undefined}
            style={{ ...fieldStyle, fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 12.5 }}
          />
          {fieldErrors.date && <p id="maintenance-date-error" role="alert" style={{ margin: '5px 0 0', fontSize: 11.5, color: '#B91C1C' }}>{fieldErrors.date}</p>}
        </div>
      </div>

      {/* Cost + note */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        <div>
          <label style={labelStyle}>Cost</label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                color: '#64748B',
                fontWeight: 600,
              }}
            >
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={cost}
              onChange={(e) => { setCost(e.target.value); setFieldErrors((previous) => ({ ...previous, cost: undefined })); }}
              placeholder="0"
              style={{ ...fieldStyle, fontFamily: 'var(--font-mono, ui-monospace, monospace)', paddingLeft: 22 }}
              aria-invalid={Boolean(fieldErrors.cost)}
              aria-describedby={fieldErrors.cost ? 'maintenance-cost-error' : undefined}
            />
          </div>
          {fieldErrors.cost && <p id="maintenance-cost-error" role="alert" style={{ margin: '5px 0 0', fontSize: 11.5, color: '#B91C1C' }}>{fieldErrors.cost}</p>}
        </div>
        <div>
          <label style={labelStyle}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            placeholder={who === 'diy' ? 'Parts used, observations…' : 'Shop name, invoice #…'}
            style={fieldStyle}
          />
        </div>
      </div>

      {who === 'shop' && (
        <div>
          <label style={labelStyle}>Shop or provider</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value);
              setFieldErrors((previous) => ({ ...previous, shopName: undefined }));
            }}
            maxLength={200}
            placeholder="Name shown on the invoice"
            aria-invalid={Boolean(fieldErrors.shopName)}
            aria-describedby={fieldErrors.shopName ? 'maintenance-shop-error' : undefined}
            style={fieldStyle}
          />
          {fieldErrors.shopName && <p id="maintenance-shop-error" role="alert" style={{ margin: '5px 0 0', fontSize: 11.5, color: '#B91C1C' }}>{fieldErrors.shopName}</p>}
        </div>
      )}

      {error && (
        <p style={{ fontSize: 12, color: '#B91C1C', margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, zIndex: 2, paddingTop: 4, background: 'inherit' }}>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: accent,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.7 : 1,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Icon name="check" size={13} />
          {pending ? 'Logging…' : `Log completion at ${Number(mi || 0).toLocaleString()} mi`}
        </button>
      </div>
    </div>
  );
}

function LogCompletionDone({
  service,
  mileage,
  date,
}: {
  service: LogFlowService;
  accent: string;
  mileage: number;
  date: string;
}) {
  const nextDue = resolveNextServiceDue(service, mileage, date);
  return (
    <div style={{ paddingTop: 14, borderTop: '1px solid #E3DFD4', marginTop: 10 }}>
      <div
        style={{
          background: 'rgba(31,138,91,0.07)',
          border: '1px solid rgba(31,138,91,0.3)',
          borderRadius: 12,
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#10B981',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={15} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Logged to your history
            </div>
            <div style={{ fontSize: 11.5, color: '#334155', marginTop: 1 }}>
              {service.label} · completed at{' '}
              <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontWeight: 600, color: '#0B1220' }}>
                {mileage.toLocaleString()} mi
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid rgba(31,138,91,0.2)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#64748B',
              }}
            >
              NEXT DUE
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                fontSize: 14,
                fontWeight: 700,
                color: '#3B82F6',
                marginTop: 2,
              }}
            >
              {nextDue.nextDueMileage != null
                ? `${nextDue.nextDueMileage.toLocaleString()} mi`
                : nextDue.nextDueDate
                  ? new Date(`${nextDue.nextDueDate}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
                  : 'Interval not available'}
            </div>
            <div style={{ fontSize: 10.5, color: '#64748B' }}>
              {service.intervalMiles
                ? `in ${service.intervalMiles.toLocaleString()} mi · interval reset`
                : service.intervalMonths
                  ? `in ${service.intervalMonths} months · interval reset`
                  : 'Completion recorded'}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#64748B',
              }}
            >
              STATUS
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Up to date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E3DFD4',
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 11,
  color: '#475569',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  flexShrink: 0,
};

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
