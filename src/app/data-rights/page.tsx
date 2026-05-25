import Link from 'next/link';
import Image from 'next/image';
import PolicyFooter from '@/components/shared/PolicyFooter';

/**
 * Public-facing Data Subject Access Request (DSAR) intake page.
 *
 * Embeds Termly's hosted DSAR form so EU/UK/CA visitors AND anonymous
 * users (who can't sign in to use the /account page export/delete
 * controls) have a way to exercise their rights under:
 *   - GDPR Articles 15-22 (access, rectification, erasure, restriction,
 *     portability, objection, automated decision-making)
 *   - UK GDPR / Data Protection Act 2018 equivalents
 *   - CCPA/CPRA (California) — know, delete, correct, opt-out of sale
 *   - VCDPA / CPA / CTDPA / UCPA (other US state laws as enacted)
 *
 * Termly routes the submission to dvoninvestllc@yahoo.com (the email
 * configured in the Privacy Policy under ccpa_inquiries_email) and
 * handles identity verification per the request type.
 *
 * Signed-in users with an Au7o account can also use the self-service
 * Export/Delete controls on /account — that's strictly more convenient
 * for them. This page exists for everyone else (and for signed-in
 * users who want to exercise rights this form covers but the in-app
 * controls don't yet, like rectification of a specific field).
 */
export const metadata = {
  title: 'Data Rights Request | Au7o',
  description:
    'Submit a request to access, correct, delete, or restrict the personal data Au7o holds about you, under GDPR, UK GDPR, and US state privacy laws.',
};

export default function DataRightsPage() {
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Rights Request
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Use the form below to ask us to access, correct, delete, or
            restrict the personal data we hold about you. We respond to
            verified requests within 30 days as required by GDPR, UK GDPR,
            and US state privacy laws (CCPA/CPRA, VCDPA, CPA, CTDPA, UCPA).
          </p>
        </div>

        {/* Signed-in shortcut callout — Account page already has
            export and delete controls that are faster than this form
            for the most common requests. The DSAR form remains the
            right path for rectification, restriction, and for anyone
            without an account. */}
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Have an Au7o account?</strong> You can also{' '}
            <Link href="/account" className="underline font-medium hover:text-blue-700">
              download your data or delete your account
            </Link>{' '}
            directly from your account page — no form needed.
          </p>
        </div>

        {/* Termly DSAR form. Uses a fixed iframe height; long forms
            scroll within the frame. Sandbox attribute is intentionally
            omitted because the form needs to submit cross-origin and
            store user input — sandboxing it breaks the submission. */}
        <iframe
          src="https://app.termly.io/dsar/e726c597-24aa-4113-99da-fce3e9bf5a6a"
          title="Data subject access request form"
          style={{
            width: '100%',
            height: '1400px',
            border: 'none',
            display: 'block',
            borderRadius: '12px',
          }}
          loading="lazy"
        />

        <p className="text-xs text-gray-500 mt-6">
          If the form does not load, you can also email us directly at{' '}
          <a href="mailto:dvoninvestllc@yahoo.com" className="underline hover:text-gray-700">
            dvoninvestllc@yahoo.com
          </a>
          .
        </p>
      </main>

      <PolicyFooter />
    </div>
  );
}
