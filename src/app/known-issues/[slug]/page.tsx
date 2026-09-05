import { CAR_CATALOG } from '@/lib/known-issues-catalog';
import {
  articleStaticParams,
  articleMetadata,
  ArticlePage,
  type ArticleRouteProps,
} from '@/components/known-issues/catalog/ArticleRoute';

// The article template lives in components/known-issues/catalog/ArticleRoute
// and is shared with /motorcycle-issues/[slug]. This file only binds it to
// the automotive catalog and owns the route-segment config.

// --- ISR + dynamic params ---

export const revalidate = 3600; // Re-generate cached pages every 1 hour
export const dynamicParams = true; // Allow on-demand rendering of new slugs

export function generateStaticParams() {
  return articleStaticParams(CAR_CATALOG);
}

export function generateMetadata(props: ArticleRouteProps) {
  return articleMetadata(CAR_CATALOG, props);
}

export default async function KnownIssuesArticlePage(props: ArticleRouteProps) {
  return ArticlePage(CAR_CATALOG, props);
}
