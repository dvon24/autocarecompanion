'use client';

import { useState, FormEvent } from 'react';

interface FeedbackFormProps {
  className?: string;
  onSuccess?: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'general';

export function FeedbackForm({ className = '', onSuccess }: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your feedback');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('');
        setEmail('');
        onSuccess?.();
      } else {
        throw new Error('Failed to submit');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to submit feedback. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="font-medium text-green-800">Thanks for your feedback!</p>
        <p className="text-green-600 text-sm mt-1">We appreciate you taking the time to help us improve.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
        >
          Submit more feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of feedback?
        </label>
        <div className="flex gap-2">
          {[
            { value: 'general', label: 'General' },
            { value: 'feature', label: 'Feature Request' },
            { value: 'bug', label: 'Bug Report' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value as FeedbackType)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                type === option.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-1">
          Your feedback
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder={
            type === 'bug'
              ? 'Describe what happened and what you expected...'
              : type === 'feature'
              ? 'Describe the feature you would like to see...'
              : 'Tell us what you think...'
          }
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            status === 'error' && !message.trim() ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-gray-400 font-normal">(optional - for follow-up)</span>
        </label>
        <input
          type="email"
          id="feedback-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !message.trim()}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          status === 'loading' || !message.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Feedback'
        )}
      </button>
    </form>
  );
}
