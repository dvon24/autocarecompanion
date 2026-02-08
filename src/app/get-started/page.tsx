'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { YMMTSelector } from '@/components/discovery/YMMTSelector';
import { VINInput } from '@/components/discovery/VINInput';
import { PageTransition } from '@/components/ui/PageTransition';

type SelectionMode = 'vin' | 'manual';

export default function GetStartedPage() {
  const router = useRouter();
  const [mode, setMode] = useState<SelectionMode>('vin');

  const handleVehicleSelected = () => {
    router.push('/symptom-chat');
  };

  const handleSwitchToManual = () => {
    setMode('manual');
  };

  const handleSwitchToVin = () => {
    setMode('vin');
  };

  return (
    <PhaseProvider defaultPhase="discovery">
      <div className="min-h-screen bg-white">
        <PageTransition variant="breath">
          <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="px-6 py-6">
              <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </Link>
            </header>

            {/* Main content */}
            <section className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="w-full max-w-md">
                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                    {mode === 'vin' ? 'Enter Your VIN' : 'Select Your Vehicle'}
                  </h1>
                  <p className="text-gray-500">
                    {mode === 'vin'
                      ? 'We\'ll automatically identify your vehicle from its VIN.'
                      : 'We\'ll find the right guides for your exact make and model.'}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                  <button
                    type="button"
                    onClick={handleSwitchToVin}
                    className={`
                      flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all
                      ${mode === 'vin'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    Enter VIN
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToManual}
                    className={`
                      flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all
                      ${mode === 'manual'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    Manual Selection
                  </button>
                </div>

                {/* Vehicle Selection Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  {mode === 'vin' ? (
                    <VINInput
                      onComplete={handleVehicleSelected}
                      onSwitchToManual={handleSwitchToManual}
                    />
                  ) : (
                    <YMMTSelector onComplete={handleVehicleSelected} variant="light" />
                  )}
                </div>

                {/* Privacy note */}
                <p className="text-center text-gray-400 text-sm mt-6 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Your vehicle data stays on your device
                </p>
              </div>
            </section>
          </main>
        </PageTransition>
      </div>
    </PhaseProvider>
  );
}
