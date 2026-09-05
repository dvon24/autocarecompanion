import { CAR_CATALOG } from '@/lib/known-issues-catalog';
import {
  categoryStaticParams,
  categoryMetadata,
  CategoryPage,
  type CategoryRouteProps,
} from '@/components/known-issues/catalog/CategoryRoute';

// Template in components/known-issues/catalog/CategoryRoute, shared with
// /motorcycle-issues/category/[category]. This file binds the automotive catalog.

// --- ISR + dynamic params ---

export const revalidate = 86400; // 24h — only ~17 category pages, change rarely; cuts steady-state DB re-render load (article [slug] pages stay at 1h)
export const dynamicParams = true;

export function generateStaticParams() {
  return categoryStaticParams(CAR_CATALOG);
}

export function generateMetadata(props: CategoryRouteProps) {
  return categoryMetadata(CAR_CATALOG, props);
}

export default async function CategoryLandingPage(props: CategoryRouteProps) {
  return CategoryPage(CAR_CATALOG, props);
}
