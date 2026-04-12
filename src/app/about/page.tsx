import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Au7o | Our Mission & Methodology',
  description:
    'Learn how Au7o researches and documents vehicle problems. Our team analyzes TSBs, NHTSA complaints, recall data, and owner reports to help DIY mechanics make informed repair decisions.',
  alternates: {
    canonical: 'https://au7o.io/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">About Au7o</h1>

        <section className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Au7o exists to give every car owner the information they need to make smart repair decisions &mdash;
            before they get to the shop. We believe that understanding your vehicle&apos;s known weak spots,
            the right parts to use, and how to do basic maintenance shouldn&apos;t require years of mechanical experience
            or expensive diagnostic visits.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">What We Do</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We research, document, and organize known vehicle problems across hundreds of makes and models.
            Each issue in our database includes specific symptoms, estimated repair costs, step-by-step solutions,
            and the parts owners actually use to fix the problem. We also provide AI-powered repair guides
            and a parts finder that matches exact specifications to your vehicle.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Our Research Methodology</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Every issue in our database is researched using multiple authoritative sources:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>
              <strong>NHTSA complaint data</strong> &mdash; We analyze complaints filed with the National Highway
              Traffic Safety Administration to identify patterns across specific years, makes, and models.
            </li>
            <li>
              <strong>Technical Service Bulletins (TSBs)</strong> &mdash; Manufacturer-issued service bulletins
              that acknowledge known defects and provide repair procedures.
            </li>
            <li>
              <strong>Recall notices</strong> &mdash; Federal safety recalls are cross-referenced with our
              issue database and displayed on relevant vehicle pages.
            </li>
            <li>
              <strong>Owner forums and communities</strong> &mdash; Real-world reports from enthusiast forums,
              Reddit communities, and owner groups provide ground-truth data on failure patterns, DIY solutions,
              and part recommendations.
            </li>
            <li>
              <strong>OEM service manuals</strong> &mdash; Factory specifications for fluid types, torque values,
              part numbers, and maintenance intervals are used to ensure accuracy in our repair guides and parts data.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Data Verification Tiers</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We believe in radical transparency about our data sources. Not all information is created equal,
            and we think you deserve to know exactly how confident we are in each issue we document.
            Every issue on Au7o is labeled with one of three verification tiers:
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <div>
                <strong className="text-green-800">NHTSA Verified</strong>
                <p className="text-green-700 text-sm mt-1">
                  Backed by real complaint data from the National Highway Traffic Safety Administration (NHTSA) API.
                  These issues include real ODI complaint numbers, actual complaint counts, and were synthesized
                  directly from government records. This is our highest confidence tier.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <strong className="text-blue-800">Recall Related</strong>
                <p className="text-blue-700 text-sm mt-1">
                  Linked to an official NHTSA recall campaign where the manufacturer acknowledged a defect.
                  These issues include real recall campaign numbers and manufacturer-confirmed remedies.
                  Recalls represent the strongest possible confirmation of a vehicle problem.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <strong className="text-gray-800">Community Reported</strong>
                <p className="text-gray-600 text-sm mt-1">
                  Compiled from automotive knowledge including owner forum discussions, enthusiast communities,
                  and AI-assisted research. These represent real patterns that owners experience but have not been
                  individually verified against government databases. While we believe these issues are accurate
                  based on widespread owner reports, specific details like repair costs are estimates.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Editorial Standards</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We take accuracy seriously because wrong repair information wastes money and can be dangerous.
            Our editorial process includes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li>
              <strong>Severity classification</strong> &mdash; Each issue is rated high, medium, or low severity
              based on safety impact, repair cost, and frequency of occurrence.
            </li>
            <li>
              <strong>Ongoing updates</strong> &mdash; Our database is regularly updated as new TSBs are released,
              recalls are issued, and community data evolves. Issue pages show when they were last reviewed.
            </li>
            <li>
              <strong>Clear sourcing</strong> &mdash; Where possible, each issue includes citations linking
              to the original source material (TSB numbers, NHTSA complaint IDs, forum threads).
              Issues without verifiable citations are labeled as Community Reported.
            </li>
            <li>
              <strong>Transparent labeling</strong> &mdash; Every issue displays its verification tier so you
              always know the confidence level of the information you&apos;re reading.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">AI-Assisted Content</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Au7o uses AI tools to assist with research, content organization, and generating repair guides.
            AI-generated repair guides are clearly labeled and include a note recommending users verify
            critical specifications against their vehicle&apos;s owner&apos;s manual. Our vehicle-specific procedure
            data (oil types, torque specs, fluid capacities) is sourced from OEM service manuals and verified
            against factory specifications &mdash; not generated by AI.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Affiliate Disclosure</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Au7o participates in the Amazon Associates Program and may earn commissions from qualifying
            purchases made through links on our site. Part recommendations are based on what owners
            actually use and recommend in forums and communities &mdash; we do not accept payment
            to recommend specific products. Our editorial content is never influenced by affiliate relationships.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Important Disclaimer</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Au7o provides informational content for educational purposes. We are not certified mechanics
            and our content should not replace professional diagnosis. Vehicle repair can involve safety-critical
            systems &mdash; always consult a qualified mechanic if you are unsure about a repair procedure.
            Verify all specifications against your vehicle&apos;s owner&apos;s manual before performing any work.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Contact</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Have a question, correction, or want to report an issue with our data?
            Reach us at{' '}
            <a href="mailto:support@au7o.io" className="text-blue-600 hover:text-blue-800 font-medium">
              support@au7o.io
            </a>{' '}
            or use our{' '}
            <Link href="/feedback" className="text-blue-600 hover:text-blue-800 font-medium">
              feedback form
            </Link>.
          </p>
        </section>

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            &larr; Back to Au7o
          </Link>
        </div>
      </main>
    </div>
  );
}
