'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { useVehicleContext } from '@/contexts/AppContext';
import { formatVehicleDisplay } from '@/schemas/vehicle.schema';
import { PageTransition } from '@/components/ui/PageTransition';

/**
 * Symptom Chat Page - Placeholder for AI Symptom Chat Interface
 *
 * Displays the selected vehicle as a compact header and provides
 * a placeholder for the AI chat interface (implemented in Story 1.3).
 *
 * Redirects to home if no vehicle is selected.
 */

function SymptomChatContent() {
  const router = useRouter();
  const { selectedVehicle, isVehicleSelected } = useVehicleContext();

  // Redirect to home if no vehicle is selected
  useEffect(() => {
    if (!isVehicleSelected) {
      router.push('/');
    }
  }, [isVehicleSelected, router]);

  // Show loading state while checking vehicle
  if (!isVehicleSelected || !selectedVehicle) {
    return (
      <main className="min-h-screen bg-discovery-background flex items-center justify-center">
        <div className="text-discovery-muted">Redirecting...</div>
      </main>
    );
  }

  return (
    <PageTransition duration={300}>
      <main className="min-h-screen bg-discovery-background flex flex-col">
        {/* Vehicle Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-discovery-muted uppercase tracking-wide">
                Your Vehicle
              </p>
              <h1 className="text-lg font-semibold text-discovery-text">
                {formatVehicleDisplay(selectedVehicle)}
              </h1>
            </div>
            <Link
              href="/"
              className="
                text-sm text-discovery-primary hover:text-blue-700
                underline underline-offset-2
                min-h-[44px] min-w-[44px] flex items-center justify-center
              "
            >
              Change Vehicle
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        {/* Welcome Message */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-discovery-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-discovery-text">
                Hello! I&apos;m here to help diagnose issues with your{' '}
                <span className="font-medium">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </span>
                .
              </p>
              <p className="text-discovery-text mt-3">
                Describe your vehicle&apos;s symptoms in as much detail as possible. For example:
              </p>
              <ul className="mt-2 space-y-1 text-discovery-muted text-sm">
                <li>&bull; &quot;My car makes a squealing noise when I brake&quot;</li>
                <li>&bull; &quot;The engine runs rough at idle&quot;</li>
                <li>&bull; &quot;Check engine light came on after filling up&quot;</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Placeholder Input */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                placeholder="Describe your vehicle's symptoms..."
                className="
                  w-full px-4 py-3 rounded-lg border border-gray-300
                  text-discovery-text placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent
                  resize-none
                "
                rows={3}
                disabled
              />
            </div>
            <button
              type="button"
              disabled
              className="
                min-h-[44px] min-w-[44px] px-4
                bg-gray-300 text-gray-500 rounded-lg
                cursor-not-allowed
              "
            >
              Send
            </button>
          </div>
          <p className="text-xs text-discovery-muted mt-2 text-center">
            AI chat will be implemented in Story 1.3
          </p>
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
