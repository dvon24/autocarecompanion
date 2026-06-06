'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import {
  type OnboardingStep,
  ONBOARDING_TOTAL_STEPS,
  nextStep,
  ONBOARDING_DESTINATIONS,
} from '@/lib/onboarding/state';

/**
 * Mobile-first onboarding flow. Three steps:
 *   1. Welcome — mascot + value prop + "Get started"
 *   2. How it works — 3-row explanation of photo → match → fix
 *   3. Add your car — add-vehicle OR scan-plate OR skip
 *
 * Above 900px, the flow centers in a max-width card with a dimmed
 * backdrop, matching the desktop modal feel from the BMAD handoff
 * without forking the codebase.
 *
 * All "skip" / "just browse" actions stamp onboardingCompletedAt and
 * route to /known-issues so the user gets immediate utility instead
 * of bouncing.
 */
export function OnboardingClient({
  step: initialStep,
  userName,
  hasVehicle,
}: {
  step: OnboardingStep;
  userName: string;
  hasVehicle: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [pending, startTransition] = useTransition();

  const goToStep = useCallback((s: OnboardingStep) => {
    setStep(s);
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(s));
    router.replace(`/onboarding?${params.toString()}`);
  }, [router, searchParams]);

  const persistComplete = useCallback(async () => {
    try {
      await fetch('/api/user/onboarding', { method: 'POST' });
    } catch {
      /* swallow — onboarding completion is best-effort persistence */
    }
  }, []);

  const finishToBrowse = useCallback(() => {
    startTransition(async () => {
      await persistComplete();
      router.push(ONBOARDING_DESTINATIONS.justBrowse);
    });
  }, [persistComplete, router]);

  const finishToGarage = useCallback(() => {
    startTransition(async () => {
      await persistComplete();
      router.push(ONBOARDING_DESTINATIONS.finishedNoVehicle);
    });
  }, [persistComplete, router]);

  const advance = useCallback(() => {
    const next = nextStep(step);
    if (next === step) return;
    goToStep(next);
  }, [step, goToStep]);

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-head">
          <div className="ob-progress" aria-label={`Step ${step} of ${ONBOARDING_TOTAL_STEPS}`}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`ob-dot ${i === step ? 'ob-dot-active' : i < step ? 'ob-dot-done' : ''}`}
                aria-hidden
              />
            ))}
          </div>
          {step < 3 && (
            <button
              type="button"
              className="ob-skip"
              onClick={finishToBrowse}
              disabled={pending}
            >
              Skip
            </button>
          )}
        </div>

        <div className="ob-body">
          {step === 1 && <Welcome userName={userName} onNext={advance} pending={pending} />}
          {step === 2 && <HowItWorks onNext={advance} pending={pending} />}
          {step === 3 && <AddCar hasVehicle={hasVehicle} onFinishBrowse={finishToBrowse} onFinishGarage={finishToGarage} pending={pending} />}
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

function Welcome({ userName, onNext, pending }: { userName: string; onNext: () => void; pending: boolean }) {
  return (
    <>
      <div className="ob-content">
        <div className="ob-hero-icon">
          <Image src="/og-image.png" alt="" width={62} height={62} className="ob-mascot" />
        </div>
        <h1 className="ob-title">Meet Au7o — your<br />car&apos;s co-pilot.</h1>
        <p className="ob-subtitle">
          {userName ? `Welcome, ${userName}. ` : ''}
          Diagnose problems from a photo, browse known issues for your exact car,
          and stay ahead of maintenance.
        </p>
      </div>
      <div className="ob-foot">
        <button type="button" className="ob-btn ob-btn-primary" onClick={onNext} disabled={pending}>
          Get started
        </button>
      </div>
    </>
  );
}

