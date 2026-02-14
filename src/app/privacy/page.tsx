import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Privacy Policy | Au7o',
  description: 'Privacy Policy for Au7o - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Effective Date: February 12, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            This Privacy Policy (the &quot;Policy&quot;) describes how Dvon Invest LLC, a limited liability company organized and existing under the laws of the State of California, with its principal place of business in California, United States (the &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), collects, uses, discloses, and protects your personal information when you access or use our website located at https://au7o.io (the &quot;Website&quot;), including any subdomains, mobile applications, features, content, services, or other materials offered thereon (collectively, the &quot;Services&quot;).
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            The Services include AI-powered vehicle maintenance tools, VIN decoding, symptom diagnosis, repair guide generation, part search with affiliate links to third-party retailers, and future features. By using the Services, you consent to the practices described in this Policy. If you do not agree, please do not use the Services. This Policy is incorporated into our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Scope and Application</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              This Policy applies to all users of the Services, including visitors and registered account holders, regardless of location. The Services are available globally. While the Website may be accessed from anywhere, certain features such as affiliate links to retailers may be region-specific.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This Policy does not apply to information collected by third-party sites or services linked to or integrated with our Services, such as Amazon, AutoZone, RockAuto, YouTube, or authentication providers, which have their own privacy practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Types of Personal Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect various categories of personal information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Identifiers:</strong> Name, email address, and Account credentials (if you create an account)</li>
              <li><strong>Vehicle Information:</strong> VIN, year, make, model, trim, and mileage you enter for repair guides</li>
              <li><strong>Internet or Network Activity:</strong> Browsing history, IP address, device information, and interactions with AI features</li>
              <li><strong>Geolocation Data:</strong> General location derived from your IP address or timezone for region-specific retailer prioritization</li>
              <li><strong>Inferences:</strong> Maintenance preferences derived from your usage patterns</li>
              <li><strong>Voluntarily Provided Information:</strong> Feedback, symptom descriptions, or other information you provide</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not collect sensitive personal information (e.g., Social Security numbers, financial account details) as we do not process any transactions directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Sources from Which We Collect Personal Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We obtain personal information from multiple sources:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Directly from you:</strong> When you create an Account, enter vehicle data, use AI symptom chat, or interact with repair guides</li>
              <li><strong>Automatically:</strong> Through cookies, web beacons, and server logs as you navigate the Services</li>
              <li><strong>From authentication providers:</strong> If you sign in using Google, GitHub, or other OAuth providers</li>
              <li><strong>From public online sources:</strong> Used by our AI to provide vehicle maintenance information</li>
              <li><strong>From service providers:</strong> Analytics providers assisting with usage statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Purposes for Collecting and Using Personal Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use your personal information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and improve the Services, including AI-powered repair guides, VIN decoding, and part search</li>
              <li>Generate accurate, vehicle-specific maintenance guidance</li>
              <li>Personalize your experience, such as prioritizing retailers based on your region</li>
              <li>Save your vehicle information and guide progress for future sessions</li>
              <li>Communicate with you regarding updates or service-related notices</li>
              <li>Analyze usage patterns to enhance functionality and security</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud or enforce our Terms</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not use your data for automated decision-making that produces legal effects without your consent.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">Lawful Bases for EU/UK Users</h3>
            <p className="text-gray-600 leading-relaxed mb-2">
              Where GDPR applies, we process personal data on the following legal bases:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Your consent (e.g., Account creation)</li>
              <li>Performance of a contract (e.g., providing the Services)</li>
              <li>Our legitimate interests (e.g., improving Services, preventing fraud)</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Disclosure of Personal Information to Third Parties</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may disclose your personal information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Service providers:</strong> Analytics firms and hosting providers, bound by contractual obligations to protect your data</li>
              <li><strong>Authentication providers:</strong> Google, GitHub, or other OAuth providers if you choose to sign in with them</li>
              <li><strong>Legal authorities:</strong> If required by law, subpoena, or to protect our rights</li>
              <li><strong>Successors:</strong> In the event of a merger, acquisition, or asset sale</li>
              <li><strong>With your consent:</strong> For other purposes you explicitly agree to</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not share data with unaffiliated third parties for their independent marketing without your explicit opt-in. When you click affiliate links to third-party retailers (Amazon, AutoZone, etc.), those retailers may collect information according to their own privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Sale or Sharing of Personal Information Under CCPA</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In the past twelve (12) months, we have not &quot;sold&quot; personal information as defined under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA).
            </p>
            <p className="text-gray-600 leading-relaxed">
              However, certain disclosures (e.g., to advertising partners or via cookies) may constitute &quot;sharing&quot; for cross-context behavioral advertising. You have the right to opt out of such sharing. We do not knowingly sell or share personal information of consumers under sixteen (16) years of age.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Local Storage and Data on Your Device</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Most of your data stays on your device. We use browser localStorage to save:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Your vehicle information (VIN, year, make, model)</li>
              <li>Guide progress and checked items</li>
              <li>Offline-saved guides</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              This data never leaves your device unless you explicitly sync or share it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Security Measures</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These include secure servers, access controls, and regular security reviews. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your Account credentials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Data Retention Practices</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this Policy, including for the duration of your Account, to comply with legal requirements, or resolve disputes. When no longer needed, we securely delete or anonymize data. Analytics data may be aggregated and retained indefinitely in anonymized form.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Cookies and Similar Tracking Technologies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies, pixels, local storage, and similar technologies to enhance functionality, analyze trends, and deliver targeted content. These include essential cookies for site operation and performance cookies for analytics.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Third parties like Google Analytics may place cookies on our behalf. You can manage preferences via browser settings or our{' '}
              <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>, but disabling cookies may limit Services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              California residents may exercise their &quot;Do Not Sell or Share My Personal Information&quot; rights through our designated link, where applicable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Third-Party Services and Affiliate Links</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Services provide links to third-party websites including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Automotive parts retailers:</strong> Amazon, AutoZone, RockAuto, O&apos;Reilly Auto Parts, Advance Auto Parts</li>
              <li><strong>Video platforms:</strong> YouTube for tutorial and review videos</li>
              <li><strong>Authentication providers:</strong> Google, GitHub (if you choose to sign in)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              These third parties may collect your information independently, governed by their privacy policies. We are not responsible for their practices. Affiliate links may track referrals, and clicking them constitutes consent to such tracking. Review third-party policies before interacting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              The Services are not intended for children under thirteen (13) years of age, and we do not knowingly collect personal information from them. If you are under eighteen (18), you must have parental consent to use the Services. In compliance with the Children&apos;s Online Privacy Protection Act (COPPA), if we learn we have collected data from a child under thirteen (13) without verifiable parental consent, we will delete it promptly. Parents may contact us to review or delete such data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. International Users and Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              While the Services are designed for global use, individuals located in the European Union (EU), United Kingdom (UK), or other regions should be aware that their data may be transferred to and processed in the United States, which may have different data protection standards.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              If an EU or UK resident creates an Account, submits personal information, or otherwise uses the Services, the processing of their personal data becomes subject to the General Data Protection Regulation (GDPR) or UK GDPR.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We rely on your consent and/or our legitimate interests (such as providing the Services) as lawful bases for processing EU/UK user data. By using the Services, you acknowledge and consent to cross-border data transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Your Privacy Rights Under Applicable Laws</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have rights such as:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccuracies</li>
              <li>Deletion under certain circumstances</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing for marketing</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">California Residents (CCPA/CPRA)</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              California residents have additional rights, including knowing categories of data collected, opting out of sales/sharing, and limiting use of sensitive data.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">EU and UK Users (GDPR)</h3>
            <p className="text-gray-600 leading-relaxed mb-2">
              Additional GDPR rights apply, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>The right to withdraw consent at any time</li>
              <li>The right to object to processing based on legitimate interests</li>
              <li>The right to request restriction of processing</li>
              <li>The right to lodge a complaint with your local data protection authority</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">15. How to Exercise Your Privacy Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To exercise rights, submit a verifiable request via email to{' '}
              <a href="mailto:dvoninvestllc@yahoo.com" className="text-blue-600 hover:underline">dvoninvestllc@yahoo.com</a>{' '}
              or through your Account settings. Include sufficient details to verify your identity (e.g., email associated with Account).
            </p>
            <p className="text-gray-600 leading-relaxed">
              We will respond within forty-five (45) days (extendable by forty-five (45) days if needed). We do not discriminate against users exercising rights. For opt-outs (e.g., Do Not Sell/Share), use our designated link or Global Privacy Control signals.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Non-Discrimination for Exercising Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              We will not discriminate against you for exercising privacy rights, including by denying Services, charging different prices, or providing lesser quality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">17. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Policy periodically to reflect changes in our practices or legal requirements. Revised versions will be posted on the Website with an updated Effective Date. Material changes will be notified via email or prominent notice. Your continued use constitutes acceptance. Review this Policy regularly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">18. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-600 leading-relaxed">
              This Policy is governed by California law, without regard to conflicts principles. Disputes shall be resolved through binding arbitration in California under American Arbitration Association rules, except for small claims or injunctive relief. You waive class actions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">19. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For privacy inquiries, requests, or complaints, contact:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Dvon Invest LLC</strong><br />
                3257 Stiles Avenue<br />
                Camarillo, California 93010<br />
                Email: <a href="mailto:dvoninvestllc@yahoo.com" className="text-blue-600 hover:underline">dvoninvestllc@yahoo.com</a>
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              We aim to respond within thirty (30) days. For CCPA agent authorization, provide written permission.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-900">Terms and Conditions</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-gray-900">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
