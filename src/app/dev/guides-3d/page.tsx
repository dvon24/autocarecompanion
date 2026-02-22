'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PageLayout } from '@/components/ui/PageLayout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Dynamically import 3D component to avoid SSR issues
const StepSync3DViewer = dynamic(
  () => import('@/components/3d/StepSync3DViewer').then(mod => mod.StepSync3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading 3D view...</div>
      </div>
    ),
  }
);

// Model paths for the Challenger
const CHALLENGER_MODEL = '/models/challenger/SRT392proofofconcept/DodgeChallengerSRT_392HEMI_AJ_Mat.glb';
const CHALLENGER_HOOD_OPEN = '/models/challenger/SRT392proofofconcept/DodgeChallengerSRT_392HEMI_HoodOpenAnin_AJ_Mat.glb';

// Sample guide data with step-specific 3D camera positions
const sampleGuide = {
  title: 'Oil Change Guide',
  difficulty: 'Easy',
  time: '30-45 minutes',
  tools: ['Oil filter wrench', 'Drain pan', 'Socket set (17mm)', 'Funnel', 'Jack stands'],
  parts: ['5 quarts 0W-20 synthetic oil', 'Oil filter (OEM or equivalent)', 'Drain plug washer'],
  steps: [
    {
      number: 1,
      title: 'Gather your materials',
      description: 'Ensure you have all the necessary tools and parts before starting. Check that your new oil matches the weight specified in your owner\'s manual.',
      cameraPosition: [5, 3, 5] as [number, number, number],
      cameraTarget: [0, 0.5, 0] as [number, number, number],
      highlightArea: 'overview',
      useHoodOpen: false,
    },
    {
      number: 2,
      title: 'Warm up the engine',
      description: 'Run your engine for 2-3 minutes to warm up the oil. This helps it drain more completely. Don\'t make it too hot - warm is sufficient.',
      cameraPosition: [3, 2, 0] as [number, number, number],
      cameraTarget: [1, 0.5, 0] as [number, number, number],
      highlightArea: 'engine',
      useHoodOpen: true, // Show hood open for engine warm-up
    },
    {
      number: 3,
      title: 'Raise the vehicle safely',
      description: 'Safely raise the vehicle using jack stands. Never work under a vehicle supported only by a jack. Ensure the vehicle is level and secure.',
      cameraPosition: [4, 0.5, 4] as [number, number, number],
      cameraTarget: [0, 0.3, 0] as [number, number, number],
      highlightArea: 'underside',
      useHoodOpen: false,
    },
    {
      number: 4,
      title: 'Locate the oil drain plug',
      description: 'Position your drain pan under the oil pan drain plug. The drain plug is typically a bolt on the bottom of the oil pan.',
      cameraPosition: [2, -0.5, 3] as [number, number, number],
      cameraTarget: [1.5, 0.1, 0] as [number, number, number],
      highlightArea: 'oil_drain',
      useHoodOpen: false,
    },
    {
      number: 5,
      title: 'Drain the old oil',
      description: 'Using the appropriate socket, loosen and remove the drain plug. Let the oil drain completely for about 5-10 minutes. Be careful - oil may be warm.',
      cameraPosition: [2, 0, 2] as [number, number, number],
      cameraTarget: [1.5, 0.2, 0] as [number, number, number],
      highlightArea: 'oil_drain',
      useHoodOpen: false,
    },
    {
      number: 6,
      title: 'Replace the oil filter',
      description: 'Locate the oil filter and remove it using the filter wrench. Apply a thin layer of new oil to the gasket of the new filter. Install the new filter hand-tight.',
      cameraPosition: [3, 1, 2] as [number, number, number],
      cameraTarget: [1.2, 0.5, 0.5] as [number, number, number],
      highlightArea: 'oil_filter',
      useHoodOpen: false,
    },
    {
      number: 7,
      title: 'Reinstall drain plug',
      description: 'Reinstall the drain plug with a new crush washer if needed. Tighten to approximately 30 ft-lbs. Do not overtighten.',
      cameraPosition: [2, 0, 3] as [number, number, number],
      cameraTarget: [1.5, 0.1, 0] as [number, number, number],
      highlightArea: 'oil_drain',
      useHoodOpen: false,
    },
    {
      number: 8,
      title: 'Lower the vehicle',
      description: 'Remove jack stands and carefully lower the vehicle back to the ground.',
      cameraPosition: [5, 2, 4] as [number, number, number],
      cameraTarget: [0, 0.5, 0] as [number, number, number],
      highlightArea: 'overview',
      useHoodOpen: false,
    },
    {
      number: 9,
      title: 'Add new oil',
      description: 'Add the specified amount of new oil through the oil filler cap. For this vehicle, add approximately 4.5 quarts to start.',
      cameraPosition: [2, 2, 1] as [number, number, number],
      cameraTarget: [0.5, 0.8, 0] as [number, number, number],
      highlightArea: 'oil_cap',
      useHoodOpen: true, // Hood open for adding oil
    },
    {
      number: 10,
      title: 'Check oil level',
      description: 'Use the dipstick to verify the oil level is correct. Start the engine and let it run for a minute. Check for leaks around the filter and drain plug.',
      cameraPosition: [3, 2, 2] as [number, number, number],
      cameraTarget: [0.5, 0.8, 0] as [number, number, number],
      highlightArea: 'engine',
      useHoodOpen: true, // Hood open for checking dipstick
    },
  ],
};