function HowItWorks({ onNext, pending }: { onNext: () => void; pending: boolean }) {
  const steps = [
    { icon: 'camera' as const, title: 'Show it the problem', body: 'Snap a photo or video — a leak, worn tread, a strange part.' },
    { icon: 'search' as const, title: 'Au7o matches it', body: 'Cross-referenced against 4,000+ documented issues for your trim.' },
    { icon: 'settings' as const, title: 'Get the part & fix', body: 'The exact OEM part, the cost, and how to do it — or book a shop.' },
  ];
  return (
    <>
      <div className="ob-content">
        <div className="ob-eyebrow">HOW IT WORKS</div>
        <h1 className="ob-title">Don&apos;t know the part?<br />Just show it.</h1>
        <div className="ob-rows">
          {steps.map((s, i) => (
            <div key={i} className="ob-row">
              <span className="ob-row-icon" aria-hidden>
                <Icon name={s.icon} size={20} />
                <span className="ob-row-num">{i + 1}</span>
              </span>
              <div>
                <div className="ob-row-title">{s.title}</div>
                <div className="ob-row-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ob-foot">
        <button type="button" className="ob-btn ob-btn-primary" onClick={onNext} disabled={pending}>
          Next
        </button>
      </div>
    </>
  );
}

function AddCar({ hasVehicle, onFinishBrowse, onFinishGarage, pending }: { hasVehicle: boolean; onFinishBrowse: () => void; onFinishGarage: () => void; pending: boolean }) {
  // The actual "Add my vehicle" flow lives on /garage (existing
  // AddVehicleModal). We stamp completion and route there. If the
  // user already has a vehicle, the button text reflects that and
  // routes them straight into their hub via /garage.
  return (
    <>
      <div className="ob-content">
        <div className="ob-add-icon">
          <Icon name="car" size={26} style={{ color: '#fff' }} />
        </div>
        <h1 className="ob-title">
          {hasVehicle ? 'Your car is already saved.' : 'Add your car to\nget started.'}
        </h1>
        <p className="ob-subtitle">
          We&apos;ll tailor every diagnosis, issue, and maintenance tip to your exact vehicle.
        </p>
        <div className="ob-add-actions">
          <button type="button" className="ob-btn ob-btn-blue" onClick={onFinishGarage} disabled={pending}>
            <Icon name="plus" size={15} /> {hasVehicle ? 'Open my garage' : 'Add my vehicle'}
          </button>
          <button type="button" className="ob-btn ob-btn-ghost" onClick={onFinishBrowse} disabled={pending}>
            <Icon name="camera" size={15} style={{ color: 'var(--au7o-blue, #3B82F6)' }} /> Just browse known issues
          </button>
        </div>
      </div>
    </>
  );
}

const styles = `
  .ob-shell {
    min-height: 100dvh; min-height: 100vh;
    background: #FAF8F2;
    display: flex; align-items: stretch; justify-content: center;
    color: #0B1220;
    font-family: var(--font-geist-sans, system-ui, sans-serif);
  }
  .ob-card {
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    background: #FAF8F2;
  }
  @media (min-width: 900px) {
    .ob-shell { background: rgba(11,18,32,0.5); align-items: center; padding: 40px 20px; }
    .ob-card {
      max-width: 620px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.25);
      max-height: 90vh;
      overflow: hidden;
    }
  }
  .ob-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px 8px; }
  .ob-progress { display: flex; gap: 6px; }
  .ob-dot {
    width: 8px; height: 8px; border-radius: 999px;
    background: #E3DFD4; transition: width 220ms ease, background 220ms ease;
  }
  .ob-dot-done { background: #3B82F6; }
  .ob-dot-active { width: 22px; background: #3B82F6; }
  .ob-skip {
    background: transparent; border: 0; color: #64748B;
    font-size: 12.5px; font-weight: 500; cursor: pointer;
  }
  .ob-skip:hover { color: #0B1220; }
  .ob-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .ob-content {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 24px 28px;
    justify-content: center;
  }
  .ob-hero-icon, .ob-add-icon {
    width: 100px; height: 100px; border-radius: 28px;
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 26px;
  }
  .ob-hero-icon { background: rgba(59,130,246,0.10); }
  .ob-add-icon { background: #0B1220; width: 56px; height: 56px; border-radius: 16px; margin-bottom: 18px; }
  .ob-mascot { width: 62px; height: 62px; border-radius: 12px; }
  .ob-title {
    font-size: 28px; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em;
    margin: 0; white-space: pre-line;
  }
  .ob-subtitle {
    font-size: 15px; color: #475569; line-height: 1.55;
    margin: 14px 0 0; max-width: 360px;
  }
  .ob-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    color: #3B82F6; margin-bottom: 10px; text-transform: uppercase;
  }
  .ob-rows { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 380px; margin-top: 20px; text-align: left; }
  .ob-row { display: flex; gap: 14px; align-items: flex-start; }
  .ob-row-icon {
    position: relative;
    width: 44px; height: 44px; border-radius: 13px;
    background: rgba(59,130,246,0.10);
    color: #3B82F6;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ob-row-num {
    position: absolute; top: -6px; right: -6px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #0B1220; color: #fff; font-size: 9px; font-weight: 700;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: 'SF Mono', Menlo, monospace;
  }
  .ob-row-title { font-size: 15.5px; font-weight: 600; letter-spacing: -0.01em; }
  .ob-row-body { font-size: 13px; color: #475569; line-height: 1.45; margin-top: 2px; }
  .ob-foot { padding: 14px 28px 28px; }
  .ob-add-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 360px; margin-top: 22px; }
  .ob-btn {
    width: 100%; padding: 15px 0; border-radius: 13px;
    font-size: 15px; font-weight: 600; cursor: pointer; border: 0;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: inherit;
    transition: background 120ms ease, color 120ms ease;
  }
  .ob-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ob-btn-primary { background: #0B1220; color: #fff; }
  .ob-btn-primary:hover { background: #1E293B; }
  .ob-btn-blue { background: #3B82F6; color: #fff; }
  .ob-btn-blue:hover { background: #2563EB; }
  .ob-btn-ghost { background: #fff; color: #0B1220; border: 1px solid #E3DFD4; }
  .ob-btn-ghost:hover { background: #F8FAFC; }
`;
