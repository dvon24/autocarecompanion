import Link from 'next/link';
import Image from 'next/image';
import PolicyFooter from '@/components/shared/PolicyFooter';

export const metadata = {
  title: 'Copyright Policy (DMCA) | Au7o',
  description: 'Copyright Policy and DMCA procedures for Au7o - How we handle copyright infringement claims',
};

export default function CopyrightPage() {
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
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Copyright Policy (DMCA Policy)</h1>
        <p className="text-gray-500 mb-8">Effective Date: May 25, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-8">
            Dvon Invest LLC, a California limited liability company operating the website https://au7o.io (the &quot;Website&quot;) and all associated services (collectively, the &quot;Services&quot;), respects the intellectual property rights of others and expects its users to do the same. This Copyright Policy outlines our procedures for addressing claims of copyright infringement under the Digital Millennium Copyright Act of 1998 (&quot;DMCA&quot;), 17 U.S.C. § 512, and other applicable laws.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Ownership of Content</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on the Services — including but not limited to text, graphics, logos, AI-generated maintenance guides, software, images, videos, data compilations, and the selection and arrangement thereof — is the property of Dvon Invest LLC or its licensors and is protected by United States and international copyright laws. Unauthorized use is strictly prohibited.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Reporting Claims of Copyright Infringement</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you believe that any content available on the Services infringes a copyright that you own or control, you (or your authorized agent) may send a written DMCA takedown notice to our Designated Copyright Agent containing the following information:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-3">
              <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf;</li>
              <li>Identification of the copyrighted work claimed to have been infringed (or a representative list if multiple works are covered);</li>
              <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity, including information reasonably sufficient to permit us to locate the material (e.g., URL);</li>
              <li>Your contact information, including address, telephone number, and email address;</li>
              <li>A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law;</li>
              <li>A statement, made under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on the owner&apos;s behalf.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Designated Copyright Agent</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Notices must be sent to our Designated Copyright Agent:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                <strong>Copyright Agent — Dvon Invest LLC</strong><br />
                Attn: DMCA Designated Agent<br />
                3257 Stiles Ave<br />
                Camarillo, CA 93010<br />
                United States<br />
                Email: <a href="mailto:dvoninvestllc@yahoo.com" className="text-blue-600 hover:underline">dvoninvestllc@yahoo.com</a>
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              This agent is registered with the U.S. Copyright Office DMCA Directory pursuant to 17 U.S.C. § 512(c)(2). To be effective, your notice must be in writing and contain all required elements listed above.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Counter-Notification</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If material you posted has been removed or disabled in response to a DMCA notice, you may file a counter-notification. Your counter-notification must be in writing and include:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-3">
              <li>Your physical or electronic signature;</li>
              <li>Identification of the material that has been removed or disabled and the location where it appeared;</li>
              <li>A statement under penalty of perjury that you have a good-faith belief that the material was removed or disabled as a result of mistake or misidentification;</li>
              <li>Your name, address, and telephone number;</li>
              <li>A statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located (or the Central District of California if your address is outside the U.S.), and that you will accept service of process from the person who provided the original DMCA notice or their agent.</li>
            </ol>
            <p className="text-gray-600 leading-relaxed mt-4">
              Counter-notifications must be sent to the same Copyright Agent listed above.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Repeat Infringer Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              In accordance with the DMCA and other applicable laws, we maintain a policy to terminate, in appropriate circumstances, the accounts of users who are repeat infringers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Misrepresentations</h2>
            <p className="text-gray-600 leading-relaxed">
              Any person who knowingly materially misrepresents that material is infringing, or that material was removed or disabled by mistake or misidentification, may be liable for damages, including costs and attorneys&apos; fees, under 17 U.S.C. § 512(f).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify this Copyright Policy at any time. The updated version will be posted on the Website with a revised Effective Date. Your continued use of the Services after any changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For any questions regarding this Copyright Policy, please contact our Designated Copyright Agent using the information provided above.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Dvon Invest LLC</strong><br />
                3257 Stiles Ave<br />
                Camarillo, CA 93010<br />
                United States<br />
                Email: <a href="mailto:dvoninvestllc@yahoo.com" className="text-blue-600 hover:underline">dvoninvestllc@yahoo.com</a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <PolicyFooter />
    </div>
  );
}
