import { MOTORCYCLE_CATALOG } from '@/lib/known-issues-catalog';
import {
  makeStaticParams,
  makeMetadata,
  MakePage,
  type MakeRouteProps,
} from '@/components/known-issues/catalog/MakeRoute';

// Same make-page template as /known-issues/make/[make], bound to the
// motorcycle catalog.

// --- ISR + dynamic params ---

export const revalidate = 21600;
export const dynamicParams = true;

export function generateStaticParams() {
  return makeStaticParams(MOTORCYCLE_CATALOG);
}

export function generateMetadata(props: MakeRouteProps) {
  return makeMetadata(MOTORCYCLE_CATALOG, props);
}

export default async function MotorcycleMakeLandingPage(props: MakeRouteProps) {
  return MakePage(MOTORCYCLE_CATALOG, props);
}
