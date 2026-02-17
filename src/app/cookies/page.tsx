import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Cookie Policy | Au7o',
  description: 'Cookie Policy for Au7o - How we use cookies and similar technologies',
};

export default function CookiesPage() {
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
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-500 mb-8">Effective Date: February 12, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            This Cookie Policy (the &quot;Policy&quot;) explains how Dvon Invest LLC, a limited liability company organized and existing under the laws of the State of California, with its principal place of business in California, United States (the &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), uses cookies, web beacons, pixels, local storage, and other similar technologies (collectively, &quot;Tracking Technologies&quot;) on the website located at https://au7o.io (the &quot;Website&quot;) and any related services (the &quot;Services&quot;).
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            By using the Services, you consent to the use of Tracking Technologies as described in this Policy. This Policy is part of and incorporated into our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>. If you do not agree, please adjust your browser settings or discontinue use of the Services.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cookies are small text files stored on your device (computer, smartphone, or tablet) by your web browser when you visit a website. They allow websites to recognize your device and remember information about your visit, such as preferences, login status, or items in a shopping cart.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Similar technologies include web beacons (small graphic images that track page views), pixels (code snippets that record user actions), and local storage (browser-based data storage for larger data sets).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the following categories of cookies:
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Essential Cookies</h3>
              <p className="text-gray-600 text-sm mb-4">
                These cookies are necessary for the Website to function and cannot be switched off. They are usually set in response to your actions, such as logging in or filling in forms.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-700">Cookie</th>
                    <th className="pb-2 font-medium text-gray-700">Purpose</th>
                    <th className="pb-2 font-medium text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">next-auth.session-token</td>
                    <td className="py-2">User authentication session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">next-auth.csrf-token</td>
                    <td className="py-2">Security (CSRF protection)</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">next-auth.callback-url</td>
                    <td className="py-2">Authentication redirect</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Performance/Analytics Cookies</h3>
              <p className="text-gray-600 text-sm mb-4">
                These cookies collect anonymous information about how visitors use the Website, helping us improve functionality and user experience.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-700">Cookie</th>
                    <th className="pb-2 font-medium text-gray-700">Purpose</th>
                    <th className="pb-2 font-medium text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">_ga</td>
                    <td className="py-2">Google Analytics - distinguishes users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">_ga_*</td>
                    <td className="py-2">Google Analytics - maintains session state</td>
                    <td className="py-2">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Functional Cookies</h3>
              <p className="text-gray-600 text-sm mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-700">Cookie</th>
                    <th className="pb-2 font-medium text-gray-700">Purpose</th>
                    <th className="pb-2 font-medium text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">cookie-consent</td>
                    <td className="py-2">Stores your cookie preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Local Storage</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In addition to cookies, we use browser localStorage to save data locally on your device. This data stays on your device and is not transmitted to our servers unless you explicitly sync or share it.
            </p>

            <div className="bg-gray-50 rounded-xl p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium text-gray-700">Key</th>
                    <th className="pb-2 font-medium text-gray-700">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">au7o-vehicle</td>
                    <td className="py-2">Your saved vehicle information (VIN, year, make, model)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">au7o-guide-progress</td>
                    <td className="py-2">Your repair guide progress and checked items</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">au7o-offline-guides</td>
                    <td className="py-2">Guides saved for offline use</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">au7o-symptom-history</td>
                    <td className="py-2">Previous symptom chat conversations</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Google Analytics:</strong> We use Google Analytics to understand how visitors interact with our Website. Google may set cookies to collect anonymous usage data. See{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google&apos;s Privacy Policy</a>.
              </li>
              <li><strong>Authentication Providers:</strong> If you sign in using Google, GitHub, or other OAuth providers, they may set their own cookies. Please refer to their respective privacy policies.</li>
              <li><strong>Affiliate Links:</strong> When you click links to third-party retailers (Amazon, AutoZone, RockAuto, etc.), those sites may set their own cookies to track referrals. We do not control these cookies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Purposes of Using Tracking Technologies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use Tracking Technologies for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Authentication:</strong> To recognize you when you sign in and maintain your session</li>
              <li><strong>Security:</strong> To protect against unauthorized access and cross-site request forgery</li>
              <li><strong>Preferences:</strong> To remember your settings, such as cookie consent choices</li>
              <li><strong>Analytics:</strong> To understand how visitors use the Website and identify areas for improvement</li>
              <li><strong>Local Data Storage:</strong> To save your vehicle information and guide progress on your device</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4 mb-4">
              <strong>Note:</strong> Blocking essential cookies may prevent you from using certain features of the Website, such as signing in or saving your progress.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              For more information on managing cookies in your browser:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Opt-Out of Analytics</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To opt out of Google Analytics tracking across all websites, you can install the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Do Not Track Signals</h2>
            <p className="text-gray-600 leading-relaxed">
              Some browsers have a &quot;Do Not Track&quot; feature that signals to websites that you do not want your online activity tracked. We honor Do Not Track signals and Global Privacy Control (GPC) signals where technically feasible. When detected, we will limit non-essential tracking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Clearing Local Data</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To clear all Au7o data stored on your device (including localStorage):
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
              <li>Open your browser&apos;s Developer Tools (press F12 or right-click and select &quot;Inspect&quot;)</li>
              <li>Go to the Application tab (Chrome/Edge) or Storage tab (Firefox)</li>
              <li>Find &quot;Local Storage&quot; and select https://au7o.io</li>
              <li>Click &quot;Clear All&quot; or delete individual items</li>
            </ol>
            <p className="text-gray-600 leading-relaxed mt-4">
              Alternatively, most browsers let you clear site data from their settings under Privacy or Security options.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. California Residents</h2>
            <p className="text-gray-600 leading-relaxed">
              Under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), certain uses of cookies may constitute &quot;sharing&quot; of personal information for cross-context behavioral advertising. California residents have the right to opt out of such sharing. To exercise this right, use our designated &quot;Do Not Sell or Share My Personal Information&quot; link or enable Global Privacy Control (GPC) in your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. EU/UK Users (GDPR)</h2>
            <p className="text-gray-600 leading-relaxed">
              If you are located in the European Union or United Kingdom, we rely on your consent for non-essential cookies. You may withdraw consent at any time by adjusting your browser settings or using our cookie preferences (where available). Essential cookies that are strictly necessary for the Website to function do not require consent under GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Updates to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Cookie Policy periodically to reflect changes in technology, legal requirements, or our practices. We will post the revised Policy on this page with an updated Effective Date. We encourage you to review this Policy regularly to stay informed about our use of cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For questions about our use of cookies or this Policy, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Dvon Invest LLC</strong><br />
                3257 Stiles Avenue<br />
                Camarillo, California 93010<br />
                Email: <a href="mailto:dvoninvestllc@yahoo.com" className="text-blue-600 hover:underline">dvoninvestllc@yahoo.com</a>
              </p>
            </div>
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
            <Link href="/copyright" className="hover:text-gray-900">Copyright Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
