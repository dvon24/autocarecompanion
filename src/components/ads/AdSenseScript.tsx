import Script from 'next/script';

/**
 * Google AdSense Script Component
 *
 * Epic 5, Story 5.9: Ads for Anonymous Users
 * Loads the AdSense script only when NEXT_PUBLIC_ADSENSE_ID is configured.
 */
export function AdSenseScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  // Don't load script if no AdSense ID
  if (!adsenseId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
