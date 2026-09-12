import { Metadata } from 'next';
import { MOTORCYCLE_CATALOG, catalogIsDesignPreview, motorcycleCoverageDescription } from '@/lib/known-issues-catalog';
import prisma from '@/lib/db';
import { IndexPage } from '@/components/known-issues/catalog/IndexRoute';

// Same index template as /known-issues, bound to the motorcycle catalog.

// --- ISR ---

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const count = await prisma.knownIssue.count({ where: { status: 'published', vehicleType: 'motorcycle' } });
  const preview = catalogIsDesignPreview(MOTORCYCLE_CATALOG);
  const title = preview ? 'Motorcycle Catalog Design Preview | Au7o' : MOTORCYCLE_CATALOG.indexMetaTitle;
  const description = motorcycleCoverageDescription(count, preview);
  return {
  // absolute so the root layout's "%s | Au7o" template doesn't double the suffix.
  title: { absolute: title },
  description,
  ...(preview || count === 0 ? { robots: { index: false, follow: true } } : {}),
  openGraph: {
    title,
    description,
    url: `https://au7o.io${MOTORCYCLE_CATALOG.basePath}`,
    siteName: 'Au7o',
  },
  alternates: {
    canonical: `https://au7o.io${MOTORCYCLE_CATALOG.basePath}`,
  },
  };
}

export default async function MotorcycleIssuesIndexPage() {
  return IndexPage(MOTORCYCLE_CATALOG);
}
