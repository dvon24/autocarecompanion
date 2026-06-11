import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Au7o free-app shell. Strategy: a thin WebView over the live site rather
 * than a bundled build — the product is server-rendered Next.js, so a
 * bundled export would lose SSR/ISR. The shell appends "Au7oApp" to the
 * user agent; the web app already branches on it (src/lib/native-app.ts):
 *   - AdSense loader is suppressed (AdSense-in-WebView violates policy;
 *     monetize the app via AdMob later if wanted)
 *   - paywall/subscribe copy switches to neutral store-safe wording
 *
 * Store posture: the app is the FREE tier. No purchase links in-app —
 * subscriptions happen on the website, never linked from the app (avoids
 * Apple IAP 30% and Play billing requirements entirely).
 */
const config: CapacitorConfig = {
  appId: 'io.au7o.app',
  appName: 'Au7o',
  webDir: 'www', // offline fallback page only — real content is server.url
  server: {
    url: 'https://au7o.io',
    cleartext: false,
  },
  android: {
    appendUserAgent: 'Au7oApp',
    allowMixedContent: false,
  },
  ios: {
    appendUserAgent: 'Au7oApp',
    contentInset: 'automatic',
  },
};

export default config;
