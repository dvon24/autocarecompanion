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
      <main className="min-h-screen bg-discovery-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-discovery-text mb-2">
              Au7o
            </h1>
            <p className="text-discovery-muted">
              AI-powered automotive maintenance guides
            </p>
          </header>

          {/* Vehicle Selection */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-discovery-text mb-4">
              Select Your Vehicle
            </h2>
            <p className="text-discovery-muted text-sm mb-6">
              Choose your vehicle to get personalized diagnostics and repair guides.
            </p>

            <YMMTSelector onComplete={handleVehicleSelected} />
          </section>

          {/* Footer Info */}
          <footer className="mt-8 text-center text-sm text-discovery-muted">
            <p>Your vehicle data is stored locally on your device.</p>
          </footer>
        </div>
      </main>
    </PhaseProvider>
  );
}
