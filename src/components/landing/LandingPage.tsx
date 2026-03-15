'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ScrollSyncedFeatures } from '@/components/ui/ScrollSyncedFeatures';
import { EmailCapture } from '@/components/ui/EmailCapture';
import { HeroVehicleSearch } from '@/components/discovery/HeroVehicleSearch';

const popularIssues = [
  { vehicle: 'Ford F-150', issue: '5.0L Coyote Cam Phaser Tick/Rattle', severity: 'high' as const, slug: 'ford-f-150' },
  { vehicle: 'Honda Civic', issue: 'AC Condenser Premature Failure', severity: 'high' as const, slug: 'honda-civic' },
  { vehicle: 'Dodge Challenger', issue: 'Rear Differential Whine/Clunk', severity: 'high' as const, slug: 'dodge-challenger' },
  { vehicle: 'Toyota RAV4', issue: 'Transmission Hesitation on Acceleration', severity: 'medium' as const, slug: 'toyota-rav4' },
  { vehicle: 'Chevrolet Camaro', issue: '8-Speed Transmission Shudder (8L90)', severity: 'high' as const, slug: 'chevrolet-camaro' },
  { vehicle: 'BMW 3 Series', issue: 'VANOS Solenoid Seal Oil Leak', severity: 'medium' as const, slug: 'bmw-3-series' },
];

const severityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

export default function LandingPage() {
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
                2,300+ Issues
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                20 Makes
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                6M+ Owner Reports
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
              2,300+ documented problems across 500+ models. Symptoms, repair costs, and real solutions — before you get to the shop.
            </p>
          </ScrollReveal>

          {/* Vehicle Search */}
          <ScrollReveal delay={500} duration={800}>
            <div className="w-full max-w-3xl mb-4">
              <HeroVehicleSearch />
            </div>
            <p className="text-center text-gray-400 text-sm mb-6">
              or{' '}
              <Link href="/get-started" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                get a step-by-step repair guide
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

        {/* Recently Documented Issues — Social Proof */}
        <section
          className="px-6 py-16 relative bg-gray-50"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-5xl mx-auto">
            <ScrollReveal delay={0} duration={800}>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                  Real problems. Real solutions.
                </h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                  Every issue includes symptoms, estimated repair costs, and community-verified solutions from real owner reports.
                </p>
              </div>

              {/* Issue preview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
                {popularIssues.map((item) => (
                  <Link
                    key={item.slug + item.issue}
                    href={`/known-issues/${item.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.vehicle}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${severityColors[item.severity]}`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-snug">
                      {item.issue}
                    </p>
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
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookie Policy</Link>
              <Link href="/copyright" className="hover:text-gray-600 transition-colors">Copyright Policy</Link>
              <Link href="/feedback" className="hover:text-gray-600 transition-colors">Send Feedback</Link>
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
                Built for DIY mechanics. Privacy-first. No data leaves your device.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
