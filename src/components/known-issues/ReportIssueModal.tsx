'use client';

import { useState } from 'react';
import { triggerHaptic } from '@/hooks/useHaptic';

interface ReportIssueModalProps {
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  existingIssueId?: string; // If reporting on an existing known issue
  existingIssueTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type Severity = 'high' | 'medium' | 'low';

export function ReportIssueModal({
  vehicleInfo,
  existingIssueId,
  existingIssueTitle,
  onClose,
  onSuccess,
}: ReportIssueModalProps) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [mileage, setMileage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Please describe the issue you experienced.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/known-issues/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: vehicleInfo,
          existingIssueId,
          description: description.trim(),
          severity,
          mileage: mileage ? parseInt(mileage, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      triggerHaptic('success');
      setSuccess(true);
      onSuccess?.();

      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      triggerHaptic('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityOptions: { value: Severity; label: string; description: string }[] = [
    { value: 'high', label: 'Critical', description: 'Safety issue or vehicle undrivable' },
    { value: 'medium', label: 'Moderate', description: 'Noticeable problem, still drivable' },
    { value: 'low', label: 'Minor', description: 'Cosmetic or slight inconvenience' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Report an Issue</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          // Success State
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your report helps other {vehicleInfo.make} {vehicleInfo.model} owners.
            </p>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Reporting for:</p>
              <p className="font-medium text-gray-900">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                {vehicleInfo.trim && ` ${vehicleInfo.trim}`}
              </p>
            </div>

            {/* Existing Issue Reference */}
            {existingIssueTitle && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700">
                  Adding report to: <span className="font-medium">{existingIssueTitle}</span>
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe the Issue *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What symptoms did you experience? When did it start? What did you do to fix it?"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                disabled={isSubmitting}
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <div className="space-y-2">
                {severityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      severity === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={option.value}
                      checked={severity === option.value}
                      onChange={(e) => setSeverity(e.target.value as Severity)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      severity === option.value ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {severity === option.value && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${
                        option.value === 'high' ? 'text-red-700' :
                        option.value === 'medium' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Mileage (optional) */}
            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                Mileage When Issue Occurred <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="number"
                id="mileage"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g., 75000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                disabled={isSubmitting}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Your report is anonymous and helps improve issue detection for all owners.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
