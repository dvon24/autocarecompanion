import type { Metadata } from 'next';
import { VisualTestClient } from './VisualTestClient';

// Internal proof-of-concept — keep it out of the index and out of search.
export const metadata: Metadata = {
  title: 'Visual test — interactive issue diagram (POC)',
  robots: { index: false, follow: false },
};

export default function VisualTestPage() {
  return <VisualTestClient />;
}
