'use client';

import Script from 'next/script';

/**
 * Microsoft Clarity — session recordings + heatmaps.
 *
 * Project id is public (like the AdSense client id), so it's inlined
 * rather than routed through an env var that would also need to be set
 * in the Vercel dashboard.
 *
 * GDPR: Termly's resource-blocker (first script in <head>) recognizes
 * clarity.ms as an analytics tracker and holds it until the visitor grants
 * analytics consent — it gates by URL, so it works regardless of when this
 * bootstrap runs. Loaded lazyOnload (NOT beforeInteractive) so the session-
 * replay tag never blocks render — beforeInteractive was a major LCP/INP
 * drag (Clarity field data 2026-06: LCP 16s). Also enable "Consent Mode" in
 * the Clarity dashboard so it honors the Google Consent Mode v2 signals
 * Termly already emits.
 */

const CLARITY_PROJECT_ID = 'x4x8n6wh5z';

export function MicrosoftClarity() {
  return (
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
