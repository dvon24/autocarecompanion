'use client';

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
 * Currently disabled — returns null until AdSense approval is confirmed.
 * Re-enable by uncommenting the rendering logic below.
 */
export function AdSlot(_props: AdSlotProps) {
  // Disabled until AdSense is approved and confirmed filling ads.
  // This prevents empty gaps on all pages.
  return null;
}
