
/**
 * Routes that must never load the AdSense tag.
 *
 * `/auth` and `/api` are the important ones. Roughly two-thirds of this
 * property's pageviews are credential-stuffing bots hitting `/auth/signin`
 * from SG/CN/HK, and because <AdSenseScript /> sits in the ROOT layout with
 * no route guard, every one of those hits was loading adsbygoogle.js under
 * our publisher ID. GSC corroborates the crawl side of the same problem:
 * 480 `/auth/*?callbackUrl=…` URLs blocked by robots.txt and 79 already in
 * the index (2026-08-27). Ad inventory on a login endpoint is worth nothing
 * and looks exactly like invalid traffic at AdSense review time.
 *
 * The rest are non-content surfaces (admin, account, prototypes) where ads
 * are pointless and, on /dev, actively harmful — that route is noindexed
 * precisely because it is an unfinished prototype gallery.
 */
const NO_ADS_PREFIXES = [
  '/auth',
  '/api',
  '/admin',
  '/account',
  '/dev',
  '/onboarding',
  '/camera-spike',
];

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
 * The route check runs at script-execution time against the LANDING path,
 * which is the case that matters: bots arrive directly on /auth/signin and
 * never navigate. A real user who clicks through from an article to sign in
 * keeps the already-loaded tag, which is correct — that is genuine traffic.
 *
 * The prefix list is emitted with SINGLE quotes rather than JSON.stringify:
 * this is an inline <Script> whose body travels through Next's RSC flight
 * payload, where double quotes come back escaped. The pre-existing
 * 'Au7oApp' check survived for exactly that reason — keep it single-quoted.
 *
 * Falls back to no-op when NEXT_PUBLIC_ADSENSE_ID is missing so previews
 * and local dev don't try to load ads.
 */
export function AdSenseScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID?.trim();
  if (!adsenseId) return null;

  // A PLAIN <script>, not next/script.
  //
  // This is the whole fix. <Script strategy="afterInteractive"> injects the
  // tag from React at hydration — i.e. AFTER Termly's resource-blocker has
  // finished its pass over the initial document. Termly's runtime hook then
  // catches the late insertion and stamps data-termly-unknown-parent="1"
  // regardless of data-categories, and never releases it. Measured on
  // 2026-08-27: with next/script the attribute was present and the script
  // was STILL flagged unknown; the Impact snippet in layout.tsx, which is a
  // plain inline <script> in the same head, came back unknown=false the
  // moment it was given the same attribute.
  //
  // Server-rendering it into <head> puts it in the document Termly reads on
  // its first pass, so data-categories is honoured and the loader is
  // governed by consent instead of silently dead.
  //
  // Note this deliberately does NOT use headers() to do the Au7oApp/route
  // checks server-side: this component renders inside the ROOT layout, and
  // reading headers() there would opt ~15k statically generated pages
  // (generateStaticParams + revalidate=3600) out of SSG. The checks stay in
  // the inline body, where they cost nothing.
  return (
    <script
      id="google-adsense"
      data-categories="advertising"
      dangerouslySetInnerHTML={{
        __html: `(function () {
        if (navigator.userAgent.indexOf('Au7oApp') !== -1) return; // native shell: no AdSense in WebViews
        var blocked = [${NO_ADS_PREFIXES.map((p) => `'${p}'`).join(',')}];
        var path = location.pathname;
        for (var i = 0; i < blocked.length; i++) {
          if (path === blocked[i] || path.indexOf(blocked[i] + '/') === 0) return;
        }
        var s = document.createElement('script');
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}';
        document.head.appendChild(s);
      })();`,
      }}
    />
  );
}
