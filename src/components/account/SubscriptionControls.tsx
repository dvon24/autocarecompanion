'use client';

import { useState } from 'react';

/**
 * Subscription cancel / reactivate controls on /account.
 *
 * Server passes initial state via props (status, cancelAtPeriodEnd,
 * currentPeriodEnd) so we can render the right CTA without a fetch
 * round-trip on mount. After a successful POST we update local state
 * optimistically; a hard refresh re-syncs from Stripe via the page's
 * server query.
 *
 * Two states it can render:
 *   - active + NOT scheduled to cancel → show "Cancel subscription"
 *     button (asks Stripe to cancel_at_period_end on click)
 *   - active + scheduled to cancel → show "Reactivate subscription"
 *     button + clear copy on when access ends
 *
 * No confirmation modal: per FTC Click-to-Cancel guidance, cancellation
 * must be "as easy as enrollment." Enrollment is a single click from
 * /subscribe → Stripe Checkout, so cancellation is a single click here.
 * An optional "are you sure?" inline copy is acceptable; a hard confirm
 * modal that requires typing a word would be a regulatory red flag.
 */
interface Props {
  initialStatus: string | null;
  initialCancelAtPeriodEnd: boolean;
  initialCurrentPeriodEnd: number | null; // unix seconds
}

function formatDate(unixSeconds: number | null): string {
  if (!unixSeconds) return 'the end of your current billing period';
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SubscriptionControls({
  initialStatus,
  initialCancelAtPeriodEnd,
  initialCurrentPeriodEnd,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(initialCancelAtPeriodEnd);
  const [periodEnd, setPeriodEnd] = useState(initialCurrentPeriodEnd);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show controls for users with a known active-or-canceling
  // subscription. Free-tier users and ones whose webhook hasn't
  // arrived yet see nothing — handled by parent component.
  if (status !== 'active' && status !== 'trialing' && status !== 'past_due') {
    return null;
  }

  const handleClick = async () => {
    if (pending) return;
    const wantReactivate = cancelAtPeriodEnd;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/account/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactivate: wantReactivate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Update failed (HTTP ${res.status})`);
        return;
      }
      const data = await res.json();
      setCancelAtPeriodEnd(!!data.cancelAtPeriodEnd);
      setPeriodEnd(data.currentPeriodEnd ?? periodEnd);
      setStatus(data.status ?? status);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {cancelAtPeriodEnd ? (
          <>
            <h3 className="font-semibold text-gray-900 mb-1">
              Scheduled to cancel
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Your subscription will end on{' '}
              <strong>{formatDate(periodEnd)}</strong>. You&apos;ll keep
              all premium features until then, and you won&apos;t be
              charged again. If you change your mind, you can reactivate
              with one click.
            </p>
            <button
              onClick={handleClick}
              disabled={pending}
              className="w-full sm:w-auto py-2.5 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Reactivating…' : 'Reactivate subscription'}
            </button>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-gray-900 mb-1">
              Active subscription
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Your subscription auto-renews{' '}
              {periodEnd ? (
                <>on <strong>{formatDate(periodEnd)}</strong></>
              ) : (
                <>at the end of your current billing period</>
              )}
              . You can cancel anytime — you&apos;ll keep premium
              features until the end of the period you&apos;ve already
              paid for, and you won&apos;t be charged again.
            </p>
            <button
              onClick={handleClick}
              disabled={pending}
              className="w-full sm:w-auto py-2.5 px-5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Canceling…' : 'Cancel subscription'}
            </button>
          </>
        )}
        {error && (
          <p className="text-xs text-red-600 mt-3">{error}</p>
        )}
      </div>
    </section>
  );
}
