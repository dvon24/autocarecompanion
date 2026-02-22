'use client';

import { useState } from 'react';
import { triggerHaptic } from '@/hooks/useHaptic';
import { IssueFix } from '@/hooks/useIssueFixes';

interface FixIssueModalProps {
  issueId: string;
  issueTitle: string;
  vehicleId: string;
  existingFix?: IssueFix;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FixIssueModal({
  issueId,
  issueTitle,
  vehicleId,
  existingFix,
  onClose,
  onSuccess,
}: FixIssueModalProps) {
  const [status, setStatus] = useState<'fixed' | 'in_progress' | 'wont_fix'>(existingFix?.status || 'fixed');
  const [solution, setSolution] = useState(existingFix?.solution || '');
  const [cost, setCost] = useState(existingFix?.cost?.toString() || '');
  const [difficultyRating, setDifficultyRating] = useState<number | null>(existingFix?.difficultyRating || null);
  const [partsUsed, setPartsUsed] = useState(existingFix?.partsUsed || '');
  const [shopUsed, setShopUsed] = useState(existingFix?.shopUsed || '');
  const [tips, setTips] = useState(existingFix?.tips || '');
  const [wouldRecommend, setWouldRecommend] = useState(existingFix?.wouldRecommend ?? true);
  const [isPublic, setIsPublic] = useState(existingFix?.isPublic ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/issue-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          knownIssueId: issueId,
          status,
          solution: solution || undefined,
          cost: cost ? parseFloat(cost) : undefined,
          difficultyRating: difficultyRating || undefined,
          partsUsed: partsUsed || undefined,
          shopUsed: shopUsed || undefined,
          tips: tips || undefined,
          wouldRecommend,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      triggerHaptic('success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Share Your Experience</h2>
              <p className="text-sm text-gray-500 mt-1">{issueTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-2">
              {[
                { value: 'fixed', label: 'Fixed', icon: '✓' },
                { value: 'in_progress', label: 'Working on it', icon: '⏳' },
                { value: 'wont_fix', label: 'Living with it', icon: '🤷' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value as typeof status)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    status === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span> {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Solution - show if fixed */}
          {status === 'fixed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you fix it? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Describe what you did to fix this issue..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setDifficultyRating(difficultyRating === rating ? null : rating)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          difficultyRating === rating
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">1 = Easy, 5 = Hard</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parts used <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  placeholder="e.g., OEM oil filter, Mobil 1 5W-30..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop used <span className="text-gray-400 font-normal">(if done professionally)</span>
                </label>
                <input
                  type="text"
                  value={shopUsed}
                  onChange={(e) => setShopUsed(e.target.value)}
                  placeholder="e.g., Local Toyota dealer, DIY..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          {/* Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tips for others <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="Any advice for others dealing with this issue?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Recommend */}
          {status === 'fixed' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="wouldRecommend"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="wouldRecommend" className="text-sm text-gray-700">
                I would recommend this fix to others
              </label>
            </div>
          )}

          {/* Share publicly */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Share with the community to help other owners
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
