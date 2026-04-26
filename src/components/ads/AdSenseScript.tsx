import Script from 'next/script';

/**
 * Google AdSense Script Component
 *
 * Loads the AdSense Auto Ads loader. Mounted inside <head> in layout.tsx
 * with strategy="afterInteractive" so Next renders the script tag exactly
 * as Google specifies (async, crossOrigin=anonymous) without blocking the
 * initial paint. Google AdSense bots check for the literal script src to
 * confirm the site is properly tagged.
 *
 * Falls back to no-op when NEXT_PUBLIC_ADSENSE_ID is missing so previews
 * and local dev don't try to load ads.
 */
export function AdSenseScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!adsenseId) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
