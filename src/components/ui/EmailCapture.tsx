'use client';

import { useState, FormEvent } from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

interface EmailCaptureProps {
  className?: string;
}

export function EmailCapture({ className = '' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage("You're on the list! We'll notify you about new features.");
        setEmail('');
        trackEvent('email_signup', { source: 'landing_page' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch {
      // Fallback to localStorage if API fails
      try {
        const existing = localStorage.getItem('au7o-interest-emails') || '[]';
        const emails = JSON.parse(existing);
        if (!emails.includes(email)) {
          emails.push(email);
          localStorage.setItem('au7o-interest-emails', JSON.stringify(emails));
        }
        setStatus('success');
        setMessage("Thanks for your interest! We'll keep you updated.");
        setEmail('');
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center justify-center gap-2 text-green-600 ${className}`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="flex-1 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Enter your email"
          className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            status === 'error' ? 'border-red-300' : 'border-gray-200'
          }`}
          disabled={status === 'loading'}
        />
        {status === 'error' && (
          <p className="absolute -bottom-6 left-0 text-sm text-red-500">{message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Joining...
          </>
        ) : (
          <>
            Get Updates
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
