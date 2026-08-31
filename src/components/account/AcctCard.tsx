import { ReactNode } from 'react';

/**
 * Card primitive used throughout the redesigned /account page.
 * Optional `title` header with a right-aligned `action` slot
 * (typically a link or button). Body padding is configurable so
 * empty-state interior cards can use tighter padding while populated
 * sections breathe.
 *
 * Ported from BMAD au7o(4)/13-Account.jsx AcctCard, translated to
 * Tailwind so it composes with the rest of the codebase's styling.
 */
export function AcctCard({
  title,
  action,
  children,
  id,
  pad = 20,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
  pad?: number;
}) {
  return (
    <section
      id={id}
      className="min-w-0 max-w-full bg-white border rounded-2xl overflow-hidden"
      style={{ borderColor: '#E3DFD4', boxShadow: '0 1px 2px rgba(11,18,32,0.06)' }}
    >
      {title && (
        <div
          className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-[18px] py-[14px] border-b"
          style={{ borderColor: '#E3DFD4' }}
        >
          <span className="min-w-0 break-words text-sm font-bold tracking-[-0.01em] text-slate-900">{title}</span>
          {action}
        </div>
      )}
      <div className="min-w-0 max-w-full break-words" style={{ padding: pad, overflowWrap: 'anywhere' }}>{children}</div>
    </section>
  );
}
