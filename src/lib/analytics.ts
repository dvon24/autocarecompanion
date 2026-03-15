import { trackEvent } from '@/components/analytics/GoogleAnalytics';

interface AffiliateClickParams {
  issueId: string;
  partBrand?: string;
  partName?: string;
  partNumber?: string;
  linkUrl: string;
  recommendationIndex: number;
  vehicleMake?: string;
  vehicleModel?: string;
}

/**
 * Track an affiliate link click.
 * - Fires a GA4 custom event (no-ops if GA isn't configured)
 * - Records the click in the database via the existing track API
 */
export function trackAffiliateClick(params: AffiliateClickParams): void {
  const {
    issueId,
    partBrand,
    partName,
    partNumber,
    linkUrl,
    recommendationIndex,
    vehicleMake,
    vehicleModel,
  } = params;

  // Fire GA4 event (gracefully no-ops if gtag/GA not configured)
  trackEvent('affiliate_click', {
    issue_id: issueId,
    part_brand: partBrand || '',
    part_name: partName || partNumber || '',
    link_url: linkUrl,
    vehicle_make: vehicleMake || '',
    vehicle_model: vehicleModel || '',
  });

  // Record in database via existing API (fire-and-forget)
  fetch('/api/admin/affiliates/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      issueId,
      recommendationIndex,
      link: linkUrl,
      partBrand: partBrand || null,
      partName: partName || partNumber || null,
    }),
  }).catch(() => {
    // Silently ignore tracking failures — don't block the user
  });
}
