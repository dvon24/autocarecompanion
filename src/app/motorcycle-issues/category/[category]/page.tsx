import { MOTORCYCLE_CATALOG } from '@/lib/known-issues-catalog';
import {
  categoryStaticParams,
  categoryMetadata,
  CategoryPage,
  type CategoryRouteProps,
} from '@/components/known-issues/catalog/CategoryRoute';

// Same category template as /known-issues/category/[category], bound to the
// motorcycle catalog.

// --- ISR + dynamic params ---

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return categoryStaticParams(MOTORCYCLE_CATALOG);
}

export function generateMetadata(props: CategoryRouteProps) {
  return categoryMetadata(MOTORCYCLE_CATALOG, props);
}

export default async function MotorcycleCategoryLandingPage(props: CategoryRouteProps) {
  return CategoryPage(MOTORCYCLE_CATALOG, props);
}
