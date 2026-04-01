'use client';

import { useEffect, useRef, useState } from 'react';

// Window.adsbygoogle type is declared in AdBanner.tsx

interface AdSlotProps {
  /** AdSense ad slot ID */
  slotId: string;
  /** Ad display format */
  format: 'horizontal' | 'rectangle' | 'vertical';
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * AdSense Ad Slot Component
 *
 * Renders a Google AdSense ad unit. Completely invisible when
 * NEXT_PUBLIC_ADSENSE_ID is not set or when no ad fills the slot.
 */
export function AdSlot({ slotId, format, className }: AdSlotProps) {
  const isInitialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasFilled, setHasFilled] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!clientId || isInitialized.current) return;
    isInitialized.current = true;

    // Wait for container to have width before pushing ad
    if (containerRef.current && containerRef.current.offsetWidth === 0) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // Silently ignore — ad may not fill
    }

    // Check if ad filled after a delay
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const ins = containerRef.current.querySelector('ins');
        if (ins && ins.childElementCount > 0) {
          setHasFilled(true);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [clientId]);

  // Render absolutely nothing when AdSense is not configured
  if (!clientId) {
    return null;
  }

  return (
    <div ref={containerRef} className={className} style={hasFilled ? undefined : { overflow: 'hidden', maxHeight: hasFilled ? undefined : 0 }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format === 'horizontal' ? 'horizontal' : format === 'rectangle' ? 'rectangle' : 'vertical'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
