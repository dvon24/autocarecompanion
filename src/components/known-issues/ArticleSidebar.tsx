'use client';

import Link from 'next/link';
import { IssueCategory } from '@/schemas/knownIssue.schema';
import { categoryConfig } from '@/lib/issue-categories';

interface ArticleSidebarProps {
  grouped: { category: IssueCategory; count: number; highCount: number }[];
  hasRecalls: boolean;
  recallCount: number;
  make: string;
  model: string;
}

export function ArticleSidebar({ grouped, hasRecalls, recallCount, make, model }: ArticleSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0">
      <nav className="sticky top-8 space-y-6" aria-label="Article navigation">
        {/* TOC */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">In This Article</h2>
          <ul className="space-y-1">
            {grouped.map(({ category, count, highCount }) => {
              const config = categoryConfig[category];
              return (
                <li key={category}>
                  <a
                    href={`#${category}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
                  >
                    <span className="flex-shrink-0 w-5 text-center">{config.icon}</span>
                    <span className="truncate">{config.label}</span>
                    <span className="text-gray-400 text-xs ml-auto">{count}</span>
                    {highCount > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"
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
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
                >
                  <span className="flex-shrink-0 w-5 text-center">&#9888;&#65039;</span>
                  <span>Recalls</span>
                  <span className="text-gray-400 text-xs ml-auto">{recallCount}</span>
                </a>
              </li>
            )}
            <li className="pt-1 border-t border-gray-100 mt-1">
              <a
                href="#faq"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
              >
                <span className="flex-shrink-0 w-5 text-center">?</span>
                <span>FAQ</span>
              </a>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          <Link
            href={`/symptom-chat?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Symptom Chat
          </Link>
          <Link
            href="/get-started"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Find Parts
          </Link>
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
