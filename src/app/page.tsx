'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-bg grid-pattern">
      {/* Animated gradient orbs - ambient glow */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />
      <div className="gradient-orb gradient-orb-3" />

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="feature-pill">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-4a1 1 0 112 0 1 1 0 01-2 0z" />
              </svg>
              Works Offline
            </span>
            <span className="feature-pill">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI-Validated Guides
            </span>
            <span className="feature-pill">
              <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free to Start
            </span>
          </div>

          {/* Main headline - large, bold, gradient */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center leading-tight mb-6">
            <span className="gradient-text">Expert guidance</span>
            <br />
            <span className="text-white">in your garage.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 text-center max-w-2xl mb-10 leading-relaxed">
            AI-powered repair guides that work in your garage, even without internet.
            <br className="hidden sm:block" />
            Know what you need before you start. Complete repairs with confidence.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/get-started" className="cta-button text-lg">
              <span>Get Started Free</span>
            </Link>
            <button className="secondary-button text-lg">
              See How It Works
            </button>
          </div>

          {/* Social proof */}
          <p className="text-white/40 text-sm">
            No account required. Your data stays on your device.
          </p>
        </section>

        {/* Feature Cards Section */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-12">
              Everything you need to fix it yourself
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Pre-Flight Check */}
              <div className="glass-card p-8 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Pre-Flight Check</h3>
                <p className="text-white/60 leading-relaxed">
                  See every tool and part you need before starting. No surprises mid-repair.
                </p>
              </div>

              {/* Feature 2: Step-by-Step */}
              <div className="glass-card p-8 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Step-by-Step Guides</h3>
                <p className="text-white/60 leading-relaxed">
                  Large text, high contrast. Designed to read at arm's length with dirty hands.
                </p>
              </div>

              {/* Feature 3: Offline First */}
              <div className="glass-card p-8 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Works Offline</h3>
                <p className="text-white/60 leading-relaxed">
                  Download guides before you start. No wifi in your garage? No problem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/5">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold">
              <span className="text-white">Au</span>
              <span className="text-blue-400">7</span>
              <span className="text-white">o</span>
            </div>
            <p className="text-white/40 text-sm">
              Built for DIY mechanics. Privacy-first.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
