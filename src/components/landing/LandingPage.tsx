'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ScrollSyncedFeatures } from '@/components/ui/ScrollSyncedFeatures';
import { EmailCapture } from '@/components/ui/EmailCapture';
import { HeroVehicleSearch } from '@/components/discovery/HeroVehicleSearch';
import { ShareButtons } from '@/components/shared/ShareButtons';

interface TrendingIssue {
  id: string;
  make: string;
  model: string;
  title: string;
  category: string;
  severity: string;
  reportCount: number;
  yearRange: string;
  slug: string;
}

const fallbackIssues: TrendingIssue[] = [
  { id: 'ford-f150-cam-phaser', make: 'Ford', model: 'F-150', title: '5.0L Coyote Cam Phaser Tick/Rattle', category: 'Engine', severity: 'high', reportCount: 0, yearRange: '2018–2023', slug: 'ford-f-150' },
  { id: 'honda-civic-ac', make: 'Honda', model: 'Civic', title: 'AC Condenser Premature Failure', category: 'HVAC', severity: 'high', reportCount: 0, yearRange: '2016–2021', slug: 'honda-civic' },
  { id: 'dodge-challenger-diff', make: 'Dodge', model: 'Challenger', title: 'Rear Differential Whine/Clunk', category: 'Drivetrain', severity: 'high', reportCount: 0, yearRange: '2015–2023', slug: 'dodge-challenger' },
  { id: 'toyota-rav4-trans', make: 'Toyota', model: 'RAV4', title: 'Transmission Hesitation on Acceleration', category: 'Transmission', severity: 'high', reportCount: 0, yearRange: '2019–2023', slug: 'toyota-rav4' },
  { id: 'chevy-camaro-shudder', make: 'Chevrolet', model: 'Camaro', title: '8-Speed Transmission Shudder (8L90)', category: 'Transmission', severity: 'high', reportCount: 0, yearRange: '2016–2023', slug: 'chevrolet-camaro' },
  { id: 'bmw-3-vanos', make: 'BMW', model: '3 Series', title: 'VANOS Solenoid Seal Oil Leak', category: 'Engine', severity: 'high', reportCount: 0, yearRange: '2012–2019', slug: 'bmw-3-series' },
];

const severityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const categoryColors: Record<string, string> = {
  Engine: 'bg-orange-50 text-orange-700 border-orange-200',
  Transmission: 'bg-purple-50 text-purple-700 border-purple-200',
  Electrical: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Suspension: 'bg-green-50 text-green-700 border-green-200',
  Brakes: 'bg-red-50 text-red-700 border-red-200',
  Drivetrain: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  HVAC: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Fuel: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getCategoryStyle(category: string): string {
  return categoryColors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
}

interface SiteStats {
  totalIssues: number;
  totalMakes: number;
  totalModels: number;
}

export default function LandingPage({ trendingIssues = [], stats }: { trendingIssues?: TrendingIssue[]; stats?: SiteStats }) {
  const issues = trendingIssues.length > 0 ? trendingIssues : fallbackIssues;
  const totalIssues = stats?.totalIssues ?? 3600;
  const totalMakes = stats?.totalMakes ?? 34;
  const totalModels = stats?.totalModels ?? 640;
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      {/* Animated Engine Background - Only visible in hero section */}
      <AnimatedBackground />

      {/* Subtle gradient blobs for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(20%, -30%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute top-1/4 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(-50%, 0%)',
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <main className="relative flex flex-col" style={{ zIndex: 2 }}>
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <ScrollReveal delay={0} duration={800} direction="down" distance={20}>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/og-image.png"
                  alt="Au7o mascot"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  Au<span className="text-blue-600">7</span>o
                </span>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={100} duration={800} direction="down" distance={20}>
              <div className="flex items-center gap-3">
                <Link
                  href="/known-issues"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Known Issues
                </Link>
                {/* Parts Finder hidden until multi-agent verification is ready */}
                <Link
                  href="/get-started"
                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 relative">
          {/* Stats pills — above headline */}
          <ScrollReveal delay={200} duration={800}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {totalIssues.toLocaleString()}+ Issues
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {totalMakes} Makes
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {totalModels}+ Models
              </span>
            </div>
          </ScrollReveal>

          {/* Main headline */}
          <ScrollReveal delay={300} duration={1000} distance={40}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-[1.1] tracking-tight text-gray-900 mb-4 max-w-4xl">
              Know your car&apos;s
              <br />
              weak spots.
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={400} duration={1000} distance={30}>
            <p className="text-lg sm:text-xl text-gray-500 text-center max-w-2xl mb-8 leading-relaxed">
              {totalIssues.toLocaleString()}+ documented problems across {totalModels}+ models. Symptoms, repair costs, and real solutions — before you get to the shop.
            </p>
          </ScrollReveal>

          {/* Vehicle Search */}
          <ScrollReveal delay={500} duration={800}>
            <div className="w-full max-w-3xl mb-4">
              <HeroVehicleSearch />
            </div>
            <p className="text-center text-gray-400 text-sm mb-6">
              or{' '}
              <Link href="/symptom-chat" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                describe a symptom to our AI
              </Link>
              {' '}&middot;{' '}
              <Link href="/get-started" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                find parts &amp; repair guides
              </Link>
            </p>
          </ScrollReveal>
        </section>

        {/* Gradient separator */}
        <div
          className="relative h-32 -mt-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(249, 250, 251, 0.8) 60%, rgb(249, 250, 251) 100%)',
            zIndex: 3,
          }}
        />

        {/* Trending Issues — Social Proof */}
        <section
          className="px-6 py-16 relative bg-gray-50"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-5xl mx-auto">
            <ScrollReveal delay={0} duration={800}>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                  Common Vehicle Problems
                </h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                  The most-reported high-severity issues across all makes — with symptoms, repair costs, and community-verified solutions.
                </p>
              </div>

              {/* Trending issue cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
                {issues.map((item) => (
                  <Link
                    key={item.id}
                    href={`/known-issues/${item.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.make} {item.model}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${severityColors[item.severity] || severityColors.medium}`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-snug mb-3">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getCategoryStyle(item.category)}`}>
                        {item.category}
                      </span>
                      {item.yearRange && (
                        <span className="text-xs text-gray-400">
                          {item.yearRange}
                        </span>
                      )}
                      {item.reportCount > 0 && (
                        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.reportCount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/known-issues"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-lg"
                >
                  Browse All Known Issues
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Scroll-Synced Feature Section - BMAD Style */}
        <div style={{ zIndex: 3 }} className="relative">
          <ScrollSyncedFeatures />
        </div>

        {/* Footer */}
        <footer
          className="px-6 py-12 border-t border-gray-200 relative bg-white"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-5xl mx-auto">
            {/* CTA Section */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                Ready to start your repair?
              </h2>
              <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                Get expert guidance for your specific vehicle. No mechanic experience required.
              </p>
              <div className="flex flex-col items-center gap-6">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-lg"
                >
                  Get Started Free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <div className="w-full max-w-md">
                  <p className="text-sm text-gray-400 mb-3">
                    Or get notified about new features
                  </p>
                  <EmailCapture />
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8">
              <Link href="/known-issues" className="hover:text-gray-600 transition-colors">Known Issues</Link>
              {/* Parts Finder hidden until verified */}
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookie Policy</Link>
              <a href="#" className="termly-display-preferences hover:text-gray-600 transition-colors">Consent Preferences</a>
              <Link href="/copyright" className="hover:text-gray-600 transition-colors">Copyright Policy</Link>
              <Link href="/feedback" className="hover:text-gray-600 transition-colors">Send Feedback</Link>
            </div>

            {/* Share + Follow */}
            <div className="flex justify-center mb-8">
              <ShareButtons url="https://au7o.io" title="Au7o - Know Your Car's Weak Spots" />
            </div>

            {/* AI content disclaimer */}
            <div className="flex items-start gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg max-w-2xl mx-auto mb-8">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-400 leading-relaxed">
                Vehicle data and repair guidance on this site are compiled with AI assistance and may contain errors. Always verify with your service manual or a qualified mechanic.
              </p>
            </div>

            {/* Footer bottom */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/og-image.png"
                  alt="Au7o mascot"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-xl font-semibold text-gray-900">
                  Au<span className="text-blue-600">7</span>o
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Built for DIY mechanics. Your vehicle selections are stored locally in your browser.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
