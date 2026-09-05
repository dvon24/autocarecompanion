import { CAR_CATALOG } from '@/lib/known-issues-catalog';
import {
  makeStaticParams,
  makeMetadata,
  MakePage,
  type MakeRouteProps,
} from '@/components/known-issues/catalog/MakeRoute';

// Template in components/known-issues/catalog/MakeRoute, shared with
// /motorcycle-issues/make/[make]. This file binds the automotive catalog.

// --- ISR + dynamic params ---

export const revalidate = 21600; // 6h — ~51 make pages, change rarely; cuts steady-state DB re-render load (article [slug] pages stay at 1h)
export const dynamicParams = true; // Allow on-demand rendering of new makes

export function generateStaticParams() {
  return makeStaticParams(CAR_CATALOG);
}

export function generateMetadata(props: MakeRouteProps) {
  return makeMetadata(CAR_CATALOG, props);
}

export default async function MakeLandingPage(props: MakeRouteProps) {
  return MakePage(CAR_CATALOG, props);
}
