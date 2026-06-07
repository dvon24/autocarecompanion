'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Floating Sign-in pill — sits in the top-right corner next to the
 * GoogleTranslate widget (not behind it). Style mirrors the translate
 * pill (rounded, blurred white background, subtle border) so the two
 * controls read as a matched pair.
 *
 * Unauthed: "Sign in" pill link → /auth/signin
 * Authed:   user initials avatar → dropdown with Account / Garage / Sign out
 *
 * Positioning: fixed top-3 with right-3 + 120px reserved for the
 * Translate button at right-3 of the viewport. The container is itself
 * positioned, so the dropdown menu can anchor to the avatar correctly.
 */
export function FloatingAuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Don't render on:
  //   - /auth/signin and /auth/signup — those pages are themselves
  //     the sign-in/up forms.
  //   - "/" — the new home page nav (LandingPage) already includes a
  //     "Sign in" button next to the brand wordmark, so the floating
  //     version next to the Translate widget is a duplicate.
  const onAuthPage = pathname?.startsWith('/auth/') ?? false;
  const onHome = pathname === '/';

  // Close dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (onAuthPage || onHome) return null;

  // Skeleton while session resolves so the link doesn't pop in.
  if (status === 'loading') {
    return (
      <div
        className="fixed top-3 right-[112px] z-[9999] w-[56px] h-[26px] bg-transparent"
        aria-hidden
      />
    );
  }

  // Unauthed: plain text "Sign in" link — no pill, matches the visual
  // weight of normal nav text. Sits next to (left of) the Translate
  // pill which keeps its own styling.
  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="fixed top-3 right-[112px] z-[9999] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-1 py-1"
        aria-label="Sign in"
      >
        Sign in
      </Link>
    );
  }

  // Authed: avatar with dropdown. Anchored at the same right offset
  // so it doesn't visually jump compared to the unauthed state.
  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : session.user.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div ref={menuRef} className="fixed top-3 right-[112px] z-[9999]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-semibold shadow-sm border border-white/30 hover:shadow-md transition-all"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
          role="menu"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name || 'Account'}
            </p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account
          </Link>

          <Link
            href="/garage"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Garage
          </Link>

          <div className="border-t border-gray-100 mt-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
