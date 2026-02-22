'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageLayout, ContentCard } from '@/components/ui/PageLayout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Concept cards for different prototypes
const concepts = [
  {
    id: 'guides-3d',
    title: 'Repair Guides with 3D',
    description: 'Interactive repair guides with 3D visualization showing repair locations on the vehicle',
    status: 'prototype',
    href: '/dev/guides-3d',
  },
  {
    id: 'guides-classic',
    title: 'Classic Repair Guides',
    description: 'Original step-by-step repair guides without 3D visualization',
    status: 'current',
    href: '/dev/guides-classic',
  },
  {
    id: 'garage-3d',
    title: 'Garage with 3D Viewer',
    description: 'Vehicle detail page with interactive 3D car model',
    status: 'prototype',
    href: '/garage',
  },
  {
    id: 'wheel-customizer',
    title: 'Wheel Customizer',
    description: 'Interactive wheel and suspension customization with real-time 3D preview',
    status: 'concept',
    href: '/dev/wheel-customizer',
  },
];

const statusColors: Record<string, string> = {
  current: 'bg-green-100 text-green-700',
  prototype: 'bg-blue-100 text-blue-700',
  concept: 'bg-amber-100 text-amber-700',
};

export default function DevConceptsPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredConcepts = filter
    ? concepts.filter((c) => c.status === filter)
    : concepts;

  return (
    <PageLayout backLink={{ href: '/', label: 'Home' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <ScrollReveal delay={0} duration={500}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Dev Concepts</h1>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                Internal
              </span>
            </div>
            <p className="text-gray-500">
              Prototype and concept ideas for AutoCare Companion features
            </p>
          </div>
        </ScrollReveal>

        {/* Filter buttons */}
        <ScrollReveal delay={50} duration={500}>
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('current')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'current'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setFilter('prototype')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'prototype'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Prototype
            </button>
            <button
              onClick={() => setFilter('concept')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'concept'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Concept
            </button>
          </div>
        </ScrollReveal>

        {/* Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredConcepts.map((concept, index) => (
            <ScrollReveal key={concept.id} delay={100 + index * 50} duration={500}>
              <Link href={concept.href}>
                <ContentCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {concept.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[concept.status]
                      }`}
                    >
                      {concept.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{concept.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    View concept
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </ContentCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Quick actions */}
        <ScrollReveal delay={300} duration={500}>
          <ContentCard className="p-6 mt-8 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guide"
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Live Guides
              </Link>
              <Link
                href="/garage"
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Live Garage
              </Link>
              <Link
                href="/symptom-chat"
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Symptom Chat
              </Link>
            </div>
          </ContentCard>
        </ScrollReveal>
      </div>
    </PageLayout>
  );
}
