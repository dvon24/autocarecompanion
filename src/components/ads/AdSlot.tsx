'use client';

import { useEffect, useRef } from 'react';

// Window.adsbygoogle type is declared in AdBanner.tsx

interface AdSlotProps {
  /** AdSense ad slot ID */
  slotId: string;
  /** Ad display format */
  format: 'horizontal' | 'rectangle' | 'vertical';
  /** Optional additional CSS classes */
  className?: string;
}

const formatStyles: Record<AdSlotProps['format'], React.CSSProperties> = {
  horizontal: { display: 'block', minHeight: '90px' },
  rectangle: { display: 'block', minHeight: '250px', minWidth: '250px' },
  vertical: { display: 'block', minHeight: '600px', minWidth: '120px' },
};

/**
 * AdSense Ad Slot Component
 *
 * Renders a Google AdSense ad unit. Completely invisible when
 * NEXT_PUBLIC_ADSENSE_ID is not set (no DOM output at all).
 *
 * Usage:
 *   <AdSlot slotId="1234567890" format="horizontal" />
 *   <AdSlot slotId="1234567890" format="rectangle" className="my-6" />
 */
export function AdSlot({ slotId, format, className }: AdSlotProps) {
  const isInitialized = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!clientId || isInitialized.current) return;
    isInitialized.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense push error:', err);
    }
  }, [clientId]);

  // Render absolutely nothing when AdSense is not configured
  if (!clientId) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={formatStyles[format]}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format === 'horizontal' ? 'horizontal' : format === 'rectangle' ? 'rectangle' : 'vertical'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
