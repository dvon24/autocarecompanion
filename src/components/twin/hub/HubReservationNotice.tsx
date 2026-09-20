'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTwinMode } from '../twin-context';

export function HubReservationNotice() {
  const params = useSearchParams();
  const mode = useTwinMode();
  const [dismissed, setDismissed] = useState(false);
  if (mode !== 'owner' || params.get('reservation') !== 'received' || dismissed) return null;
  return <section role="status" style={{ flexShrink: 0, padding: '12px 14px', border: '1px solid var(--ki-line)', borderRadius: 12, background: 'var(--ki-card)', color: 'var(--ink)', fontSize: 13, lineHeight: 1.5 }}>
    <strong>Your reservation request was received.</strong> Your existing vehicle is still selected. The requested Twin is not added to your Hub. No charge was made.
    <button type="button" onClick={() => setDismissed(true)} style={{ display: 'block', minHeight: 36, padding: '6px 0', color: 'var(--au7o-blue)', textDecoration: 'underline' }}>Dismiss confirmation</button>
  </section>;
}
