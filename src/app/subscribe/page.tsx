'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const FEATURES = [
  {
    name: 'Unlimited AI Diagnoses',
    free: '5 per week',
    premium: 'Unlimited',
    icon: '🔍',
  },
  {
    name: 'Vehicle Garage',
    free: 'None',
    premium: 'Up to 10 vehicles',
    icon: '🚗',
  },
  {
    name: 'Maintenance Tracking',
    free: '—',
    premium: 'Full tracking + history',
    icon: '🔧',
  },
  {
    name: 'Maintenance Notifications',
    free: '—',
    premium: 'Email + Push alerts',
    icon: '🔔',
  },
  {
    name: 'AI Garage Assistant',
    free: '—',
    premium: 'Voice commands + smart suggestions',
    icon: '🤖',
  },
  {
    name: 'Ad-Free Experience',
    free: '—',
    premium: 'No ads',
    icon: '✨',
  },
];

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
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
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
            </ScrollReveal>
          </div>
        </header>

        {/* Hero */}
        <section className="px-6 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal delay={200} duration={800}>
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
                  Get More From Your Vehicle
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                  Track maintenance, get smart reminders, and let AI help manage your garage.
                </p>
              </div>
            </ScrollReveal>

            {/* Pricing Card */}
            <ScrollReveal delay={300} duration={800}>
              <div className="max-w-md mx-auto mb-16">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white">
                    <p className="text-blue-100 font-medium mb-2">Premium Subscription</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">$9.99</span>
                      <span className="text-blue-200">/month</span>
                    </div>
                    <p className="text-blue-100 text-sm mt-2">Cancel anytime</p>
                  </div>

                  {/* CTA */}
                  <div className="p-6 space-y-3">
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      Secure payment via Stripe
                    </p>
                    <Link
                      href="/auth/signin"
                      className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Already have an account? Sign in
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Feature Comparison */}
            <ScrollReveal delay={400} duration={800}>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Feature Comparison</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {/* Header Row */}
                  <div className="grid grid-cols-3 px-6 py-3 bg-gray-50">
                    <div className="text-sm font-medium text-gray-500">Feature</div>
                    <div className="text-sm font-medium text-gray-500 text-center">Free</div>
                    <div className="text-sm font-medium text-gray-500 text-center">Premium</div>
                  </div>
                  {/* Feature Rows */}
                  {FEATURES.map((feature) => (
                    <div key={feature.name} className="grid grid-cols-3 px-6 py-4 items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{feature.icon}</span>
                        <span className="text-gray-900 font-medium">{feature.name}</span>
                      </div>
                      <div className="text-center text-gray-500">{feature.free}</div>
                      <div className="text-center text-green-600 font-medium">{feature.premium}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* FAQ */}
            <ScrollReveal delay={500} duration={800}>
              <div className="mt-16">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                    <p className="text-gray-600">
                      Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">What happens to my data if I cancel?</h3>
                    <p className="text-gray-600">
                      Your vehicle data and maintenance history are preserved. If you resubscribe, everything will be right where you left it.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">How do maintenance notifications work?</h3>
                    <p className="text-gray-600">
                      Based on your vehicle&apos;s mileage and maintenance history, we&apos;ll send you email and push notifications when service is due.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Back Link */}
            <div className="text-center mt-12">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-gray-100">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/og-image.png"
                alt="Au7o mascot"
                width={24}
                height={24}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-gray-900">
                Au<span className="text-blue-600">7</span>o
              </span>
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
