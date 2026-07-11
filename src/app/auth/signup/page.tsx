'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AuthValueColumn } from '@/components/auth/AuthValueColumn';

/**
 * Banner rendered above the signup form when the user came from the
 * /diagnose flow ("Save & open chat"). Reads the sessionStorage
 * snapshot to remind the user what they're saving — without this,
 * the diagnosis result vanishes when /diagnose unmounts, the value
 * prop of completing signup fades, and conversion tanks.
 *
 * Pure client-side — no PII / diagnosis content reaches the server
 * until the post-signup /diagnose/claim POST.
 */
function DiagnoseClaimBanner() {
  const [info, setInfo] = useState<{ vehicle: string; primaryPart: string | null } | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('au7o.diagSnapshot');
      if (!raw) return;
      const snap = JSON.parse(raw) as {
        year?: number;
        make?: string;
        model?: string;
        trim?: string;
        visionResult?: { primaryPartId?: string | null; identifiedParts?: Array<{ id: string; name: string }> };
      };
      if (!snap.year || !snap.make || !snap.model) return;
      const vehicle = `${snap.year} ${snap.make} ${snap.model}${snap.trim ? ' ' + snap.trim : ''}`;
      const parts = snap.visionResult?.identifiedParts || [];
      const primary = snap.visionResult?.primaryPartId
        ? parts.find((p) => p.id === snap.visionResult!.primaryPartId)?.name ?? null
        : parts[0]?.name ?? null;
      setInfo({ vehicle, primaryPart: primary });
    } catch {
      /* corrupted snapshot → just don't render the banner */
    }
  }, []);
  if (!info) return null;
  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <div className="text-sm leading-snug">
        <div className="font-semibold text-gray-900">
          {info.primaryPart
            ? `Finishing up: saving your ${info.primaryPart.toLowerCase()} diagnosis`
            : 'Finishing up: saving your diagnosis'}
        </div>
        <div className="text-gray-600 mt-0.5">
          We&apos;ll attach it to your <strong>{info.vehicle}</strong> right after you create your account.
        </div>
      </div>
    </div>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  // ONE consent line covers both required affirmations (Terms/Privacy acceptance
  // AND 16+). Combining into a single checkbox cut signup friction that was
  // killing conversion; the API still records both flags. Dropped confirm-
  // password entirely (pure friction on a fast signup).
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!consented) {
      setError('Please confirm you agree to the Terms & Privacy Policy and are 16+.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Create the account.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          acceptedPolicies: consented,
          ageConfirmed: consented,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Couldn\'t create your account. Try again.');
        return;
      }

      // Auto sign-in so the user lands logged in.
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Edge case: account was created but auto-signin failed.
        // Preserve the callbackUrl so /auth/signin can route them
        // forward (e.g. /diagnose/claim) once they sign in manually.
        // Dropping callbackUrl here was a documented gap during the
        // diagnose-to-chat handoff design.
        router.push('/auth/signin?callbackUrl=' + encodeURIComponent(callbackUrl));
        return;
      }

      // First-time signups land in onboarding. The /onboarding page is
      // idempotent — if the user came from a deep-link with a real
      // callbackUrl (rare, e.g. paste-into-browser from a marketing
      // link), we honor that and skip onboarding. Otherwise everyone
      // goes through the three-step flow before reaching the hub.
      const goingDeep = callbackUrl && callbackUrl !== '/' && callbackUrl !== '/garage' && !callbackUrl.startsWith('/auth');
      const target = goingDeep ? callbackUrl : '/onboarding';
      window.location.href = target;
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {callbackUrl.startsWith('/diagnose/claim') && <DiagnoseClaimBanner />}

      {/* One-tap Google — the lowest-friction path, up top. Dark until
          NEXT_PUBLIC_GOOGLE_AUTH=1 + the OAuth creds are set. */}
      <GoogleSignInButton callbackUrl={callbackUrl} />
      {process.env.NEXT_PUBLIC_GOOGLE_AUTH === '1' && (
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-500">or sign up with email</span></div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Devon"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="At least 8 characters"
          />
        </div>
        {/* ONE consent line — Terms/Privacy acceptance + 16+ in a single
            affirmative action. Unchecked by default (valid-consent guideline);
            drives both API flags. This replaced two separate checkboxes +
            confirm-password that were killing signup conversion. */}
        <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I&apos;m 16+ and agree to the{' '}
            <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Terms</Link>
            {' '}&amp;{' '}
            <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</Link>.
          </span>
        </label>

        {(() => {
          const blockers: string[] = [];
          if (password.length > 0 && password.length < 8) blockers.push('password needs 8+ characters');
          if (!consented) blockers.push('check the box below to agree');
          if (blockers.length === 0) return null;
          return (
            <p className="text-xs text-gray-500 -mt-2">Almost there — {blockers.join(' · ')}.</p>
          );
        })()}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
        Free account — saves your garage, mileage, and chat history.
        Premium features (SMS reminders, cross-device sync, push alerts) are
        layered on top via <Link href="/subscribe" className="text-blue-600 hover:text-blue-700 underline">subscription</Link>.
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif]">
      {/* Signup-first split (design/"Au7o - Signup Redesign"): value + live
          demo on the left proves it before the ask; the account form is on
          the right. Sign-in is demoted to a small link. On mobile the value
          column caps the top and the form sits below. */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* LEFT — value + live hub demo */}
        <AuthValueColumn
          headline={<>Knows your car.</>}
          sub={<>A mechanic tuned to your exact year, make, model &amp; trim — it tracks maintenance &amp; recalls, diagnoses a problem from a photo, and finds the exact part. Free to start.</>}
        />

        {/* RIGHT — the ask */}
        <div className="relative flex flex-col px-5 py-6 sm:px-8">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/og-image.png" alt="Au7o mascot" width={30} height={30} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Au<span className="text-blue-600">7</span>o
              </span>
            </Link>
            <Link href="/auth/signin" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-md">
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-1.5">
                Create your free account
              </h1>
              <p className="text-gray-500 mb-6 text-sm">
                Free forever — your car, your diagnoses, your alerts. Takes about 20 seconds.
              </p>

              <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
                <SignUpForm />
              </Suspense>

              {/* Plus nudge — free is intentionally complete; Plus is the layer on top. */}
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-gray-600 leading-relaxed">
                Want SMS reminders, cross-device sync, and push alerts?{' '}
                <Link href="/subscribe" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Au7o Plus
                </Link>{' '}
                layers on top — start free, upgrade anytime.
              </div>

              <div className="text-center mt-6">
                <span className="text-gray-500 text-sm">Already have an account? </span>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
