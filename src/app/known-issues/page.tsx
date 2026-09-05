import { Metadata } from 'next';
import { CAR_CATALOG } from '@/lib/known-issues-catalog';
import { IndexPage } from '@/components/known-issues/catalog/IndexRoute';

// Template in components/known-issues/catalog/IndexRoute, shared with
// /motorcycle-issues. This file binds the automotive catalog and keeps the
// index metadata exactly as it has been indexed.

// --- ISR ---

export const revalidate = 1800; // Re-generate cached page every 30 minutes

export const metadata: Metadata = {
  title: 'Known Vehicle Issues & Problems | Au7o',
  description:
    'Browse 4,200+ documented vehicle problems across 40+ makes and 650+ models, plus 323 OBD-II error codes. Symptoms, repair costs, and solutions compiled from NHTSA recalls, manufacturer TSBs, owner forums, and field reports.',
  openGraph: {
    title: 'Known Vehicle Issues & Problems | Au7o',
    description:
      'Browse 4,100+ documented vehicle problems across 34 makes and 640+ models.',
    url: 'https://au7o.io/known-issues',
    siteName: 'Au7o',
  },
  alternates: {
    canonical: 'https://au7o.io/known-issues',
  },
};

export default async function KnownIssuesIndexPage() {
  return IndexPage(CAR_CATALOG);
}
