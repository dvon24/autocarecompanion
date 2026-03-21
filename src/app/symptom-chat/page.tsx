'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { useVehicleContext } from '@/contexts/AppContext';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { DiagnosisCard } from '@/components/chat/DiagnosisCard';
import { useSymptomChat } from '@/hooks/useSymptomChat';
import { useOBDCodes } from '@/hooks/useOBDCodes';
import { useGuide } from '@/hooks/useGuide';
import { OBDCodeInput } from '@/components/discovery/OBDCodeInput';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { CommunityResourcesFallback } from '@/components/chat/CommunityResourcesFallback';

/**
 * Symptom Chat Page - AI Symptom Diagnosis Interface
 *
 * Clean, minimal design inspired by chat-sdk.dev
 * Redirects to home if no vehicle is selected.
 */

function SymptomChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedVehicle, isVehicleSelected, setVehicle } = useVehicleContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const [showOBDInput, setShowOBDInput] = useState(false);
  const [acknowledgedIssues, setAcknowledgedIssues] = useState<KnownIssue[]>([]);

  // Collapsible section states - all collapsed by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // OBD codes state
  const {
    codes: obdCodes,
    addCode: addOBDCode,
    removeCode: removeOBDCode,
    hasOBDCodes,
  } = useOBDCodes();

  const {
    messages,
    currentMessage,
    setCurrentMessage,
    isLoading,
    error,
    diagnosis,
    alternativeDiagnoses,
    hasDiagnosis,
    sendMessage,
    clearChat,
    selectAlternative,
  } = useSymptomChat({ vehicle: selectedVehicle, obdCodes });

  // Guide generation state
  const {
    guide,
    isGenerating,
    hasGuide,
    error: guideError,
    generateGuide,
    clearGuide,
  } = useGuide();

  // Track whether we arrived with partial vehicle info (make/model only, no year/trim)
  const [needsYearTrim, setNeedsYearTrim] = useState(false);

  // Override vehicle context from URL params (e.g., coming from known issues page)
  useEffect(() => {
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const trim = searchParams.get('trim');
    if (make && model && year && trim) {
      // Full YMMT provided — set it directly
      setVehicle({
        year: parseInt(year, 10),
        make,
        model,
        trim,
      });
      setNeedsYearTrim(false);
    } else if (make && model) {
      // Only make/model from article page — check if stored vehicle matches
      const storedMakeMatch = selectedVehicle?.make?.toLowerCase() === make.toLowerCase();
      const storedModelMatch = selectedVehicle?.model?.toLowerCase() === model.toLowerCase();
      if (!storedMakeMatch || !storedModelMatch) {
        // Stored vehicle doesn't match article — override with article's make/model
        // Use placeholder year/trim so the header shows the right car
        setVehicle({
          year: new Date().getFullYear(),
          make,
          model,
          trim: '',
        });
        setNeedsYearTrim(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to home if no vehicle is selected
  useEffect(() => {
    if (!isVehicleSelected && !searchParams.get('make')) {
      router.push('/');
    }
  }, [isVehicleSelected, searchParams, router]);

  // Load acknowledged known issues from sessionStorage
  // Keep them in sessionStorage so they persist when navigating back from guides
  useEffect(() => {
    const storedIssues = sessionStorage.getItem('acknowledgedKnownIssues');
    if (storedIssues) {
      try {
        const issues = JSON.parse(storedIssues) as KnownIssue[];
        setAcknowledgedIssues(issues);
        // Don't clear - keep issues available during the session
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Check for pending task (from "What's next?" on guide completion)
  useEffect(() => {
    const pendingTask = sessionStorage.getItem('pendingTask');
    if (pendingTask && selectedVehicle && !isGenerating) {
      sessionStorage.removeItem('pendingTask');
      // Auto-trigger guide generation for the pending task
      handleCommonTask(pendingTask);
    }
  }, [selectedVehicle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom only when NEW messages are added (not on every render)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Handle generate guide action
  const handleGenerateGuide = async () => {
    if (!selectedVehicle || !diagnosis) return;
    await generateGuide(selectedVehicle, diagnosis);
  };

  // Navigate directly to guide when generated (pre-flight is now integrated into guide page)
  useEffect(() => {
    if (hasGuide && guide) {
      sessionStorage.setItem('currentGuide', JSON.stringify(guide));
      router.push('/guide');
    }
  }, [hasGuide, guide, router]);

  // Handle common maintenance task - generates guide directly (skips chat)
  const handleCommonTask = async (taskName: string) => {
    if (!selectedVehicle || isGenerating) return;

    // Create a diagnosis for the common task
    const taskDiagnosis = {
      id: `task_${Date.now()}`,
      title: taskName,
      description: `Routine ${taskName.toLowerCase()} maintenance`,
      confidence: 'high' as const,
      possibleCauses: [],
      recommendedAction: `Perform ${taskName.toLowerCase()} following manufacturer specifications`,
    };

    // Generate guide directly
    await generateGuide(selectedVehicle, taskDiagnosis);
  };

  // Show loading state while checking vehicle
  if (!isVehicleSelected || !selectedVehicle) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Redirecting...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 border-b border-gray-100 bg-white z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Au7o Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/og-image.png"
                alt="Au7o mascot"
                width={24}
                height={24}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Au<span className="text-blue-600">7</span>o
              </span>
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <Link href="/" className="group">
              <h1 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {needsYearTrim ? '' : `${selectedVehicle.year} `}{selectedVehicle.make} {selectedVehicle.model}
                <svg className="inline-block w-3.5 h-3.5 ml-1 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </h1>
              {!needsYearTrim && selectedVehicle.trim && (
                <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">{selectedVehicle.trim}</p>
              )}
              {needsYearTrim && (
                <p className="text-xs text-amber-600">Tap to select year & trim</p>
              )}
            </Link>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearChat();
                clearGuide();
                // Keep known issues — user may want to reference them in a new chat
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              New chat
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages - with padding for fixed header and input */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pt-16 pb-24"
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="mb-8">
              <div className="flex items-start gap-3">
                {/* AI Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] text-gray-900 leading-relaxed">
                    {needsYearTrim ? (
                      <>
                        Hi! I see you&apos;re looking at <span className="font-medium">{selectedVehicle.make} {selectedVehicle.model}</span> issues.
                        What year and trim is your {selectedVehicle.model}? This helps me give you more accurate advice.
                      </>
                    ) : (
                      <>
                        Hi! I&apos;m here to help with your{' '}
                        <span className="font-medium">
                          {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                        </span>
                        . What would you like help with?
                      </>
                    )}
                  </p>

                  {/* Known Issues Section - shown when user acknowledged issues */}
                  {acknowledgedIssues.length > 0 && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('known-issues')}
                        className="w-full p-4 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-medium text-amber-800">
                            Known issues for your vehicle
                          </p>
                          <span className="px-1.5 py-0.5 text-xs bg-amber-200 text-amber-800 rounded-full">
                            {acknowledgedIssues.length}
                          </span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-amber-600 transition-transform ${expandedSections.has('known-issues') ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedSections.has('known-issues') && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-amber-700 mb-3">
                            Tap an issue to discuss it:
                          </p>
                          <div className="space-y-2">
                            {acknowledgedIssues.slice(0, 5).map((issue) => (
                              <button
                                key={issue.id}
                                type="button"
                                onClick={() => setCurrentMessage(`I'd like help with: ${issue.title}`)}
                                className="w-full p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-left"
                              >
                                <div className="flex items-start gap-2">
                                  <span className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${
                                    issue.severity === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : issue.severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {issue.severity === 'high' ? 'Critical' : issue.severity === 'medium' ? 'Moderate' : 'Minor'}
                                  </span>
                                  <span className="text-sm text-gray-900 font-medium">{issue.title}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          {acknowledgedIssues.length > 5 && (
                            <p className="text-xs text-amber-600 mt-2">
                              +{acknowledgedIssues.length - 5} more issues
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Common Maintenance Tasks - Generate guides directly */}
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('common-tasks')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Common Tasks</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.has('common-tasks') ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.has('common-tasks') && (
                      <div className="px-4 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Oil change",
                            "Brake pad replacement",
                            "Spark plug replacement",
                            "Battery replacement",
                            "Air filter replacement",
                            "Cabin air filter",
                            "Tire rotation",
                            "Coolant flush",
                            "Transmission fluid change",
                            "Wiper blade replacement",
                            "Light bulb replacement",
                            "Serpentine belt replacement",
                            "Power steering fluid",
                            "Wheel alignment check",
                          ].map((task) => (
                            <button
                              key={task}
                              type="button"
                              onClick={() => handleCommonTask(task)}
                              disabled={isGenerating}
                              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                                isGenerating
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                              }`}
                            >
                              {task}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Problem Symptoms - Go through chat for diagnosis */}
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('describe-problem')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Describe a Problem</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.has('describe-problem') ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.has('describe-problem') && (
                      <div className="px-4 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Squealing when braking",
                            "Engine runs rough",
                            "Check engine light on",
                            "Car won't start",
                            "Help me find a part",
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setCurrentMessage(suggestion)}
                              className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-full transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guide Generation Loading */}
                  {isGenerating && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Generating your repair guide...</span>
                      </div>
                    </div>
                  )}

                  {/* Guide Generation Error - Show Community Resources Fallback */}
                  {guideError && !isGenerating && selectedVehicle && (
                    <div className="mt-4">
                      <CommunityResourcesFallback
                        vehicle={{
                          year: selectedVehicle.year,
                          make: selectedVehicle.make,
                          model: selectedVehicle.model,
                        }}
                        problem={typeof diagnosis === 'string' ? diagnosis : (diagnosis?.title || 'repair issue')}
                        onDismiss={clearGuide}
                      />
                    </div>
                  )}

                  {/* OBD Code Entry Option */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowOBDInput(true)}
                      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      Have OBD codes? Add them for better diagnosis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OBD Code Input Panel */}
          {showOBDInput && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Enter OBD Codes</h3>
                <button
                  type="button"
                  onClick={() => setShowOBDInput(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <OBDCodeInput
                codes={obdCodes}
                onAddCode={addOBDCode}
                onRemoveCode={removeOBDCode}
                onSkip={() => setShowOBDInput(false)}
                onContinue={() => setShowOBDInput(false)}
              />
            </div>
          )}

          {/* OBD Codes Badge (if codes are entered) */}
          {hasOBDCodes && !showOBDInput && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowOBDInput(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {obdCodes.length} OBD Code{obdCodes.length > 1 ? 's' : ''} Added
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading Indicator */}
          {isLoading && <ChatMessageLoading />}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => sendMessage()}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Diagnosis Card */}
          {hasDiagnosis && diagnosis && (
            <div className="mb-6">
              <DiagnosisCard
                diagnosis={diagnosis}
                alternativeDiagnoses={alternativeDiagnoses}
                onGenerateGuide={handleGenerateGuide}
                onSelectAlternative={selectAlternative}
                isGeneratingGuide={isGenerating}
              />
              {guideError && selectedVehicle && (
                <div className="mt-4">
                  <CommunityResourcesFallback
                    vehicle={{
                      year: selectedVehicle.year,
                      make: selectedVehicle.make,
                      model: selectedVehicle.model,
                    }}
                    problem={typeof diagnosis === 'string' ? diagnosis : (diagnosis?.title || 'repair issue')}
                    onDismiss={clearGuide}
                  />
                </div>
              )}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput
            value={currentMessage}
            onChange={setCurrentMessage}
            onSend={sendMessage}
            disabled={isLoading}
            placeholder={
              messages.length === 0
                ? "Describe your vehicle's symptoms..."
                : 'Send a message...'
            }
          />
        </div>
      </div>
    </main>
  );
}

export default function SymptomChatPage() {
  return (
    <Suspense>
      <PhaseProvider defaultPhase="discovery">
        <SymptomChatContent />
      </PhaseProvider>
    </Suspense>
  );
}
