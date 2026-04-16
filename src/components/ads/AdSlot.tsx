'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  slotId: string;
  format: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

/**
 * Google AdSense Ad Slot Component
 * Renders an auto-sized ad unit. Returns nothing if AdSense ID is not configured.
 */
export function AdSlot({ slotId, format, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || !adRef.current) return;
    try {
      // Push ad only if not already initialized
      const ins = adRef.current.querySelector('ins');
      if (ins && !ins.getAttribute('data-ad-status')) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // AdSense not loaded yet or blocked
    }
  }, [adsenseId]);

  if (!adsenseId) return null;

  const style = format === 'horizontal'
    ? { display: 'block', width: '100%', height: '90px' }
    : format === 'rectangle'
    ? { display: 'inline-block', width: '300px', height: '250px' }
    : { display: 'inline-block', width: '160px', height: '600px' };

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adsenseId}
        data-ad-slot={slotId === 'auto' ? '' : slotId}
        data-ad-format={slotId === 'auto' ? 'auto' : undefined}
        data-full-width-responsive={slotId === 'auto' ? 'true' : undefined}
      />
    </div>
  );
}