export default function Guides3DPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [preflightComplete, setPreflightComplete] = useState(false);
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set());
  const [checkedParts, setCheckedParts] = useState<Set<string>>(new Set());
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const allToolsChecked = checkedTools.size === sampleGuide.tools.length;
  const allPartsChecked = checkedParts.size === sampleGuide.parts.length;

  const toggleStep = useCallback((stepNum: number) => {
    setCompletedSteps(prev => {
      const newCompleted = new Set(prev);
      if (newCompleted.has(stepNum)) {
        newCompleted.delete(stepNum);
      } else {
        newCompleted.add(stepNum);
      }
      return newCompleted;
    });
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentStep(index);
    // Scroll the step into view
    const stepElement = document.getElementById(`step-${index}`);
    if (stepElement && stepsContainerRef.current) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < sampleGuide.steps.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Get current step's camera settings
  const currentStepData = sampleGuide.steps[currentStep];

  return (
    <PageLayout backLink={{ href: '/dev', label: 'Dev Concepts' }}>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dev" className="text-sm text-gray-500 hover:text-gray-700">
              Dev Concepts
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-900">3D Split-Screen Guide</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sampleGuide.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {sampleGuide.difficulty}
                </span>
                <span>{sampleGuide.time}</span>
                {preflightComplete && (
                  <span className="text-blue-600">
                    Step {currentStep + 1} of {sampleGuide.steps.length}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Prototype
              </span>
              <Link
                href="/dev/guides-classic"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                View Classic Version
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Guide content */}
          <div className="w-1/2 border-r border-gray-100 overflow-y-auto" ref={stepsContainerRef}>
            {!preflightComplete ? (
              /* Pre-flight Checklist */
              <div className="p-6">
                <ScrollReveal delay={0} duration={400}>
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Pre-Flight Checklist
                    </h2>

                    {/* Tools */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                          {checkedTools.size}/{sampleGuide.tools.length}
                        </span>
                        Tools Required
                      </h3>
                      <div className="space-y-2">
                        {sampleGuide.tools.map((tool) => (
                          <label
                            key={tool}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={checkedTools.has(tool)}
                              onChange={() => {
                                setCheckedTools(prev => {
                                  const newChecked = new Set(prev);
                                  if (newChecked.has(tool)) {
                                    newChecked.delete(tool);
                                  } else {
                                    newChecked.add(tool);
                                  }
                                  return newChecked;
                                });
                              }}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className={`text-gray-700 ${checkedTools.has(tool) ? 'line-through text-gray-400' : ''}`}>
                              {tool}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Parts */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                          {checkedParts.size}/{sampleGuide.parts.length}
                        </span>
                        Parts Required
                      </h3>
                      <div className="space-y-2">
                        {sampleGuide.parts.map((part) => (
                          <label
                            key={part}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={checkedParts.has(part)}
                              onChange={() => {
                                setCheckedParts(prev => {
                                  const newChecked = new Set(prev);
                                  if (newChecked.has(part)) {
                                    newChecked.delete(part);
                                  } else {
                                    newChecked.add(part);
                                  }
                                  return newChecked;
                                });
                              }}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className={`text-gray-700 ${checkedParts.has(part) ? 'line-through text-gray-400' : ''}`}>
                              {part}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ready button */}
                    <button
                      onClick={() => setPreflightComplete(true)}
                      disabled={!allToolsChecked || !allPartsChecked}
                      className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {allToolsChecked && allPartsChecked
                        ? "I'm Ready - Start Guide"
                        : 'Check all items to continue'}
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            ) : (
              /* Guide Steps */
              <div className="p-6 space-y-4">
                {sampleGuide.steps.map((step, index) => (
                  <div
                    key={step.number}
                    id={`step-${index}`}
                    onClick={() => goToStep(index)}
                    className={`
                      p-5 rounded-xl border-2 cursor-pointer transition-all duration-300
                      ${completedSteps.has(step.number)
                        ? 'bg-green-50 border-green-200'
                        : currentStep === index
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(step.number);
                        }}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                          ${completedSteps.has(step.number)
                            ? 'bg-green-500 text-white'
                            : currentStep === index
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {completedSteps.has(step.number) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="font-semibold">{step.number}</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          currentStep === index ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`${currentStep === index ? 'text-blue-700' : 'text-gray-600'}`}>
                          {step.description}
                        </p>
                        {currentStep === index && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Current Step
                            </span>
                            <span className="text-xs text-gray-500">
                              Click the circle to mark complete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Completion summary */}
                {completedSteps.size === sampleGuide.steps.length && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">Guide Complete!</h3>
                        <p className="text-green-700">You&apos;ve finished all {sampleGuide.steps.length} steps.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - 3D Viewer */}
          <div className="w-1/2 bg-gray-900 flex flex-col">
            <div className="flex-1 relative">
              <StepSync3DViewer
                currentStep={preflightComplete ? currentStep : -1}
                cameraPosition={currentStepData?.cameraPosition || [5, 3, 5]}
                cameraTarget={currentStepData?.cameraTarget || [0, 0.5, 0]}
                highlightArea={preflightComplete ? currentStepData?.highlightArea : undefined}
                bodyType="coupe"
                color="#374151"
                customModelPath={CHALLENGER_MODEL}
                alternateModelPath={CHALLENGER_HOOD_OPEN}
                useAlternateModel={preflightComplete && currentStepData?.useHoodOpen}
                customModelScale={1}
                customModelPosition={[0, 0, 0]}
                customModelRotation={[0, 0, 0]}
              />

              {/* 3D Controls overlay */}
              {preflightComplete && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </span>
                  </button>

                  <div className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg">
                    <span className="text-sm">
                      Viewing: <span className="font-medium">{currentStepData?.highlightArea || 'Overview'}</span>
                    </span>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={currentStep === sampleGuide.steps.length - 1}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              )}

              {/* Instructions overlay when not started */}
              {!preflightComplete && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                  <div className="text-center text-white p-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">3D Repair Guide</h3>
                    <p className="text-gray-400 max-w-xs">
                      Complete the checklist to unlock the interactive 3D guide with step-by-step camera positions
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {preflightComplete && (
              <div className="h-1 bg-gray-800">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / sampleGuide.steps.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
