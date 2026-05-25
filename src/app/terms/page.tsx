import Link from 'next/link';
import Image from 'next/image';
import TermlyEmbed from '@/components/consent/TermlyEmbed';

export const metadata = {
  title: 'Terms and Conditions | Au7o',
  description: 'Terms and Conditions for Au7o - AI-powered automotive repair guides and part search',
};

/**
 * Terms and Conditions page.
 *
 * Source of truth: Termly policy 0a04ab72-b9f7-40ac-b9b1-e234f78e62a6.
 * Edit the document in the Termly dashboard; this page renders whatever
 * Termly serves at the iframe URL. Used to live as a hardcoded 329-line
 * document; replaced 2026-05-25 to bring Terms onto the same workflow
 * as /privacy and /cookies — single source of truth, no code change
 * needed for policy updates.
 *
 * Differences from the prior hardcoded version that landed in the
 * Termly-published Terms:
 *   - 16+ age (was 18+) — aligns with Privacy Policy GDPR Art. 8 gate
 *   - Correct contact email dvoninvestllc@yahoo.com (was personal)
 *   - 1-year cause-of-action limit (was unspecified)
 *   - $100 / 12-month liability cap (was none — only consequential
 *     damages exclusion)
 *   - Google Maps Platform + Mapbox ToS binding (was missing — required
 *     by Google's API terms)
 *   - Stronger AI-generated repair content disclaimer (was less specific)
 *   - DMCA agent reference with registered Copyright Office contact
 *   - Privacy Policy + Cookie Policy cross-references
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/og-image.png"
              alt="Au7o mascot"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
        </div>
      </header>

      {/* Content — rendered by Termly's hosted policy viewer */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <TermlyEmbed dataId="0a04ab72-b9f7-40ac-b9b1-e234f78e62a6" />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-900">Terms and Conditions</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-gray-900">Cookie Policy</Link>
            <Link href="/data-rights" className="hover:text-gray-900">Data Rights</Link>
            <Link href="/copyright" className="hover:text-gray-900">Copyright Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
