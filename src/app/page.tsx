'use client';

import { useRouter } from 'next/navigation';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { YMMTSelector } from '@/components/discovery/YMMTSelector';

export default function HomePage() {
  const router = useRouter();

  const handleVehicleSelected = () => {
    // Navigate to symptom chat with a smooth transition
    router.push('/symptom-chat');
  };

  return (
    <PhaseProvider defaultPhase="discovery">
      {/* Breathing gradient background - UX Spec signature motif */}
      <main className="min-h-screen breathing-gradient">
        <div className="container mx-auto px-4 py-12 max-w-lg">

          {/* Hero Section - The 3-Second Test */}
          <header className="text-center mb-12">
            {/* Bold headline with generous letter-spacing (huly.io influence) */}
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-[#1E3A5F] dark:text-[#E2E8F0]">
              Au<span className="text-discovery-primary">7</span>o
            </h1>

            {/* Value proposition - answered in 2 seconds */}
            <p className="text-xl text-[#475569] dark:text-[#94A3B8] font-medium leading-relaxed">
              Expert guidance in your garage.
              <br />
              <span className="text-discovery-primary">Online or off.</span>
            </p>
          </header>

          {/* Trust Signals - Immediate credibility */}
          <div className="flex justify-center gap-6 mb-10 text-sm text-[#475569] dark:text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>AI-validated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free to start</span>
            </div>
          </div>

          {/* Vehicle Selection Card - Above fold, prominent */}
          <section className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-500/5 dark:shadow-blue-400/5 p-8 border border-[#DBEAFE] dark:border-[#334155]">
            <h2 className="text-2xl font-semibold text-[#1E3A5F] dark:text-[#E2E8F0] mb-2 tracking-tight">
              Select Your Vehicle
            </h2>
            <p className="text-[#475569] dark:text-[#94A3B8] mb-6">
              Get personalized diagnostics and step-by-step repair guides.
            </p>

            <YMMTSelector onComplete={handleVehicleSelected} />
          </section>

          {/* Footer - Privacy reassurance */}
          <footer className="mt-10 text-center">
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Your data stays on your device
            </p>
          </footer>
        </div>
      </main>
    </PhaseProvider>
  );
}
