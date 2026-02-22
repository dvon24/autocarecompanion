'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PageLayout, ContentCard } from '@/components/ui/PageLayout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Dynamically import 3D component to avoid SSR issues
const CarViewer = dynamic(
  () => import('@/components/3d/CarViewer').then(mod => mod.CarViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/9] bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading 3D view...</div>
      </div>
    ),
  }
);

const wheelStyles = [
  { id: 'stock', name: 'Stock', preview: 'Standard OEM wheels' },
  { id: 'sport', name: 'Sport 5-Spoke', preview: 'Lightweight performance' },
  { id: 'mesh', name: 'Mesh', preview: 'Classic racing look' },
  { id: 'deep-dish', name: 'Deep Dish', preview: 'Aggressive stance' },
];

const wheelFinishes = [
  { id: 'silver', name: 'Silver', color: '#C0C0C0' },
  { id: 'gunmetal', name: 'Gunmetal', color: '#4A4A4A' },
  { id: 'black', name: 'Gloss Black', color: '#1A1A1A' },
  { id: 'bronze', name: 'Bronze', color: '#8B6914' },
  { id: 'gold', name: 'Gold', color: '#D4AF37' },
];

export default function WheelCustomizerPage() {
  const [wheelConfig, setWheelConfig] = useState({
    diameter: 18,
    width: 8.5,
    offset: 35,
    style: 'sport',
    finish: 'gunmetal',
  });

  const [suspensionConfig, setSuspensionConfig] = useState({
    drop: 0,
  });

  const [carColor, setCarColor] = useState('#374151');

  const totalCost = wheelConfig.diameter >= 20 ? 2400 : wheelConfig.diameter >= 19 ? 1800 : 1200;

  return (
    <PageLayout backLink={{ href: '/dev', label: 'Dev Concepts' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <ScrollReveal delay={0} duration={500}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dev"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dev Concepts
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-900">Wheel Customizer</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Wheel & Suspension Customizer
            </h1>
            <p className="text-gray-500">
              Preview different wheel and suspension setups on your vehicle
            </p>
          </div>
        </ScrollReveal>

        {/* Concept Label */}
        <ScrollReveal delay={50} duration={500}>
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Concept
            </span>
            <span className="text-sm text-amber-700">
              This is a concept preview - full customization coming in a future release
            </span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Preview */}
          <ScrollReveal delay={100} duration={500}>
            <div className="lg:sticky lg:top-6">
              <CarViewer
                bodyType="sedan"
                color={carColor}
                wheelConfig={wheelConfig}
                suspensionConfig={suspensionConfig}
                interactive={true}
                className="rounded-2xl shadow-lg"
              />
              <p className="text-center text-sm text-gray-500 mt-3">
                Drag to rotate • Scroll to zoom
              </p>

              {/* Estimated Cost */}
              <ContentCard className="p-4 mt-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated wheel set cost:</span>
                  <span className="text-xl font-bold text-gray-900">${totalCost.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on average prices for {wheelConfig.diameter}" aftermarket wheels
                </p>
              </ContentCard>
            </div>
          </ScrollReveal>

          {/* Controls */}
          <ScrollReveal delay={150} duration={500}>
            <div className="space-y-6">
              {/* Car Color */}
              <ContentCard className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Car Color</h3>
                <div className="flex gap-3">
                  {['#374151', '#1e3a5f', '#7f1d1d', '#14532d', '#1e1e1e', '#f5f5f5'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCarColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${
                        carColor === color ? 'border-blue-500 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </ContentCard>

              {/* Wheel Size */}
              <ContentCard className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Wheel Size</h3>

                <div className="space-y-4">
                  {/* Diameter */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Diameter</span>
                      <span className="font-medium text-gray-900">{wheelConfig.diameter}"</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={22}
                      value={wheelConfig.diameter}
                      onChange={(e) => setWheelConfig({ ...wheelConfig, diameter: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>16"</span>
                      <span>22"</span>
                    </div>
                  </div>

                  {/* Width */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Width</span>
                      <span className="font-medium text-gray-900">{wheelConfig.width}"</span>
                    </div>
                    <input
                      type="range"
                      min={7}
                      max={12}
                      step={0.5}
                      value={wheelConfig.width}
                      onChange={(e) => setWheelConfig({ ...wheelConfig, width: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>7"</span>
                      <span>12"</span>
                    </div>
                  </div>

                  {/* Offset */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Offset</span>
                      <span className="font-medium text-gray-900">+{wheelConfig.offset}mm</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={50}
                      value={wheelConfig.offset}
                      onChange={(e) => setWheelConfig({ ...wheelConfig, offset: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>+15mm (wider)</span>
                      <span>+50mm (tucked)</span>
                    </div>
                  </div>
                </div>
              </ContentCard>

              {/* Wheel Style */}
              <ContentCard className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Wheel Style</h3>
                <div className="grid grid-cols-2 gap-3">
                  {wheelStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setWheelConfig({ ...wheelConfig, style: style.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        wheelConfig.style === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{style.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{style.preview}</p>
                    </button>
                  ))}
                </div>
              </ContentCard>

              {/* Wheel Finish */}
              <ContentCard className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Wheel Finish</h3>
                <div className="flex flex-wrap gap-3">
                  {wheelFinishes.map((finish) => (
                    <button
                      key={finish.id}
                      onClick={() => setWheelConfig({ ...wheelConfig, finish: finish.id })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        wheelConfig.finish === finish.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: finish.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{finish.name}</span>
                    </button>
                  ))}
                </div>
              </ContentCard>

              {/* Suspension */}
              <ContentCard className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Suspension Drop</h3>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Drop Amount</span>
                    <span className="font-medium text-gray-900">
                      {suspensionConfig.drop === 0 ? 'Stock' : suspensionConfig.drop > 0 ? `-${suspensionConfig.drop}"` : `+${Math.abs(suspensionConfig.drop)}" (lifted)`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-2}
                    max={4}
                    step={0.5}
                    value={suspensionConfig.drop}
                    onChange={(e) => setSuspensionConfig({ drop: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Lifted +2"</span>
                    <span>Stock</span>
                    <span>Lowered -4"</span>
                  </div>
                </div>
              </ContentCard>

              {/* Summary */}
              <ContentCard className="p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Current Configuration</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Wheels: {wheelConfig.diameter}x{wheelConfig.width} +{wheelConfig.offset}mm</p>
                  <p>Style: {wheelStyles.find(s => s.id === wheelConfig.style)?.name}</p>
                  <p>Finish: {wheelFinishes.find(f => f.id === wheelConfig.finish)?.name}</p>
                  {suspensionConfig.drop !== 0 && (
                    <p>Suspension: {suspensionConfig.drop > 0 ? `-${suspensionConfig.drop}"` : `+${Math.abs(suspensionConfig.drop)}" lifted`}</p>
                  )}
                </div>
              </ContentCard>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageLayout>
  );
}
