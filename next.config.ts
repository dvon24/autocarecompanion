import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Push the new service worker active immediately on next page load so
  // users don't sit on stale HTML for days after a deploy. Without these
  // flags @ducanh2912/next-pwa waits for ALL tabs to close before
  // activating the new SW — most mobile users never close the PWA, so
  // they were stuck on cached HTML from the first install (e.g. the
  // pre-SEO-fix /known-issues card markup).
  register: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  // skipWaiting + clientsClaim live inside workboxOptions in this
  // package, not at the top level.
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    // Article HTML and the API responses that hydrate it must always
    // come from the network when available. The previous default
    // (StaleWhileRevalidate) served stale HTML to mobile while
    // background-fetching the new version — meaning users saw old
    // cards for 1+ minutes after a deploy. NetworkFirst with a short
    // network timeout keeps it snappy when offline but always prefers
    // a fresh response over a cached one.
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/au7o\.io\/known-issues(\/.*)?$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'known-issues-html',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      {
        // Hub pages — same fast-refresh treatment as known-issues. The
        // default StaleWhileRevalidate was making iOS users sit on the
        // previous deploy's layout for 1-2 refreshes after a release
        // because the SW served cached HTML while background-fetching
        // the new bundle. NetworkFirst with a 4s timeout flips this so
        // users see fresh content immediately, with cache as the offline
        // safety net.
        urlPattern: /^https:\/\/au7o\.io\/vehicle(\/.*)?$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'vehicle-hub-html',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      {
        urlPattern: /^https:\/\/au7o\.io\/api\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api',
          networkTimeoutSeconds: 6,
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // Next.js 16 requires explicit turbopack config when webpack plugins are used
  // @ducanh2912/next-pwa uses webpack, so we need to build with webpack
  // Empty turbopack config silences the warning but still uses webpack for PWA
  turbopack: {},

  // Enable View Transitions API for smooth page transitions
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition
  experimental: {
    viewTransition: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      {
        source: '/get-started',
        destination: '/',
        permanent: true,
      },
      // /symptom-chat redirect removed — the page is a real, in-use
      // diagnostic interface. Multiple buttons across the app
      // (Symptom check in the COMMON ISSUES card, ArticleSidebar,
      // MobileBottomBar, account page) link to it. Sending all that
      // intent to the home page silently broke the flow.
    ];
  },
};

export default withSentryConfig(withPWA(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true, // Suppress logs during build
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: '/monitoring', // Proxy Sentry requests to avoid ad blockers
});
