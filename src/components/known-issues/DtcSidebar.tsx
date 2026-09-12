import Link from 'next/link';
import { FaqIcon } from './IssueCategoryIcon';
import { DtcAnchorLink } from './DtcAnchorLink';

export function DtcMobileToc({ heading, entries }: Pick<DtcSidebarProps, 'heading' | 'entries'>) {
  return (
            <nav className="lg:hidden bg-white border border-[#E3DFD4] rounded-lg p-4 mb-6" aria-label="Models on this page">
              <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">{heading}</h2>
              <ul className="space-y-1">
                {entries.map((e) => (
                  <li key={e.anchor}>
                    <DtcAnchorLink anchor={e.anchor} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1">
                      {e.span && <span className="font-mono text-[10px] text-[#94A3B8]">{e.span}</span>}
                      <span>{e.label}</span>
                      <span className="text-[#94A3B8] text-xs ml-auto">{e.count}</span>
                      {e.highCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#3C313D] flex-shrink-0" />}
                    </DtcAnchorLink>
                  </li>
                ))}
                <li className="pt-1 border-t border-[#E3DFD4] mt-1">
                  <a href="#faq" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
                      <FaqIcon className="h-4 w-4" />
                    </span>
                    <span>FAQ</span>
                  </a>
                </li>
              </ul>
            </nav>
  );
}

/**
 * Sticky desktop sidebar for the DTC pages — the ArticleSidebar design
 * (same classes, same rhythm) with a model list instead of a category list,
 * plus the "same code on other makes" rail so the code x make pages form a
 * connected library rather than 2,500 isolated leaves. Client anchor links
 * notify collapsed model sections when a fragment is visited again.
 */

export interface DtcSidebarEntry {
  /** Section anchor id (without '#'). */
  anchor: string;
  label: string;
  count: number;
  highCount: number;
  /** Optional year span shown before the label. */
  span?: string;
}

interface DtcSidebarProps {
  heading: string;
  entries: DtcSidebarEntry[];
  otherMakes?: { label: string; href: string }[];
  otherMakesHeading?: string;
}

export function DtcSidebar({ heading, entries, otherMakes = [], otherMakesHeading = 'Same code on' }: DtcSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0 border-r border-[#E3DFD4] pr-8 mr-8">
      <nav className="sticky top-8 space-y-6" aria-label="Page navigation">
        <div>
          <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">{heading}</h2>
          <ul className="space-y-0.5">
            {entries.map((e) => (
              <li key={e.anchor}>
                <DtcAnchorLink
                  anchor={e.anchor}
                  className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2"
                  title={e.label}
                >
                  {e.span && <span className="font-mono text-[10px] text-[#94A3B8] flex-shrink-0">{e.span}</span>}
                  <span className="truncate">{e.label}</span>
                  <span className="text-[#94A3B8] text-xs ml-auto">{e.count}</span>
                  {e.highCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3C313D] flex-shrink-0" title={`${e.highCount} critical`} />
                  )}
                </DtcAnchorLink>
              </li>
            ))}
            <li className="pt-1.5 border-t border-[#E3DFD4] mt-1.5">
              <a
                href="#faq"
                className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
                  <FaqIcon className="h-3.5 w-3.5" />
                </span>
                <span>FAQ</span>
              </a>
            </li>
          </ul>
        </div>

        {otherMakes.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">{otherMakesHeading}</h2>
            <ul className="space-y-0.5">
              {otherMakes.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="block text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 truncate"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Link
            href="/get-started"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-semibold text-white bg-[#3B82F6] border border-[#3B82F6] rounded-lg hover:bg-[#2563EB] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Diagnose my car
          </Link>
        </div>

        <a href="#top" className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Back to top
        </a>
      </nav>
    </aside>
  );
}
