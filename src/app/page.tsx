'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ScrollSyncedFeatures } from '@/components/ui/ScrollSyncedFeatures';
import { EmailCapture } from '@/components/ui/EmailCapture';

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
{/* TODO: Uncomment My Garage button when Epic 5 launches
            <ScrollReveal delay={100} duration={800} direction="down" distance={20}>
              <Link
                href="/garage"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                My Garage
              </Link>
            </ScrollReveal>
*/}
          </div>
        </header>

        {/* Hero Section - Where the engine parts float */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 lg:py-28 relative">
          {/* Feature pills */}
          <ScrollReveal delay={200} duration={800}>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Works Offline
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-Validated
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free to Start
              </span>
            </div>
          </ScrollReveal>

          {/* Main headline */}
          <ScrollReveal delay={300} duration={1000} distance={40}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-[1.1] tracking-tight text-gray-900 mb-6 max-w-4xl">
              Expert guidance
              <br />
              in your garage.
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={400} duration={1000} distance={30}>
            <p className="text-lg sm:text-xl text-gray-500 text-center max-w-2xl mb-10 leading-relaxed">
              AI-powered repair guides that work offline. Know what you need before you start.
              Complete repairs with confidence.
            </p>
          </ScrollReveal>

          {/* CTA buttons */}
          <ScrollReveal delay={500} duration={800}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/get-started"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-lg"
              >
                Get Started
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-white transition-all duration-200 text-lg hover:scale-[1.02] shadow-sm"
              >
                See How It Works
              </button>
            </div>
          </ScrollReveal>

          {/* Social proof */}
          <ScrollReveal delay={600} duration={800}>
            <p className="text-gray-400 text-sm">
              No account required. Your data stays on your device.
            </p>
          </ScrollReveal>
        </section>

        {/* Gradient separator - eclipses the floating engine parts */}
        <div
          className="relative h-32 -mt-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(249, 250, 251, 0.8) 60%, rgb(249, 250, 251) 100%)',
            zIndex: 3,
          }}
        />

        {/* Scroll-Synced Feature Section - BMAD Style */}
        <div ref={featuresRef} style={{ zIndex: 3 }} className="relative">
          <ScrollSyncedFeatures />
        </div>

        {/* Known Issues Section */}
        <section
          className="px-6 py-16 relative bg-gray-50"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <ScrollReveal delay={0} duration={800}>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                Know your car&apos;s weak spots
              </h2>
              <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                Browse 1,600+ documented problems across 386 models. Symptoms, repair costs, and solutions from real owner reports.
              </p>
              <Link
                href="/known-issues"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-lg hover:scale-[1.02] shadow-sm"
              >
                Browse Known Issues
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </section>

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
