'use client';

import Script from 'next/script';

/**
 * Microsoft Clarity — session recordings + heatmaps.
 *
 * Project id is public (like the AdSense client id), so it's inlined
 * rather than routed through an env var that would also need to be set
 * in the Vercel dashboard.
 *
 * GDPR: loads beforeInteractive AFTER the Termly resource-blocker
 * (which is the first script in <head>), so Termly's autoblocker—which
 * recognizes clarity.ms as an analytics tracker—holds it until the
 * visitor grants analytics consent. Also enable "Consent Mode" in the
 * Clarity dashboard (Settings → Setup) so Clarity honors the Google
 * Consent Mode v2 signals Termly already emits.
 */

const CLARITY_PROJECT_ID = 'x4x8n6wh5z';

export function MicrosoftClarity() {
  return (
    <Script id="microsoft-clarity" strategy="beforeInteractive">
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
