'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif]">
      {/* Main content */}
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 lg:py-32">
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Works Offline
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI-Validated
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free to Start
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-[1.1] tracking-tight text-gray-900 mb-6 max-w-4xl">
            Expert guidance
            <br />
            <span className="text-blue-600">in your garage.</span>
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
              className="group inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-xl"
            >
              Get Started
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-lg hover:scale-[1.02]">
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
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-4">
              Everything you need to fix it yourself
            </h2>
            <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
              Built for real garage conditions. Large text, offline support, and smart preparation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Pre-Flight Check */}
              <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer">
                {/* Visual header with gradient */}
                <div className="h-40 bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-4 w-20 h-20 border-4 border-white/40 rounded-xl rotate-12" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 border-4 border-white/30 rounded-lg -rotate-6" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Pre-Flight Check</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    See every tool and part you need before starting. No surprises mid-repair.
                  </p>
                </div>
              </div>

              {/* Feature 2: Step-by-Step */}
              <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer">
                {/* Visual header with gradient */}
                <div className="h-40 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-400 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-6 left-6 w-8 h-8 bg-white/40 rounded-full" />
                    <div className="absolute top-6 left-16 w-8 h-8 bg-white/30 rounded-full" />
                    <div className="absolute top-6 left-26 w-8 h-8 bg-white/20 rounded-full" />
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <div className="w-24 h-2 bg-white/40 rounded-full" />
                      <div className="w-20 h-2 bg-white/30 rounded-full" />
                      <div className="w-16 h-2 bg-white/20 rounded-full" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Step-by-Step Guides</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    Large text, high contrast. Designed to read at arm's length with dirty hands.
                  </p>
                </div>
              </div>

              {/* Feature 3: Offline First */}
              <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer">
                {/* Visual header with gradient */}
                <div className="h-40 bg-gradient-to-br from-green-500 via-emerald-400 to-teal-400 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-4">
                      <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4l2 2" />
                      </svg>
                    </div>
                    <div className="absolute bottom-4 left-4 w-32 h-1 bg-white/40 rounded-full" />
                    <div className="absolute bottom-8 left-4 w-24 h-1 bg-white/30 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Works Offline</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    Download guides before you start. No wifi in your garage? No problem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-semibold text-gray-900">
              Au<span className="text-blue-600">7</span>o
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
