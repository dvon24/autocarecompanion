'use client';

import { useEffect } from 'react';

/**
 * Native <details> keeps translated issue copy server-rendered and collapsed
 * without shipping a card-sized client component. This tiny bridge preserves
 * direct issue links by opening and positioning the targeted details element.
 */
export function LocalizedIssueHashExpander() {
  useEffect(() => {
    const timers = new Set<number>();
    const openTarget = () => {
      const rawId = window.location.hash.slice(1);
      if (!rawId) return;

      let id = rawId;
      try { id = decodeURIComponent(rawId); } catch { /* keep raw hash */ }
      const target = document.getElementById(id);
      if (!(target instanceof HTMLDetailsElement)) return;

      target.open = true;
      for (const delay of [0, 350]) {
        const timer = window.setTimeout(() => {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          timers.delete(timer);
        }, delay);
        timers.add(timer);
      }
    };

    openTarget();
    window.addEventListener('hashchange', openTarget);
    return () => {
      window.removeEventListener('hashchange', openTarget);
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
