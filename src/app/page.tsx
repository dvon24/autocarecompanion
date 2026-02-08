'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      {/* Gradient blobs - subtle blue accents */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(20%, -30%)',
          opacity: 0.35,
        }}
      />
      <div
        className="absolute top-1/4 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, 0%)',
          opacity: 0.35,
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(0%, 40%)',
          opacity: 0.35,
        }}
      />

      {/* Main content */}
      <main className="relative flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 lg:py-32">
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Works Offline
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI-Validated
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free to Start
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-[1.1] tracking-tight text-gray-900 mb-6 max-w-4xl">
            Expert guidance
            <br />
            in your garage.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-500 text-center max-w-2xl mb-10 leading-relaxed">
            AI-powered repair guides that work offline. Know what you need before you start.
            Complete repairs with confidence.
          </p>

          {/* CTA buttons */}
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
            <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-lg hover:scale-[1.02]">
              See How It Works
            </button>
          </div>

          {/* Social proof */}
          <p className="text-gray-400 text-sm">
            No account required. Your data stays on your device.
          </p>
        </section>

        {/* Feature Cards Section */}
        <section className="px-6 py-20 bg-gray-50/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-4">
              Everything you need to fix it yourself
            </h2>
            <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
              Built for real garage conditions. Large text, offline support, and smart preparation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Pre-Flight Check */}
              <div
                className="group rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(to bottom, #f3f4f6 0%, #f3f4f6 40%, #ffffff 70%, #ffffff 100%)' }}
              >
                {/* Icon area */}
                <div className="h-40 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                {/* Content */}
                <div className="px-5 pb-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-Flight Check</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    See every tool and part you need before starting. No surprises mid-repair.
                  </p>
                </div>
              </div>

              {/* Feature 2: Step-by-Step */}
              <div
                className="group rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(to bottom, #f3f4f6 0%, #f3f4f6 40%, #ffffff 70%, #ffffff 100%)' }}
              >
                {/* Icon area */}
                <div className="h-40 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {/* Content */}
                <div className="px-5 pb-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Step-by-Step Guides</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Large text, high contrast. Designed to read at arm's length with dirty hands.
                  </p>
                </div>
              </div>

              {/* Feature 3: Offline First */}
              <div
                className="group rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(to bottom, #f3f4f6 0%, #f3f4f6 40%, #ffffff 70%, #ffffff 100%)' }}
              >
                {/* Icon area */}
                <div className="h-40 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                {/* Content */}
                <div className="px-5 pb-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Works Offline</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Download guides before you start. No wifi in your garage? No problem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xl font-semibold text-gray-900">
              Au7o
            </div>
            <p className="text-gray-400 text-sm">
              Built for DIY mechanics. Privacy-first.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
