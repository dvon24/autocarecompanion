import Script from 'next/script';

/**
 * Google AdSense Script Loader
 *
 * Loads the AdSense library only when NEXT_PUBLIC_ADSENSE_ID is configured.
 * Renders nothing when the env var is absent — zero overhead.
 *
 * Add this component once in the root layout (already done in layout.tsx).
 */
export function AdScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!clientId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
