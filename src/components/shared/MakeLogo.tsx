'use client';

import { useState } from 'react';
import Image from 'next/image';
import { makeLogoSlug, makeInitials } from '@/lib/make-logo';

interface Props {
  make: string;
  size: number;
  className?: string;
}

type LoadState = 'svg' | 'png' | 'initials';

/**
 * Brand-logo renderer with graceful fallback.
 *
 * Tries /logos/{slug}.svg first (newer makes added via simpleicons),
 * then /logos/{slug}.png (the original 33 makes shipped as full-color
 * PNGs), then finally renders the make's initials in a soft-gray
 * rounded box. This means adding a new make to YMMT + KnownIssue rows
 * doesn't strictly require dropping a logo file — the page still
 * looks reasonable. But dropping {slug}.svg or {slug}.png into
 * /public/logos/ gives an instant upgrade with zero code changes.
 */
export function MakeLogo({ make, size, className = '' }: Props) {
  const slug = makeLogoSlug(make);
  const [state, setState] = useState<LoadState>('svg');

  if (state === 'initials') {
    const initials = makeInitials(make);
    // Font size scales with box size — keep initials inside the bounds
    // even for short two-letter pairs like "MB".
    const fontSize = Math.max(8, Math.floor(size * 0.45));
    return (
      <div
        className={`flex-shrink-0 inline-flex items-center justify-center bg-gray-100 text-gray-600 rounded-md font-semibold ${className}`}
        style={{ width: size, height: size, fontSize, lineHeight: 1 }}
        aria-label={`${make} logo`}
        role="img"
      >
        {initials}
      </div>
    );
  }

  const src = `/logos/${slug}.${state}`;
  return (
    <Image
      key={src}
      src={src}
      alt={`${make} logo`}
      width={size}
      height={size}
      className={`flex-shrink-0 object-contain ${className}`}
      onError={() => setState(state === 'svg' ? 'png' : 'initials')}
      unoptimized={state === 'svg'} // SVGs don't need Next.js image optimization
    />
  );
}
