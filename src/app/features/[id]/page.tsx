'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

// Feature data
const featuresData: Record<string, {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  benefits: string[];
  icon: React.ReactNode;
}> = {
  'pre-flight': {
    id: 'pre-flight',
    title: 'Pre-Flight Check',
    description: 'See every tool and part you need before starting. No surprises mid-repair.',
    longDescription: `Before you even lift the hood, Au7o shows you exactly what you'll need. Our Pre-Flight Check analyzes the repair and gives you a complete list of tools, parts, and supplies. No more trips back to the auto parts store mid-repair.`,
    benefits: [
      'Complete tool list with alternatives you might already have',
      'Part numbers specific to your exact vehicle',
      'Estimated time and difficulty rating',
      'Safety warnings before you start',
    ],
    icon: (
      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  'step-by-step': {
    id: 'step-by-step',
    title: 'Step-by-Step Guides',
    description: "Large text, high contrast. Designed to read at arm's length with dirty hands.",
    longDescription: `Our guides are designed for the real garage environment. Large, high-contrast text that's easy to read at arm's length. Each step is clear and actionable, with helpful tips for when you get stuck.`,
    benefits: [
      '18px minimum text size for easy reading',
      'High-contrast mode for low-light garages',
      'Touch-friendly buttons for dirty hands',
      'Progress saving - pick up where you left off',
    ],
    icon: (
      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  'offline-first': {
    id: 'offline-first',
    title: 'Works Offline',
    description: 'Download guides before you start. No wifi in your garage? No problem.',
    longDescription: `Most garages don't have great wifi. That's why Au7o is built offline-first. Download your guides while you have internet, then access them anytime - even in airplane mode. Your progress syncs when you're back online.`,
    benefits: [
      'Download guides with one tap',
      'Works completely offline once cached',
      'Automatic sync when connection returns',
      'Guides stay cached for 30 days',
    ],
    icon: (
      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
};

export default function FeaturePage() {
  const params = useParams();
  const featureId = params.id as string;
  const feature = featuresData[featureId];

  if (!feature) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Feature not found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif]">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero section with view transition */}
        <div
          className="rounded-2xl p-8 mb-12"
          style={{
            background: 'linear-gradient(to bottom, #f3f4f6 0%, #f3f4f6 60%, #ffffff 100%)',
            viewTransitionName: `feature-card-${feature.id}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Icon */}
            <div
              className="flex-shrink-0"
              style={{ viewTransitionName: `feature-icon-${feature.id}` }}
            >
              {feature.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1
                className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4"
                style={{ viewTransitionName: `feature-title-${feature.id}` }}
              >
                {feature.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {feature.longDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feature.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to try it out?
          </h3>
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-lg"
          >
            Get Started
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}
