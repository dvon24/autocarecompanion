import type { Metadata } from 'next';
import { DemoHubClient } from './DemoHubClient';

export const metadata: Metadata = {
  title: 'Try the Au7o tech tree — 2015 Challenger demo',
  description:
    'Click any part of the car to open its tech tree: every component underneath it, what it costs, and which one is documented to fail at your mileage. No account needed.',
};

/**
 * The no-account demo the hero links to. A real 2015 Challenger SRT 392 at
 * 65,000 miles — the same stage the hero shows, with the full hub around it.
 *
 * No SiteHeader and no SiteFooter on purpose. The hub is a 100dvh app shell
 * with its own sidebar/topbar and a pinned composer at the bottom; site chrome
 * above it pushed the input below the fold on a phone, and chrome below it hung
 * off the end of a viewport-height layout. The hub owns the whole viewport.
 */
export default function DemoHubPage() {
  return <DemoHubClient />;
}
