'use client';

import { Suspense, useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AuthValueColumn } from '@/components/auth/AuthValueColumn';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/garage';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage('Invalid email or password');
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, callbackUrl]);

  return (
    <>
      {/* One-tap Google, up top (dark until NEXT_PUBLIC_GOOGLE_AUTH=1 + creds). */}
      <GoogleSignInButton callbackUrl={callbackUrl} />
      {process.env.NEXT_PUBLIC_GOOGLE_AUTH === '1' && (
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-500">or with email</span></div>
        </div>
      )}

      {/* Error Messages */}
      {(urlError || errorMessage) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {errorMessage || 'An error occurred during sign in'}
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </>
  );
}

function SignInFormLoading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-4 w-12 bg-gray-200 rounded mb-1" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
      <div className="animate-pulse">
        <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
      <div className="animate-pulse">
        <div className="h-12 bg-gray-300 rounded-xl" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif]">
      {/* Same split as signup (design/"Au7o - Signup Redesign"): value + live
          demo left, the sign-in ask on the right. Returning users still see
          why the account matters; new visitors get pushed to create one. */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* LEFT — value + live hub demo */}
        <AuthValueColumn
          eyebrow="WELCOME BACK"
          headline={<>Your garage, right where you left it.</>}
          sub={<>Sign in for your saved vehicles, diagnoses, and chat history — plus every new recall and known issue we&apos;ve found for your car since you were last here.</>}
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
            <Link href="/subscribe" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Subscribe
            </Link>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-md">
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-1.5">
                Welcome back
              </h1>
              <p className="text-gray-500 mb-6 text-sm">
                Sign in to access your garage.
              </p>

              <Suspense fallback={<SignInFormLoading />}>
                <SignInForm />
              </Suspense>

              <p className="text-xs text-gray-400 text-center mt-6">
                Authorized owner access only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
