import Script from 'next/script';

/**
 * Google Funding Choices / Consent Management Platform (CMP)
 *
 * Loads the Google consent banner for GDPR (EEA/UK/Switzerland).
 * Must load BEFORE AdSense script. Configure the message in AdSense dashboard:
 * Privacy & messaging > GDPR > Manage.
 *
 * Only renders when NEXT_PUBLIC_ADSENSE_ID is set (same gate as AdSense).
 */
export function GoogleConsentScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-consent-defaults"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'granted',
              'wait_for_update': 500,
            });
          `,
        }}
      />
      <Script
        async
        src={`https://fundingchoicesmessages.google.com/i/${adsenseId}?ers=1`}
        strategy="afterInteractive"
      />
      <Script
        id="google-fc-present"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px; position: absolute;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; iframe.id = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`,
        }}
      />
    </>
  );
}
