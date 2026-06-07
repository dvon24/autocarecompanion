'use client';

import Link from 'next/link';
import { IssueCategory } from '@/schemas/knownIssue.schema';
import { categoryConfig } from '@/lib/issue-categories';
import { vehicleSlug } from '@/lib/vehicle-slug';

interface ArticleSidebarProps {
  grouped: { category: IssueCategory; count: number; highCount: number }[];
  hasRecalls: boolean;
  recallCount: number;
  make: string;
  model: string;
  /** Year to ground the vehicle-hub deep link. Pass the article's year
   *  range max so the link lands on a real /vehicle/[slug] page. */
  hubYear: number;
}

export function ArticleSidebar({ grouped, hasRecalls, recallCount, make, model, hubYear }: ArticleSidebarProps) {
  const hubSlug = vehicleSlug(hubYear, make, model);
  return (
    <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0 border-r border-gray-200 pr-8 mr-8">
      <nav className="sticky top-8 space-y-6" aria-label="Article navigation">
        {/* TOC */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">In This Article</h2>
          <ul className="space-y-0.5">
            {grouped.map(({ category, count, highCount }) => {
              const config = categoryConfig[category];
              // Anchor text now includes make + model so the link reads
              // "Dodge Avenger Transmission Issues" instead of just
              // "Transmission". Per Gemini's recommendation: descriptive
              // anchor text helps Google associate the target section with
              // specific search terms (e.g. "Dodge Avenger transmission").
              const descriptiveLabel = `${make} ${model} ${config.label} Issues`;
              return (
                <li key={category}>
                  <a
                    href={`#${category}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2"
                    aria-label={descriptiveLabel}
                    title={descriptiveLabel}
                  >
                    <span className="flex-shrink-0 w-5 text-center">{config.icon}</span>
                    <span className="truncate">{model} {config.label}</span>
                    <span className="text-gray-300 text-xs ml-auto">{count}</span>
                    {highCount > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"
                        title={`${highCount} critical`}
                      />
                    )}
                  </a>
                </li>
              );
            })}
            {hasRecalls && (
              <li>
                <a
                  href="#recalls"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2"
                >
                  <span className="flex-shrink-0 w-5 text-center">&#9888;&#65039;</span>
                  <span>Recalls</span>
                  <span className="text-gray-300 text-xs ml-auto">{recallCount}</span>
                </a>
              </li>
            )}
            <li className="pt-1.5 border-t border-gray-100 mt-1.5">
              <a
                href="#faq"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2"
              >
                <span className="flex-shrink-0 w-5 text-center">&#10067;</span>
                <span>FAQ</span>
              </a>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          {/* Routes to the rich /vehicle/[slug] hub (the new conversational
              surface). Was previously /symptom-chat?make=... — that page is
              the legacy chat and we don't want to send users there anymore. */}
          <Link
            href={`/vehicle/${hubSlug}`}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Open Vehicle Hub
          </Link>
          {/* Find Parts CTA removed — was linking to /get-started which
              redirects to home. Restore when the parts-finder is seeded
              across all YMMT and we have a real destination. */}
        </div>

        {/* Back to top */}
        <a
          href="#top"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Back to top
        </a>
      </nav>
    </aside>
  );
}
