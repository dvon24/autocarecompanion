import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Terms and Conditions | Au7o',
  description: 'Terms and Conditions for Au7o - AI-powered automotive repair guides and part search',
};

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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-gray-500 mb-8">Effective Date: February 12, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            These Terms and Conditions (the &quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Dvon Invest LLC, a limited liability company organized and existing under the laws of the State of California, with its principal place of business in California, United States (the &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), governing your access to and use of the website located at https://au7o.io (the &quot;Website&quot;), including any subdomains, mobile applications, features, content, services, or other materials offered thereon (collectively, the &quot;Services&quot;).
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            By accessing or using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>,{' '}
            <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>, and any other policies incorporated herein by reference (collectively, the &quot;Policies&quot;). If you do not agree to these Terms, you must immediately cease using the Services.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Definitions</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For the purposes of these Terms, the following capitalized terms shall have the meanings ascribed to them below:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>&quot;AI Services&quot;</strong> means the artificial intelligence-powered features of the Services, including but not limited to VIN decoding, symptom diagnosis, repair guide generation, part matching, maintenance guides, fluid amount and type recommendations, and other vehicle-related information.</li>
              <li><strong>&quot;Affiliate Links&quot;</strong> means hyperlinks or referrals to third-party retailers and services, including but not limited to Amazon, AutoZone, RockAuto, O&apos;Reilly Auto Parts, Advance Auto Parts, and YouTube, for which we may receive compensation when you make purchases through such links.</li>
              <li><strong>&quot;Content&quot;</strong> means all text, images, data, software, graphics, audio, video, and other materials available through the Services, whether provided by us, you, or third parties.</li>
              <li><strong>&quot;User Data&quot;</strong> means any information, including personal information, vehicle details (VIN, year, make, model, mileage), or usage history, that you provide or that is collected in connection with your use of the Services.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility and Access</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You represent and warrant that you are at least eighteen (18) years of age or the age of majority in your jurisdiction, whichever is greater, and possess the legal capacity to enter into these Terms. The Services are available globally; however, affiliate links to retailers may be region-specific.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you access the Services from outside the United States, you do so at your own risk and are responsible for compliance with local laws. We reserve the right to restrict access to the Services or any portion thereof based on geographic location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration and Security</h2>
            <p className="text-gray-600 leading-relaxed">
              To access certain features of the Services, such as saved vehicles or personalized AI recommendations, you may be required to create an account (&quot;Account&quot;). You agree to provide accurate, current, and complete information during registration and to update such information as necessary. You are solely responsible for maintaining the confidentiality of your Account credentials and for all activities occurring under your Account. You must notify us immediately of any unauthorized use or security breach. We reserve the right to suspend or terminate your Account at our discretion, without liability, for any violation of these Terms or for any other reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Description of Services</h2>

            <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 AI-Powered Vehicle Maintenance Tools</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              An artificial intelligence system that provides: VIN decoding to identify your vehicle; symptom-based diagnosis to help identify potential issues; task-based maintenance guidance (e.g., oil changes, brake replacement, fluid checks); part search links to third-party retailers; and vehicle-related information sourced from publicly available online resources.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Affiliate Links and Third-Party Retailers</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Services provide links to third-party automotive parts retailers (such as Amazon, AutoZone, RockAuto, O&apos;Reilly Auto Parts, and Advance Auto Parts) and video platforms (such as YouTube) to help you find parts and tutorials. We do not sell any products directly. All purchases are made through the respective third-party retailers, subject to their terms and conditions. We may receive affiliate commissions from purchases made through these links at no additional cost to you.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 General Provisions</h3>
            <p className="text-gray-600 leading-relaxed">
              All components of the Services, whether currently available or planned for future release, are provided strictly on an &quot;as is&quot; and &quot;as available&quot; basis. We reserve the right to modify, suspend, or discontinue any feature or functionality at any time without prior notice or liability. Availability of AI recommendations and affiliate links is subject to change without obligation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Conduct and Prohibited Activities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree to use the Services only for lawful purposes and in compliance with these Terms. Prohibited activities include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violating any applicable laws or regulations</li>
              <li>Interfering with the Services or any user&apos;s enjoyment thereof</li>
              <li>Uploading harmful code, viruses, or malware</li>
              <li>Impersonating any person or entity</li>
              <li>Harvesting or collecting User Data without consent</li>
              <li>Engaging in commercial activities not authorized by us</li>
              <li>Reverse engineering, decompiling, or attempting to derive the source code of the Services</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We may monitor your use and take appropriate action, including legal remedies, for any violations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              All Content, including but not limited to the AI algorithms, software, trademarks, logos, and designs associated with the Services, is owned by us or our licensors and protected by United States and international copyright, trademark, patent, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Services for personal, non-commercial purposes only. Any unauthorized use, reproduction, or distribution of our intellectual property is strictly prohibited and may result in severe civil and criminal penalties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. User-Generated Content</h2>
            <p className="text-gray-600 leading-relaxed">
              If you submit any Content to the Services (e.g., vehicle details, feedback), you grant us a worldwide, perpetual, irrevocable, royalty-free license to use, reproduce, modify, distribute, and display such Content in connection with the Services. You represent that you own or have rights to such Content and that it does not infringe third-party rights. We are not responsible for User-Generated Content and may remove it at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Third-Party Links and Affiliate Disclosure</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Services contain links to third-party websites and retailers. These third-party sites have their own terms and privacy policies, and we are not responsible for their content, practices, or any transactions you conduct with them.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Affiliate Disclosure:</strong> Au7o participates in affiliate programs with Amazon, AutoZone, RockAuto, and other retailers. When you click on affiliate links and make purchases, we may earn a commission at no additional cost to you. These commissions help support the development and maintenance of our free Services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Your interactions with third-party retailers are governed by their respective policies. We disclaim all liability arising from your use of third-party services or any purchases made through affiliate links.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Disclaimers for AI Services</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 font-medium mb-2">IMPORTANT DISCLAIMER</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                THE AI SERVICES ARE PROVIDED FOR INFORMATIONAL PURPOSES ONLY AND ARE NOT A SUBSTITUTE FOR PROFESSIONAL ADVICE. INFORMATION ON PARTS, MAINTENANCE, FLUIDS, OR OTHER DETAILS IS DERIVED FROM ONLINE SOURCES AND MAY CONTAIN ERRORS OR INACCURACIES. YOU MUST CONSULT YOUR VEHICLE&apos;S OWNER&apos;S MANUAL, A QUALIFIED MECHANIC, OR VERIFY ALL INFORMATION INDEPENDENTLY BEFORE RELYING ON IT.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You are solely responsible for confirming all maintenance intervals, fluid types, fluid quantities, torque specifications, and part compatibility against your vehicle&apos;s owner&apos;s manual and/or advice from a qualified mechanic before performing any work. Under no circumstances should AI-generated information be treated as a replacement for the official manufacturer documentation for your vehicle.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. General Disclaimers</h2>
            <p className="text-gray-600 leading-relaxed">
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING FROM YOUR USE OF THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY THEREOF. THIS INCLUDES, WITHOUT LIMITATION, ANY DAMAGES ARISING FROM VEHICLE REPAIRS PERFORMED USING INFORMATION FROM THE SERVICES, PURCHASES MADE THROUGH AFFILIATE LINKS, OR RELIANCE ON AI-GENERATED CONTENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless the Company, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including reasonable attorneys&apos; fees) arising from your use of the Services, violation of these Terms, or infringement of third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your access to the Services at any time, without notice or liability, for any reason, including breach of these Terms. Upon termination, your rights to use the Services cease, and you must destroy any downloaded Content. Sections that by their nature survive termination (e.g., disclaimers, liability limitations) shall remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these Terms at any time by posting the revised version on the Website. Your continued use of the Services after such changes constitutes acceptance. It is your responsibility to review these Terms periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles. You consent to the exclusive jurisdiction and venue of the state and federal courts located in California for any disputes arising hereunder.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Dispute Resolution</h2>

            <h3 className="text-lg font-medium text-gray-800 mb-2">16.1 Informal Good-Faith Negotiation</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Before initiating any arbitration or court proceeding (except for claims seeking injunctive relief or claims eligible for small claims court), the party asserting a claim must first send written notice of the dispute to the other party describing the nature and basis of the claim and the specific relief sought.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">16.2 Binding Arbitration</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              If the dispute is not resolved through informal negotiation within thirty (30) days, any claim or controversy shall be finally settled by binding arbitration administered by the American Arbitration Association (&quot;AAA&quot;) under its Consumer Arbitration Rules. The arbitration shall take place in Los Angeles County, California (or via telephone or video conference).
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">16.3 Class Action Waiver</h3>
            <p className="text-gray-600 leading-relaxed">
              You and the Company agree that any arbitration or court proceeding shall be conducted only on an individual basis and not as a class, consolidated, or representative action. You and the Company expressly waive any right to a trial by jury.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">17. Severability</h2>
            <p className="text-gray-600 leading-relaxed">
              If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall remain in full force and effect. The invalid provision shall be reformed to the minimum extent necessary to achieve its original intent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">18. Entire Agreement</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms, together with the Policies, constitute the entire agreement between you and us regarding the Services, superseding all prior agreements, understandings, or representations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">19. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions or notices regarding these Terms, contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
