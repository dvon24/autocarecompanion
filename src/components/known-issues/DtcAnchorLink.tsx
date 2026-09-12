'use client';

import type { ReactNode } from 'react';
import { openKnownIssueArticle } from '@/lib/known-issue-navigation';

/** Notify collapsed sections even when clicking the URL's current fragment. */
export function DtcAnchorLink({ anchor, children, className, title }: {
  anchor: string; children: ReactNode; className?: string; title?: string;
}) {
  return <a href={`#${encodeURIComponent(anchor)}`} className={className} title={title} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openKnownIssueArticle(anchor);
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }}>{children}</a>;
}
