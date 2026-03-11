'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 Component
 *
 * Add your GA4 Measurement ID to .env.local:
 * NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="beforeInteractive"
      />
      <Script id="google-analytics" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track custom events in Google Analytics
 *
 * Usage:
 * import { trackEvent } from '@/components/analytics/GoogleAnalytics';
 * trackEvent('guide_generated', { vehicle: '2020 Toyota Camry', diagnosis: 'Oil Change' });
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // @ts-expect-error gtag is defined by the script above
    window.gtag?.('event', eventName, eventParams);
  }
}
