import Script from 'next/script';

/**
 * Google AdSense Script Component
 *
 * Injects the AdSense Auto Ads loader — but ONLY on the web. The Capacitor
 * shell marks itself with an "Au7oApp" user-agent token, and AdSense for
 * Content inside native WebViews violates AdSense program policy (apps must
 * use AdMob); enforcement is account-level, so serving web ads in the
 * wrapped app risks the ca-pub account that monetizes the whole website
 * (2026-06-12 review finding). The loader is injected client-side after the
 * UA check; AdSense's crawler executes JS, so site verification still sees
 * the literal pagead2 script src in the rendered DOM.
 *
 * Falls back to no-op when NEXT_PUBLIC_ADSENSE_ID is missing so previews
 * and local dev don't try to load ads.
 */
export function AdSenseScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!adsenseId) return null;

  return (
    <Script id="google-adsense" strategy="afterInteractive">
      {`(function () {
        if (navigator.userAgent.indexOf('Au7oApp') !== -1) return; // native shell: no AdSense in WebViews
        var s = document.createElement('script');
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}';
        document.head.appendChild(s);
      })();`}
    </Script>
  );
}
