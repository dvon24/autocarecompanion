'use client';

import { signOut } from 'next-auth/react';

/**
 * Sign out button shown in the mobile account stack to match BMAD
 * au7o(4) MobileAccount. Desktop relies on the top-nav UserMenu /
 * FloatingAuthButton instead.
 *
 * Visibility is owned entirely by the page's wrapper rule
 * (`.acct-card--signout { display: none }` inside the `@media
 * (min-width: 900px)` block) so it tracks the SAME 900px breakpoint
 * the grid switches at. We deliberately do NOT use Tailwind `md:hidden`
 * here — `md` is 768px, which would hide the button 132px before the
 * layout actually becomes desktop, leaving a dead band with no in-page
 * sign-out affordance.
 */
export default function MobileSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="mt-2 py-3 w-full bg-white border border-stone-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-stone-50 transition-colors"
    >
      Sign out
    </button>
  );
}
