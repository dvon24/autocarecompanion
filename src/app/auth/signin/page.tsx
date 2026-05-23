'use client';

import { Suspense, useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

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
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      {/* Subtle gradient blobs for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(20%, -30%)',
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <main className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>
        {/* Header */}
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
              href="/subscribe"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Subscribe
            </Link>
          </div>
        </header>

        {/* Sign In Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-center mb-6">
                Sign in to access your garage
              </p>

              <Suspense fallback={<SignInFormLoading />}>
                <SignInForm />
              </Suspense>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Subscribe CTA */}
              <div className="text-center">
                <p className="text-gray-600 mb-3">
                  Don&apos;t have an account?
                </p>
                <Link
                  href="/subscribe"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-center"
                >
                  Subscribe for $9.99/month
                </Link>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center mt-6">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
