import Link from 'next/link';

const PRIVACY_POLICY_UUID = 'e726c597-24aa-4113-99da-fce3e9bf5a6a';

/**
 * Footer rendered at the bottom of every policy page (privacy, cookies,
 * terms, copyright, data-rights). Replaces five near-identical inline
 * <footer> blocks so future legal links land in one place.
 *
 * Layout intentionally splits into two rows:
 *
 *   Primary row    — the four classic policy links users look for first.
 *                    Default visible size.
 *
 *   Secondary row  — request/preference controls + CCPA-mandated links.
 *                    Smaller text + lighter weight so the row reads as
 *                    "exercise your rights here" rather than competing
 *                    with the primary links for attention.
 *
 * CCPA Cal. Civ. Code § 1798.135 requires the exact phrasing
 * "Do Not Sell or Share My Personal Information" and "Limit the Use
 * Of My Sensitive Personal Information" — abbreviating those strings
 * is a regulatory violation. Don't shorten them when refactoring.
 *
 * The Consent Preferences <a> hooks Termly's CMP via the class name
 * `termly-display-preferences` — clicking opens the preference modal.
 * Required by GDPR Art. 7(3): users must be able to change consent
 * after the initial banner accept.
 *
 * Both CCPA links route to Termly's hosted notify/DSAR endpoint
 * (same backend that powers /data-rights). The Privacy Policy UUID
 * is baked in here as a constant — if the policy UUID ever changes
 * in Termly, update PRIVACY_POLICY_UUID above (and also in
 * /privacy, /data-rights, and any other place the iframe is embedded).
 */
export default function PolicyFooter() {
  return (
    <footer className="border-t border-gray-100 mt-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Primary policy links */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-gray-900">Terms and Conditions</Link>
          <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-gray-900">Cookie Policy</Link>
          <Link href="/copyright" className="hover:text-gray-900">Copyright Policy</Link>
        </div>

        {/* Secondary row — data-rights / consent / CCPA opt-out links.
            Smaller + lighter so the row reads as a controls strip. */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400 mt-4">
          <Link href="/data-rights" className="hover:text-gray-700">Data Rights Request</Link>
          <a
            href="#"
            className="termly-display-preferences hover:text-gray-700 cursor-pointer"
          >
            Consent Preferences
          </a>
          <a
            href={`https://app.termly.io/notify/${PRIVACY_POLICY_UUID}`}
            className="hover:text-gray-700"
          >
            Do Not Sell or Share My Personal Information
          </a>
          <a
            href={`https://app.termly.io/notify/${PRIVACY_POLICY_UUID}`}
            className="hover:text-gray-700"
          >
            Limit the Use Of My Sensitive Personal Information
          </a>
        </div>
      </div>
    </footer>
  );
}
