'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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

/**
 * Symptom Chat Page - AI Symptom Diagnosis Interface
 *
 * Clean, minimal design inspired by chat-sdk.dev
 * Redirects to home if no vehicle is selected.
 */

function SymptomChatContent() {
  const router = useRouter();
  const { selectedVehicle, isVehicleSelected } = useVehicleContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const [showOBDInput, setShowOBDInput] = useState(false);

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

  // Redirect to home if no vehicle is selected
  useEffect(() => {
    if (!isVehicleSelected) {
      router.push('/');
    }
  }, [isVehicleSelected, router]);

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
    <main className="h-screen bg-white flex flex-col overflow-hidden relative">
      {/* Gradient blobs - subtle blue accents */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(30%, -40%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(-40%, 30%)',
          zIndex: 1,
        }}
      />

      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/get-started"
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
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
            <div>
              <h1 className="font-medium text-gray-900">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </h1>
              <p className="text-xs text-gray-500">{selectedVehicle.trim}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              New chat
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative z-10"
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
                    Hi! I&apos;m here to help with your{' '}
                    <span className="font-medium">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                    . What would you like help with?
                  </p>

                  {/* Common Maintenance Tasks - Generate guides directly */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Common Tasks</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Oil change",
                        "Battery replacement",
                        "Wiper blade replacement",
                        "Brake pad replacement",
                        "Air filter replacement",
                        "Tire rotation",
                      ].map((task) => (
                        <button
                          key={task}
                          type="button"
                          onClick={() => handleCommonTask(task)}
                          disabled={isGenerating}
                          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                            isGenerating
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {task}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Problem Symptoms - Go through chat for diagnosis */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Describe a Problem</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Squealing when braking",
                        "Engine runs rough",
                        "Check engine light on",
                        "Car won't start",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setCurrentMessage(suggestion)}
                          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                    ))}
                    </div>
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
              {guideError && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-red-700 text-sm">{guideError}</p>
                </div>
              )}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white">
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
    <PhaseProvider defaultPhase="discovery">
      <SymptomChatContent />
    </PhaseProvider>
  );
}
