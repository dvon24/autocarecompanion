/**
 * Detect the wrapped Capacitor shell (the "free app" build), which marks
 * itself by appending "Au7oApp" to the WebView user agent.
 *
 * App-store policy requires the native build to show NO purchase prompts
 * that bypass in-app purchase, and AdSense must not load in WebViews —
 * gate any subscribe/upgrade copy and the ads loader on this check.
 * Client-side only; returns false during SSR.
 */
export function isNativeApp(): boolean {
  return typeof navigator !== 'undefined' && navigator.userAgent.includes('Au7oApp');
}
