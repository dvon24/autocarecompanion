'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Value carousel for the auth pages — sells the "why create an account" that the
 * old pages were missing (conversion was ~0%). Auto-advances but pauses on hover/
 * focus so it never hides the card that resonates. Supports the form (Google +
 * fields stay above/beside it), never buries it.
 */
const CARDS = [
  {
    icon: '🔧',
    title: 'A mechanic who knows YOUR exact car',
    body: 'Answers tuned to your year, make, model & trim — not generic advice. Save your garage so it always has the right context.',
  },
  {
    icon: '📸',
    title: 'Snap a photo → the exact part + where to buy',
    body: 'Point your camera at any part. Get the OEM number, real fitment, and a verified buy link — saved to your repair kit.',
  },
  {
    icon: '🔔',
    title: 'Recall & maintenance alerts for your vehicle',
    body: 'We watch for new recalls and known issues on your car and email you — the free VIN check that could save you hundreds.',
  },
  {
    icon: '💬',
    title: 'Your diagnoses & chat history, kept',
    body: 'Every diagnosis and conversation saved to your account, on every device. Pick up right where you left off.',
  },
];

export function AuthValueCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setI(((n % CARDS.length) + CARDS.length) % CARDS.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % CARDS.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  const c = CARDS[i];
  return (
    <div
      className="select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5 min-h-[132px] transition-all">
        <div className="text-2xl mb-1.5">{c.icon}</div>
        <div className="text-[15px] font-bold text-gray-900 leading-snug">{c.title}</div>
        <div className="text-sm text-gray-600 mt-1 leading-snug">{c.body}</div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {CARDS.map((_, n) => (
          <button
            key={n}
            type="button"
            aria-label={`Feature ${n + 1}`}
            onClick={() => go(n)}
            className={`h-1.5 rounded-full transition-all ${n === i ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
}
