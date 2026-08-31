import { ReactNode } from 'react';

/**
 * Page chrome for the redesigned /account.
 *
 * Provides:
 *   1. Amber BETA strip (full-width)
 *   2. "Your account" headline + tagline (centered max-width container)
 *   3. The container in which children render their own grid.
 *
 * The page handles its own grid + section ordering — keeping all
 * layout decisions in one file so future reordering doesn't fight
 * with shell knobs.
 */
export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-clip">
      <div
        className="border-b"
        style={{
          background: '#FEF3C7',
          borderColor: 'rgba(180,83,9,0.18)',
        }}
      >
        <div
          className="max-w-[1040px] min-w-0 mx-auto flex items-start gap-3 px-4 py-[11px] sm:items-center sm:px-6"
        >
          <span
            className="text-[9.5px] font-bold uppercase text-white rounded-full flex-shrink-0"
            style={{
              letterSpacing: '0.06em',
              background: '#B45309',
              padding: '3px 8px',
            }}
          >
            BETA
          </span>
          <span
            className="min-w-0 break-words text-[12.5px] leading-snug"
            style={{ color: '#92400E', overflowWrap: 'anywhere' }}
          >
            Premium features (SMS reminders, push alerts, cross-device sync) are still in active development. What you see today is a read-only history of your chats, diagnoses, and saved vehicles.
          </span>
        </div>
      </div>

      <div
        className="max-w-[1040px] min-w-0 mx-auto px-4 pb-12 pt-[30px] sm:px-6"
      >
        <h1
          className="text-3xl font-bold text-slate-900 m-0"
          style={{ letterSpacing: '-0.025em' }}
        >
          Your account
        </h1>
        <p
          className="text-sm text-slate-600"
          style={{ margin: '6px 0 26px' }}
        >
          Your garage, activity, plan, and data — all in one place.
        </p>

        {children}
      </div>
    </div>
  );
}
