'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhaseProvider } from '@/contexts/PhaseContext';
import { GuideExecution } from '@/components/guide/GuideExecution';
import { type Guide } from '@/schemas/guide.schema';

/**
 * Guide Page - Guide Execution Interface
 *
 * Story 1.6: Guide Generation via AI
 * Story 1.7: Pre-Flight Modal (confirms user is ready)
 * Story 1.8: Guide Execution Interface (step-by-step with progress)
 */

function GuideContent() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);

  // Load guide from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('currentGuide');
    if (stored) {
      try {
        setGuide(JSON.parse(stored));
      } catch {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  // Handle guide completion
  const handleComplete = () => {
    sessionStorage.removeItem('currentGuide');
    router.push('/');
  };

  // Handle exit (back to symptom chat)
  const handleExit = () => {
    router.push('/symptom-chat');
  };

  if (!guide) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading guide...</div>
      </main>
    );
  }

  return (
    <GuideExecution
      guide={guide}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}

export default function GuidePage() {
  return (
    <PhaseProvider defaultPhase="discovery">
      <GuideContent />
    </PhaseProvider>
  );
}
