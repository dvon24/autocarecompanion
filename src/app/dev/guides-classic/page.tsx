'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GuideExecution } from '@/components/guide/GuideExecution';
import { type Guide } from '@/schemas/guide.schema';
import { PageLayout } from '@/components/ui/PageLayout';

// Sample guide data matching the production schema
const sampleGuide: Guide = {
  id: 'dev-oil-change-sample',
  title: 'Oil Change',
  description: 'Complete guide to changing your engine oil and filter',
  vehicle: {
    year: 2020,
    make: 'Honda',
    model: 'Accord',
    trim: 'Sport',
  },
  difficulty: 2,
  timeEstimate: '30-45 minutes',
  safetyLevel: 'diy-safe',
  parts: [
    {
      id: 'part-1',
      name: '5 Quarts 0W-20 Full Synthetic Oil',
      partNumber: 'MOB-0W20-5QT',
      oemPrice: '$35-45',
      aftermarketPrice: '$25-35',
    },
    {
      id: 'part-2',
      name: 'Oil Filter',
      partNumber: '15400-PLM-A02',
      oemPrice: '$12-18',
      aftermarketPrice: '$8-12',
    },
    {
      id: 'part-3',
      name: 'Drain Plug Crush Washer',
      partNumber: '94109-14000',
      oemPrice: '$2-4',
      notes: 'Replace with every oil change',
    },
  ],
  tools: [
    {
      id: 'tool-1',
      name: '17mm Socket or Wrench',
      purpose: 'Remove drain plug',
      required: true,
    },
    {
      id: 'tool-2',
      name: 'Oil Filter Wrench',
      purpose: 'Remove oil filter',
      required: true,
    },
    {
      id: 'tool-3',
      name: 'Drain Pan (5+ quart capacity)',
      purpose: 'Catch old oil',
      required: true,
    },
    {
      id: 'tool-4',
      name: 'Funnel',
      purpose: 'Pour new oil without spilling',
      required: true,
    },
    {
      id: 'tool-5',
      name: 'Jack and Jack Stands',
      purpose: 'Safely lift vehicle',
      required: true,
    },
    {
      id: 'tool-6',
      name: 'Nitrile Gloves',
      purpose: 'Keep hands clean',
      required: false,
    },
  ],
  steps: [
    {
      number: 1,
      instruction: 'Gather all tools and parts. Verify you have the correct oil weight (0W-20) and filter for your vehicle. Check that your drain pan can hold at least 5 quarts.',
      estimatedMinutes: 3,
      tips: [
        {
          id: 'tip-1-1',
          content: 'Having everything ready before you start prevents running to the store mid-job.',
        },
      ],
      safetyWarnings: [],
    },
    {
      number: 2,
      instruction: 'Warm up the engine by running it for 2-3 minutes. Warm oil flows faster and drains more completely. Do not make it hot - just warm to the touch.',
      estimatedMinutes: 3,
      tips: [
        {
          id: 'tip-2-1',
          content: 'Cold oil is thick and won\'t drain fully. Hot oil can cause burns.',
        },
      ],
      safetyWarnings: [
        {
          id: 'warn-2-1',
          severity: 'medium',
          message: 'Do not overheat the engine. Hot oil can cause serious burns.',
        },
      ],
    },
    {
      number: 3,
      instruction: 'Safely raise the front of the vehicle using a floor jack. Place jack stands under the frame rails or designated lift points. Lower the vehicle onto the jack stands and confirm stability.',
      estimatedMinutes: 5,
      tips: [
        {
          id: 'tip-3-1',
          content: 'Check your owner\'s manual for correct jack point locations.',
        },
      ],
      safetyWarnings: [
        {
          id: 'warn-3-1',
          severity: 'high',
          message: 'NEVER work under a vehicle supported only by a jack. Always use jack stands. The vehicle could fall and cause serious injury or death.',
        },
      ],
    },
    {
      number: 4,
      instruction: 'Locate the oil drain plug on the bottom of the oil pan. Position your drain pan directly underneath. Using a 17mm socket, loosen the drain plug counterclockwise. Remove it by hand for the final turns, keeping pressure inward to control the oil flow.',
      estimatedMinutes: 5,
      tips: [
        {
          id: 'tip-4-1',
          content: 'The oil will shoot out horizontally at first, so position the pan accordingly.',
        },
        {
          id: 'tip-4-2',
          content: 'If the plug is stuck, try a breaker bar or tap the wrench with a rubber mallet.',
        },
      ],
      safetyWarnings: [
        {
          id: 'warn-4-1',
          severity: 'medium',
          message: 'Oil may be hot. Wear gloves and be prepared for initial spray.',
        },
      ],
    },
    {
      number: 5,
      instruction: 'Allow the oil to drain completely for at least 10 minutes. While draining, inspect the drain plug threads and the old crush washer. Replace the crush washer with a new one.',
      estimatedMinutes: 10,
      tips: [
        {
          id: 'tip-5-1',
          content: 'Use this time to gather your new filter and prepare it.',
        },
      ],
      safetyWarnings: [],
    },
    {
      number: 6,
      instruction: 'Locate the oil filter - on this vehicle it\'s accessible from underneath. Use an oil filter wrench to loosen it counterclockwise. Unscrew it by hand, keeping it upright to avoid spilling. Let residual oil drain into the pan.',
      estimatedMinutes: 5,
      tips: [
        {
          id: 'tip-6-1',
          content: 'Some filters are easier to access from above the engine bay.',
        },
      ],
      safetyWarnings: [],
    },
    {
      number: 7,
      instruction: 'Prepare the new filter: Apply a thin layer of new oil to the rubber gasket. This ensures a good seal and makes removal easier next time. Hand-tighten the new filter until the gasket contacts the mounting surface, then tighten an additional 3/4 turn by hand.',
      estimatedMinutes: 3,
      tips: [
        {
          id: 'tip-7-1',
          content: 'Never use a wrench to tighten the filter - hand tight plus 3/4 turn is sufficient.',
        },
      ],
      safetyWarnings: [
        {
          id: 'warn-7-1',
          severity: 'low',
          message: 'Over-tightening can damage the gasket and cause leaks.',
        },
      ],
    },
    {
      number: 8,
      instruction: 'Reinstall the drain plug with a new crush washer. Tighten to approximately 30 ft-lbs. Do not overtighten - you can strip the oil pan threads.',
      estimatedMinutes: 2,
      tips: [
        {
          id: 'tip-8-1',
          content: 'If you don\'t have a torque wrench, snug plus 1/4 turn is usually adequate.',
        },
      ],
      safetyWarnings: [],
    },
    {
      number: 9,
      instruction: 'Lower the vehicle safely. Remove jack stands, raise the vehicle with the jack, remove the stands, then slowly lower the vehicle to the ground.',
      estimatedMinutes: 3,
      tips: [],
      safetyWarnings: [],
    },
    {
      number: 10,
      instruction: 'Open the hood and remove the oil filler cap. Using a funnel, add approximately 4.5 quarts of new oil. Check the dipstick - add oil in small amounts until the level reaches the full mark.',
      estimatedMinutes: 5,
      tips: [
        {
          id: 'tip-10-1',
          content: 'It\'s better to underfill slightly and add more than to overfill.',
        },
      ],
      safetyWarnings: [],
    },
    {
      number: 11,
      instruction: 'Replace the oil filler cap. Start the engine and let it run for 30 seconds. Check underneath for any leaks around the filter and drain plug. If you see drips, turn off the engine and tighten as needed.',
      estimatedMinutes: 2,
      tips: [],
      safetyWarnings: [],
    },
    {
      number: 12,
      instruction: 'Turn off the engine and wait 2 minutes for oil to settle. Check the dipstick again and add oil if needed to reach the full mark. Reset your oil life monitor if applicable.',
      estimatedMinutes: 3,
      tips: [
        {
          id: 'tip-12-1',
          content: 'For Honda: Turn ignition to ON (not start), press gas pedal 3 times within 5 seconds.',
        },
      ],
      safetyWarnings: [],
    },
  ],
  createdAt: Date.now(),
  version: 1,
};

