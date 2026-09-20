export type PreviewCheckoutLinks = { visual: string; hub: string };

/** Test checkout is an explicit dev-fixture capability, never a production URL. */
export function allowedPreviewCheckoutLinks(links: PreviewCheckoutLinks | undefined, environment: string | undefined): PreviewCheckoutLinks | null {
  if (environment !== 'development' || !links) return null;
  const allowed = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'buy.stripe.com'
        && !url.username && !url.password && !url.port && !url.search && !url.hash
        && /^\/test_[A-Za-z0-9]+$/.test(url.pathname);
    } catch { return false; }
  };
  return allowed(links.visual) && allowed(links.hub) ? links : null;
}
