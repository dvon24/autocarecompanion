'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { useVehicleContext } from '@/contexts/AppContext';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { DiagnosisCard } from '@/components/chat/DiagnosisCard';
import { useSymptomChat } from '@/hooks/useSymptomChat';
import { useOBDCodes } from '@/hooks/useOBDCodes';
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
    hasDiagnosis,
    sendMessage,
    clearChat,
  } = useSymptomChat({ vehicle: selectedVehicle, obdCodes });

  // Redirect to home if no vehicle is selected
  useEffect(() => {
    if (!isVehicleSelected) {
      router.push('/');
    }
  }, [isVehicleSelected, router]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle generate guide action
  const handleGenerateGuide = () => {
    // TODO: Navigate to guide generation with diagnosis context
    console.log('Generate guide for:', diagnosis);
    alert('Guide generation will be implemented in Story 1.6');
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
    <main className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b border-gray-100">
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
        className="flex-1 overflow-y-auto"
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
                    Hi! I&apos;m here to help diagnose issues with your{' '}
                    <span className="font-medium">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                    . Describe what&apos;s happening and I&apos;ll help figure out the problem.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Squealing when braking",
                      "Engine runs rough",
                      "Check engine light on",
                      "Car won't start",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setCurrentMessage(suggestion);
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

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
                onGenerateGuide={handleGenerateGuide}
              />
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
