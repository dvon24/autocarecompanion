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
  intervalMiles: number;
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

export function MaintenanceLogFlow({ vehicleId, currentMileage, service, accent, onLogged }: Props) {
  const [state, setState] = useState<State>('logging');
  const [loggedMileage, setLoggedMileage] = useState<number>(currentMileage);

  if (state === 'logging') {
    return (
      <LogCompletionForm
        vehicleId={vehicleId}
        currentMileage={currentMileage}
        service={service}
        accent={accent}
        onConfirmed={(mi) => {
          setLoggedMileage(mi);
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
  onConfirmed: (mileage: number) => void;
}) {
  const [mi, setMi] = useState<string>(String(currentMileage));
  const [who, setWho] = useState<'diy' | 'shop'>('diy');
  const [date, setDate] = useState<string>(toISODate(new Date()));
  const [cost, setCost] = useState<string>(service.diyCost != null ? String(service.diyCost) : '');
  const [note, setNote] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!Number.isFinite(miNum) || miNum < 0) {
      setError('Enter a valid odometer reading.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          type: service.typeId,
          mileage: miNum,
          cost: cost ? Number(cost) : undefined,
          date,
          nextDueMileage: miNum + service.intervalMiles,
          notes: note || undefined,
          shopName: who === 'shop' ? (note || 'Shop') : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.error || `Couldn't log (HTTP ${res.status}).`);
        return;
      }
      onConfirmed(miNum);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="number"
              inputMode="numeric"
              value={mi}
              onChange={(e) => setMi(e.target.value)}
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
            onClick={() => setMi(String(currentMileage))}
            style={chipStyle}
          >
            Use current · {currentMileage.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Who + date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Who completed it</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['diy', 'shop'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setWho(k)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ ...fieldStyle, fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 12.5 }}
          />
        </div>
      </div>

      {/* Cost + note */}
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
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
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
              style={{ ...fieldStyle, fontFamily: 'var(--font-mono, ui-monospace, monospace)', paddingLeft: 22 }}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={who === 'diy' ? 'Parts used, observations…' : 'Shop name, invoice #…'}
            style={fieldStyle}
          />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#B91C1C', margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
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
  accent: _accent,
  mileage,
}: {
  service: LogFlowService;
  accent: string;
  mileage: number;
}) {
  const nextDue = mileage + service.intervalMiles;
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
              {nextDue.toLocaleString()} mi
            </div>
            <div style={{ fontSize: 10.5, color: '#64748B' }}>
              in {service.intervalMiles.toLocaleString()} mi · interval reset
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
