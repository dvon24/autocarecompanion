'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { useVehicleContext } from '@/contexts/AppContext';
import { YMMTSelector } from '@/components/discovery/YMMTSelector';
import { VINInput } from '@/components/discovery/VINInput';
import { CustomVehicleInput } from '@/components/discovery/CustomVehicleInput';
import { KnownIssuesBriefing } from '@/components/known-issues/KnownIssuesBriefing';

type SelectionMode = 'vin' | 'manual' | 'custom';

export default function GetStartedPage() {
  const router = useRouter();
  const { selectedVehicle } = useVehicleContext();
  const [mode, setMode] = useState<SelectionMode>('vin');
  const [showBriefing, setShowBriefing] = useState(false);

  const handleVehicleSelected = () => {
    // Show the known issues briefing before navigating
    setShowBriefing(true);
  };

  const handleBriefingDismiss = () => {
    setShowBriefing(false);
  };

  const handleBriefingContinue = () => {
    setShowBriefing(false);
    router.push('/symptom-chat');
  };

  const handlePartsLookup = () => {
    setShowBriefing(false);
    router.push('/parts');
  };

  const handleModeChange = (newMode: SelectionMode) => {
    setMode(newMode);
  };

  return (
    <PhaseProvider defaultPhase="discovery">
      <div className="min-h-screen bg-white">
        <main className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Back">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
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
            </div>
          </header>

          {/* Main content */}
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  {mode === 'vin' && 'Enter Your VIN'}
                  {mode === 'manual' && 'Select Your Vehicle'}
                  {mode === 'custom' && 'Describe Your Vehicle'}
                </h1>
                <p className="text-gray-500">
                  {mode === 'vin' && 'We\'ll automatically identify your vehicle from its VIN.'}
                  {mode === 'manual' && 'We\'ll find the right guides for your exact make and model.'}
                  {mode === 'custom' && 'Type your vehicle details and AI will validate it.'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => handleModeChange('vin')}
                  className={`
                    flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                    ${mode === 'vin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  VIN
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('manual')}
                  className={`
                    flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                    ${mode === 'manual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('custom')}
                  className={`
                    flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                    ${mode === 'custom'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  Describe
                </button>
              </div>

              {/* Database coverage notice */}
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800 text-center">
                  We&apos;re actively adding more vehicles to our database. Don&apos;t see yours? Try{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('custom')}
                    className="text-amber-700 hover:text-amber-900 font-semibold underline-offset-2 hover:underline"
                  >
                    Describe
                  </button>
                  {' '}instead, or{' '}
                  <Link
                    href="/feedback"
                    className="text-amber-700 hover:text-amber-900 font-semibold underline-offset-2 hover:underline"
                  >
                    let us know
                  </Link>
                  {' '}what you&apos;d like added.
                </p>
              </div>

              {/* Vehicle Selection Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                {mode === 'vin' && (
                  <VINInput
                    onComplete={handleVehicleSelected}
                    onSwitchToManual={() => handleModeChange('manual')}
                  />
                )}
                {mode === 'manual' && (
                  <YMMTSelector onComplete={handleVehicleSelected} variant="light" />
                )}
                {mode === 'custom' && (
                  <CustomVehicleInput onComplete={handleVehicleSelected} />
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

        {/* Known Issues Briefing Modal */}
        {showBriefing && selectedVehicle && (
          <KnownIssuesBriefing
            vehicle={{
              year: selectedVehicle.year,
              make: selectedVehicle.make,
              model: selectedVehicle.model,
              trim: selectedVehicle.trim,
            }}
            onDismiss={handleBriefingDismiss}
            onContinue={handleBriefingContinue}
            onPartsLookup={handlePartsLookup}
          />
        )}
      </div>
    </PhaseProvider>
  );
}
