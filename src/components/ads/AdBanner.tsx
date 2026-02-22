'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

interface AdBannerProps {
  /**
   * AdSense ad slot ID
   */
  slot: string;

  /**
   * Ad format (auto, horizontal, vertical, rectangle)
   */
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';

  /**
   * Enable responsive sizing
   */
  responsive?: boolean;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Whether to show a placeholder during development
   */
  showPlaceholder?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense Banner Component
 *
 * Epic 5, Story 5.9: Ads for Anonymous Users
 * Only displays ads to anonymous (non-subscribed) users.
 */
export function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  showPlaceholder = process.env.NODE_ENV === 'development',
}: AdBannerProps) {
  const { data: session } = useSession();
  const adRef = useRef<HTMLModElement>(null);
  const isInitialized = useRef(false);

  // Only show ads to anonymous users
  const isSubscriber = session?.user?.id;

  useEffect(() => {
    // Don't show ads to subscribers
    if (isSubscriber) return;

    // Don't initialize in development if no AdSense ID
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
    if (!adsenseId && !showPlaceholder) return;

    // Only initialize once
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Push ad configuration
    try {
      if (adsenseId && typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [isSubscriber, showPlaceholder]);

  // Don't render for subscribers
  if (isSubscriber) {
    return null;
  }

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  // Show placeholder in development
  if (!adsenseId && showPlaceholder) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}
      >
        <p className="text-gray-500 text-sm">Ad Placeholder</p>
        <p className="text-gray-400 text-xs mt-1">Slot: {slot}</p>
      </div>
    );
  }

  // Don't render if no AdSense ID
  if (!adsenseId) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: format === 'rectangle' ? '250px' : '90px',
        }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

/**
 * Horizontal banner ad (typically 728x90 or responsive)
 */
export function HorizontalAdBanner({
  slot,
  className = '',
}: {
  slot: string;
  className?: string;
}) {
  return (
    <AdBanner
      slot={slot}
      format="horizontal"
      className={`my-4 ${className}`}
    />
  );
}

/**
 * Rectangle ad (300x250)
 */
export function RectangleAdBanner({
  slot,
  className = '',
}: {
  slot: string;
  className?: string;
}) {
  return (
    <AdBanner
      slot={slot}
      format="rectangle"
      className={`my-4 ${className}`}
    />
  );
}

/**
 * In-feed ad for article/content lists
 */
export function InFeedAd({
  slot,
  className = '',
}: {
  slot: string;
  className?: string;
}) {
  const { data: session } = useSession();

  if (session?.user?.id) return null;

  return (
    <div className={`py-4 ${className}`}>
      <AdBanner slot={slot} format="auto" />
    </div>
  );
}
