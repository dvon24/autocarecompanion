import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteMapSection } from '@/components/shared/SiteMapSection';

export const metadata: Metadata = {
  title: 'Page not found · Au7o',
  description: "We couldn't find that page. Browse known issues, look up a DTC code, or jump back to the home page.",
  robots: { index: false, follow: true },
};

/**
 * Global 404 page. Next renders this when a route segment calls
 * notFound() or a static slug isn't generated (e.g. /known-issues/dtc/002f
 * with no matching DTC row).
 *
 * Includes the full SiteMapSection so a 404 isn't a dead end — most
 * 404s come from Google with stale URLs, and they should be one click
 * away from anything useful on the site.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-900">
            <Image src="/og-image.png" alt="" width={28} height={28} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Error 404</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">We couldn&apos;t find that page</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            The link may be out of date, or that DTC code / vehicle slug doesn&apos;t exist in our database yet.
            Use the site map below or head back to the home page.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
            >
              Back to home
            </Link>
            <Link
              href="/known-issues"
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
            >
              Browse known issues
            </Link>
            <Link
              href="/known-issues/dtc"
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
            >
              DTC code lookup
            </Link>
          </div>
        </div>

        <SiteMapSection />
      </main>
    </div>
  );
}
