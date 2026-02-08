'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { useVehicleContext } from '@/contexts/AppContext';
import { formatVehicleDisplay } from '@/schemas/vehicle.schema';
import { PageTransition } from '@/components/ui/PageTransition';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { DiagnosisCard } from '@/components/chat/DiagnosisCard';
import { useSymptomChat } from '@/hooks/useSymptomChat';

/**
 * Symptom Chat Page - AI Symptom Diagnosis Interface
 *
 * Users describe their vehicle symptoms in natural language via chat.
 * AI asks clarifying questions and provides diagnosis.
 *
 * Redirects to home if no vehicle is selected.
 */

function SymptomChatContent() {
  const router = useRouter();
  const { selectedVehicle, isVehicleSelected } = useVehicleContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  } = useSymptomChat(selectedVehicle);

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
    <PageTransition duration={300}>
      <main className="min-h-screen bg-gray-50 flex flex-col">
        {/* Vehicle Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Your Vehicle
                </p>
                <h1 className="text-lg font-semibold text-gray-900">
                  {formatVehicleDisplay(selectedVehicle)}
                </h1>
              </div>
              <Link
                href="/get-started"
                className="
                  text-sm text-blue-600 hover:text-blue-700
                  underline underline-offset-2
                  min-h-[44px] min-w-[44px] flex items-center justify-center
                "
              >
                Change
              </Link>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      Hi! I&apos;m here to help diagnose issues with your{' '}
                      <span className="font-medium">
                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </span>
                      .
                    </p>
                    <p className="text-gray-700 mt-3">
                      Describe your vehicle&apos;s symptoms in as much detail as possible. For example:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-500 text-sm">
                      <li>• &quot;My car makes a squealing noise when I brake&quot;</li>
                      <li>• &quot;The engine runs rough at idle&quot;</li>
                      <li>• &quot;Check engine light came on after filling up&quot;</li>
                    </ul>
                  </div>
                </div>
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
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  className="mt-2 text-sm text-red-600 underline hover:text-red-700"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Diagnosis Card */}
            {hasDiagnosis && diagnosis && (
              <div className="mb-4">
                <DiagnosisCard
                  diagnosis={diagnosis}
                  onGenerateGuide={handleGenerateGuide}
                />
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 pb-safe">
            <ChatInput
              value={currentMessage}
              onChange={setCurrentMessage}
              onSend={sendMessage}
              disabled={isLoading}
              placeholder={
                messages.length === 0
                  ? "Describe your vehicle's symptoms..."
                  : 'Type your response...'
              }
            />

            {/* Actions */}
            {messages.length > 0 && (
              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

export default function SymptomChatPage() {
  return (
    <PhaseProvider defaultPhase="discovery">
      <SymptomChatContent />
    </PhaseProvider>
  );
}
