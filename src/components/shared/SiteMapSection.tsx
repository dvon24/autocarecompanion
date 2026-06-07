import Link from 'next/link';

/**
 * Reusable site-map block. Anchored at the bottom of long-form pages
 * (known-issues, account, etc.) so users who land deep can discover
 * the rest of the site without scrolling back to nav. Three columns:
 * "My stuff" (gated by sign-in but never hidden), "Diagnose & research"
 * (the headline product surfaces), "Company & legal" (compliance).
 */
export function SiteMapSection({ className = '' }: { className?: string }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-gray-50 p-6 ${className}`}>
      <h2 className="text-base font-semibold text-gray-900 mb-4">Explore Au7o</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My stuff</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/garage" className="text-blue-600 hover:text-blue-700">Garage</Link></li>
            <li><Link href="/account" className="text-blue-600 hover:text-blue-700">Account</Link></li>
            <li><Link href="/subscribe" className="text-blue-600 hover:text-blue-700">Plans &amp; pricing</Link></li>
            <li><Link href="/drive" className="text-blue-600 hover:text-blue-700">Drive (trip planner)</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Diagnose &amp; research</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/" className="text-blue-600 hover:text-blue-700">Diagnose my car</Link></li>
            <li><Link href="/known-issues" className="text-blue-600 hover:text-blue-700">Known issues index</Link></li>
            <li><Link href="/known-issues/dtc" className="text-blue-600 hover:text-blue-700">DTC code lookup</Link></li>
            <li><Link href="/parts" className="text-blue-600 hover:text-blue-700">Parts finder</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Company &amp; legal</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/about" className="text-blue-600 hover:text-blue-700">About Au7o</Link></li>
            <li><Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy policy</Link></li>
            <li><Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms</Link></li>
            <li><Link href="/data-rights" className="text-blue-600 hover:text-blue-700">Data rights request</Link></li>
            <li><Link href="/sitemap.xml" className="text-blue-600 hover:text-blue-700">XML sitemap (SEO)</Link></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
