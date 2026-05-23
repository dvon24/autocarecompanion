'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif]">
      <header className="px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Reset your password
            </h1>
            <p className="text-gray-500 text-center mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {submitted ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  If <span className="font-semibold">{email}</span> matches an account,
                  we&apos;ve sent a reset link. Check your inbox (and spam folder).
                </p>
                <p className="text-sm text-gray-500">
                  The link expires in 60 minutes.
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  &larr; Back to sign in
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
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
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                </form>
                <div className="text-center mt-6">
                  <Link href="/auth/signin" className="text-gray-500 hover:text-gray-700 text-sm">
                    &larr; Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
