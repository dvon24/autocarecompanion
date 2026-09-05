import { MOTORCYCLE_CATALOG } from '@/lib/known-issues-catalog';
import {
  articleStaticParams,
  articleMetadata,
  ArticlePage,
  type ArticleRouteProps,
} from '@/components/known-issues/catalog/ArticleRoute';

// Same article template as /known-issues/[slug], bound to the motorcycle
// catalog (KnownIssue.vehicleType = 'motorcycle'). Separate URL root because
// make names collide across classes: /known-issues/make/honda is cars.

// --- ISR + dynamic params ---

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return articleStaticParams(MOTORCYCLE_CATALOG);
}

export function generateMetadata(props: ArticleRouteProps) {
  return articleMetadata(MOTORCYCLE_CATALOG, props);
}

export default async function MotorcycleIssuesArticlePage(props: ArticleRouteProps) {
  return ArticlePage(MOTORCYCLE_CATALOG, props);
}
