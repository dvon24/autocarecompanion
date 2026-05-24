'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  // GDPR Art. 6/7/8 require capturing both before account creation:
  // explicit policy acceptance and confirmation the user meets the
  // age of consent (16 in the EU default).
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords don\'t match.');
      return;
    }
    if (!acceptedPolicies) {
      setError('Please accept the Privacy Policy and Terms to continue.');
      return;
    }
    if (!ageConfirmed) {
      setError('Please confirm you are at least 16 years old.');
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
          acceptedPolicies,
          ageConfirmed,
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
        // Send them to the signin page so they can try manually.
        router.push('/auth/signin');
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Type it again"
          />
        </div>
        {/* GDPR consent gates — both required before the submit
            button enables. Kept as unchecked checkboxes (not
            pre-ticked) per EDPB guidelines on valid consent. */}
        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(e) => setAcceptedPolicies(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              I&apos;ve read and agree to the{' '}
              <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                Terms
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>I confirm I am at least 16 years old.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 8 || password !== confirm || !acceptedPolicies || !ageConfirmed}
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
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(20%, -30%)',
          zIndex: 1,
        }}
      />

      <main className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>
        <header className="px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/og-image.png"
                alt="Au7o mascot"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Au<span className="text-blue-600">7</span>o
              </span>
            </Link>
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Create your account
              </h1>
              <p className="text-gray-500 text-center mb-6">
                Save your vehicle, mileage, and chat history.
              </p>

              <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
                <SignUpForm />
              </Suspense>

              <div className="text-center mt-6">
                <span className="text-gray-500 text-sm">Already have an account? </span>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
