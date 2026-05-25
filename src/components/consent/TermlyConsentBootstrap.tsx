import Script from 'next/script';

const WEBSITE_UUID = 'f4e5ba89-66d6-4eb6-92f0-b9827653b2e8';
const SCRIPT_SRC = `https://app.termly.io/resource-blocker/${WEBSITE_UUID}?autoBlock=on`;

/**
 * Termly Consent Management Platform — initial bootstrap.
 *
 * Server-rendered <Script> tag that loads Termly's resource-blocker
 * BEFORE any Google scripts (GA, AdSense, Funding Choices). The
 * resource-blocker sets the appropriate `gtag('consent', 'default', ...)`
 * signals based on the visitor's region detection so Consent Mode v2
 * defaults arrive before Google tags fire.
 *
 * Why this exists separately from the older `<TermlyCMP />` client
 * component: that one used a `useEffect` hook to inject the script
 * AFTER React hydration, which is AFTER `<Script strategy="beforeInteractive">`
 * tags have already executed. Termly's GCM Validation Scan correctly
 * flagged that as "default consent signals sent too late."
 *
 * This component MUST be the first child of `<head>` in layout.tsx —
 * above `<AdSenseScript />`, `<GoogleAnalytics />`, JSON-LD scripts,
 * etc. — so Termly's resource-blocker arrives first.
 *
 * SPA route-change re-initialization is handled by `<TermlyRouteReinit />`
 * (the body-mounted client component) which calls `window.Termly.initialize()`
 * on each navigation so the consent banner refreshes its scope.
 */
export function TermlyConsentBootstrap() {
  return (
    <Script
      id="termly-resource-blocker"
      src={SCRIPT_SRC}
      strategy="beforeInteractive"
    />
  );
}
