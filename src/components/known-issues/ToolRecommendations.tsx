'use client';

import type { AffiliateTool } from '@/lib/affiliate-tools';
import { trackAffiliateClick } from '@/lib/analytics';

/**
 * A compact "tools that help" affiliate rail for known-issues / DTC pages.
 * Surfaces UNIVERSAL, no-fitment tools matched to the page context (see
 * src/lib/affiliate-tools.ts). Clicks route through trackAffiliateClick so they
 * land in the same admin affiliate-click report as every other buy link.
 */
export function ToolRecommendations({
  tools,
  make,
  model,
  heading = 'Tools that help with these problems',
  issueId = 'tools',
}: {
  tools: AffiliateTool[];
  make?: string;
  model?: string;
  heading?: string;
  issueId?: string;
}) {
  if (!tools || tools.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5" aria-label="Recommended tools">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h2 className="text-base font-bold text-gray-900">{heading}</h2>
        <span className="text-[11px] text-gray-400">Amazon · affiliate</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t, i) => (
          <a
            key={t.key}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            onClick={() => trackAffiliateClick({
              issueId,
              partBrand: t.brand,
              partName: t.name,
              linkUrl: t.url,
              recommendationIndex: i,
              vehicleMake: make,
              vehicleModel: model,
            })}
            className="group flex flex-col rounded-xl border border-gray-200 p-3 hover:border-blue-400 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>{t.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 leading-tight truncate">{t.name}</div>
                <div className="text-[11px] text-gray-500">{t.brand} · {t.priceHint}</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 leading-snug">{t.blurb}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-800">
              View on Amazon →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
