const NHTSA_RECALLS_API = 'https://api.nhtsa.gov/recalls/recallsByVehicle';

interface NHTSARecall {
  NHTSACampaignNumber: string;
  Manufacturer: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  ParkIt: boolean;
  ParkOutSide: boolean;
}

export interface RecallItem {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
  parkIt: boolean;
  severity: 'critical' | 'high' | 'medium';
}

function classifySeverity(r: NHTSARecall): 'critical' | 'high' | 'medium' {
  if (r.ParkIt) return 'critical';
  const c = (r.Consequence || '').toLowerCase();
  if (c.includes('fire') || c.includes('crash') || c.includes('injury') || c.includes('death') || c.includes('loss of control')) return 'high';
  return 'medium';
}

/**
 * Fetch NHTSA recalls for a vehicle (server-side, cached for 24h).
 * Queries multiple recent years and deduplicates by campaign number.
 */
export async function getRecallsForArticle(
  make: string,
  model: string,
  years: number[],
): Promise<RecallItem[]> {
  // Query the 5 most recent years to get relevant recalls
  const recentYears = [...years].sort((a, b) => b - a).slice(0, 5);

  try {
    const allRecalls = new Map<string, RecallItem>();

    const fetches = recentYears.map(async (year) => {
      try {
        const url = `${NHTSA_RECALLS_API}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
        const res = await fetch(url, {
          next: { revalidate: 86400 }, // Cache for 24 hours
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const data = await res.json();
        for (const r of data.results || []) {
          if (!allRecalls.has(r.NHTSACampaignNumber)) {
            allRecalls.set(r.NHTSACampaignNumber, {
              campaignNumber: r.NHTSACampaignNumber,
              component: r.Component,
              summary: r.Summary,
              consequence: r.Consequence,
              remedy: r.Remedy,
              reportDate: r.ReportReceivedDate,
              parkIt: r.ParkIt,
              severity: classifySeverity(r),
            });
          }
        }
      } catch {
        // Silently skip failed year queries
      }
    });

    await Promise.all(fetches);

    const recalls = Array.from(allRecalls.values());
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    recalls.sort((a, b) => {
      const sev = severityOrder[a.severity] - severityOrder[b.severity];
      if (sev !== 0) return sev;
      return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
    });

    return recalls;
  } catch {
    return [];
  }
}