export default function GuidesClassicPage() {
  const [showGuide, setShowGuide] = useState(false);

  // Store sample guide in sessionStorage to match production behavior
  useEffect(() => {
    sessionStorage.setItem('currentGuide', JSON.stringify(sampleGuide));
  }, []);

  if (!showGuide) {
    return (
      <PageLayout backLink={{ href: '/dev', label: 'Dev Concepts' }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dev" className="text-sm text-gray-500 hover:text-gray-700">
                Dev Concepts
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-900">Classic Guides</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Classic Guide Template</h1>
            <p className="text-gray-500">
              This is the current production guide template - the exact same component used in the live app.
            </p>
          </div>

          {/* Status badge */}
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Current Production
            </span>
            <span className="text-sm text-green-700">
              This is the live template from /guide
            </span>
          </div>

          {/* Sample guide info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Guide</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle:</span>
                <span className="text-gray-900">{sampleGuide.vehicle.year} {sampleGuide.vehicle.make} {sampleGuide.vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guide:</span>
                <span className="text-gray-900">{sampleGuide.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Steps:</span>
                <span className="text-gray-900">{sampleGuide.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="text-gray-900">{sampleGuide.timeEstimate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Parts:</span>
                <span className="text-gray-900">{sampleGuide.parts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tools:</span>
                <span className="text-gray-900">{sampleGuide.tools.length}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Launch Guide Preview
          </button>

          {/* Compare link */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">See the 3D Enhanced Version</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Compare with split-screen 3D guide layout
                </p>
              </div>
              <Link
                href="/dev/guides-3d"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View 3D Version
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Render the actual production GuideExecution component
  return (
    <GuideExecution
      guide={sampleGuide}
      onComplete={() => setShowGuide(false)}
      onExit={() => setShowGuide(false)}
      onNextTask={(task) => {
        console.log('Next task selected:', task);
        setShowGuide(false);
      }}
    />
  );
}
