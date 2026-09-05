import { Metadata } from 'next';
import { MOTORCYCLE_CATALOG } from '@/lib/known-issues-catalog';
import { IndexPage } from '@/components/known-issues/catalog/IndexRoute';

// Same index template as /known-issues, bound to the motorcycle catalog.

// --- ISR ---

export const revalidate = 1800;

export const metadata: Metadata = {
  // absolute so the root layout's "%s | Au7o" template doesn't double the suffix.
  title: { absolute: MOTORCYCLE_CATALOG.indexMetaTitle },
  description:
    'Documented motorcycle problems by make and model — Harley-Davidson, Honda, Yamaha, Kawasaki, Suzuki, BMW, Ducati, KTM and Triumph. Symptoms, repair costs, and fixes compiled from NHTSA recalls, service bulletins, and owner forums.',
  openGraph: {
    title: MOTORCYCLE_CATALOG.indexMetaTitle,
    description: 'Documented motorcycle problems by make and model, with symptoms, repair costs, and fixes.',
    url: `https://au7o.io${MOTORCYCLE_CATALOG.basePath}`,
    siteName: 'Au7o',
  },
  alternates: {
    canonical: `https://au7o.io${MOTORCYCLE_CATALOG.basePath}`,
  },
};

export default async function MotorcycleIssuesIndexPage() {
  return IndexPage(MOTORCYCLE_CATALOG);
}
