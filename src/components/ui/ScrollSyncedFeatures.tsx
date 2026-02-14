'use client';

import { useState } from 'react';

/**
 * ScrollSyncedFeatures - Modern Minimalist Feature Showcase
 *
 * Clean, Apple-inspired feature cards with subtle animations.
 */

type Feature = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

const features: Feature[] = [
  {
    id: 'preflight',
    title: 'Pre-Flight Check',
    subtitle: 'Before you start',
    description:
      'Gather all parts and tools before getting your hands dirty. Our smart checklist ensures you have everything ready, with direct links to purchase anything missing.',
  },
  {
    id: 'guides',
    title: 'Step-by-Step Guides',
    subtitle: 'Clear instructions',
    description:
      'AI-generated repair guides tailored to your exact vehicle. Large touch targets for greasy fingers, safety warnings highlighted, and tips from real mechanics.',
  },
  {
    id: 'offline',
    title: 'Works Offline',
    subtitle: 'No signal? No problem',
    description:
      'Save guides to your device and access them in the garage, even without internet. Your progress syncs automatically when you reconnect.',
  },
];

function PreFlightVisual({ isActive }: { isActive: boolean }) {
  const items = [
    { name: 'Oil Filter', checked: true },
    { name: 'Drain Pan', checked: true },
    { name: 'Socket Wrench', checked: true },
    { name: 'New Oil (5 qts)', checked: false },
  ];

  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
      <div className="w-72 sm:w-80">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-900 font-medium text-sm">Parts & Tools</h4>
                <p className="text-gray-400 text-xs">Oil Change</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-3 space-y-1">
            {items.map((item, idx) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'} ${!item.checked ? 'bg-blue-50' : ''}`}
                style={{ transitionDelay: isActive ? `${idx * 60}ms` : '0ms' }}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${item.checked ? 'bg-gray-900' : 'border-2 border-blue-400'}`}>
                  {item.checked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${item.checked ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{item.name}</span>
                {!item.checked && (
                  <span className="ml-auto text-xs text-blue-600 font-medium">Add</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-1">
            <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
              <span className="text-gray-500 text-xs font-medium">3 of 4 ready</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-gray-900' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuidesVisual({ isActive }: { isActive: boolean }) {
  const steps = [
    { num: 1, text: 'Position drain pan', done: true },
    { num: 2, text: 'Remove drain plug', done: true },
    { num: 3, text: 'Replace oil filter', done: false, current: true },
    { num: 4, text: 'Install new plug', done: false },
  ];

  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
      <div className="w-72 sm:w-80">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 font-medium text-sm">Oil Change</h4>
                <p className="text-gray-400 text-xs">2015 Honda Civic</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">50%</span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gray-900 rounded-full transition-all duration-700 ${isActive ? 'w-1/2' : 'w-0'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="p-3 space-y-1">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${step.current ? 'bg-gray-50' : ''} ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                style={{ transitionDelay: isActive ? `${idx * 60}ms` : '0ms' }}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${step.done ? 'bg-gray-900 text-white' : step.current ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step.done ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.num}
                </div>
                <span className={`text-sm ${step.done ? 'text-gray-400' : step.current ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {step.text}
                </span>
                {step.current && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="px-4 pb-4 pt-1">
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 rounded-xl">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-amber-700">Engine must be warm but not hot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfflineVisual({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
      <div className="relative">
        {/* Phone frame */}
        <div className="w-56 sm:w-64 bg-gray-900 rounded-[2.5rem] p-2 shadow-sm">
          <div className="w-full aspect-[9/16] bg-white rounded-[2rem] overflow-hidden relative">
            {/* Status bar */}
            <div className="h-6 flex items-center justify-between px-5">
              <span className="text-[10px] text-gray-400 font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Offline indicator */}
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] text-gray-600 font-medium">Offline Ready</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-3 pt-10 space-y-2">
              {['Brake Pad Replace', 'Oil Change', 'Air Filter'].map((guide, idx) => (
                <div
                  key={guide}
                  className={`p-3 bg-gray-50 rounded-2xl transition-all duration-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                  style={{ transitionDelay: isActive ? `${150 + idx * 80}ms` : '0ms' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{guide}</p>
                      <p className="text-[10px] text-gray-400">Saved</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureText({ feature, isActive, index }: { feature: Feature; isActive: boolean; index: number }) {
  return (
    <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">{feature.subtitle}</span>
      </div>
      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight mb-3">
        {feature.title}
      </h3>
      <p className="text-base text-gray-500 leading-relaxed max-w-md">
        {feature.description}
      </p>
    </div>
  );
}

export function ScrollSyncedFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : features.length - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="relative bg-gray-50/50 py-16 lg:py-24">
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">How it works</h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 min-h-[420px] lg:min-h-[400px]">
          {/* LEFT: Visual Panel */}
          <div className="lg:w-1/2 h-[320px] lg:h-[400px] relative w-full flex items-center justify-center">
            <PreFlightVisual isActive={activeIndex === 0} />
            <GuidesVisual isActive={activeIndex === 1} />
            <OfflineVisual isActive={activeIndex === 2} />
          </div>

          {/* RIGHT: Text Panel */}
          <div className="lg:w-1/2 relative h-[180px] lg:h-[200px] w-full text-center lg:text-left">
            {features.map((feature, i) => (
              <FeatureText key={feature.id} feature={feature} isActive={activeIndex === i} index={i} />
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {/* Left Arrow */}
          <button
            onClick={goToPrev}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 active:scale-95 transition-all touch-manipulation"
            aria-label="Previous feature"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 touch-manipulation ${
                  i === activeIndex
                    ? 'w-6 h-2 bg-gray-900'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to feature ${i + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 active:scale-95 transition-all touch-manipulation"
            aria-label="Next feature"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
