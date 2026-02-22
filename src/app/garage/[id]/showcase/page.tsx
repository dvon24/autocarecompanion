'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ShowcaseSettings {
  id: string;
  isPublic: boolean;
  showcaseSlug: string | null;
  nickname: string | null;
  year: number;
  make: string;
  model: string;
}

export default function ShowcaseSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [settings, setSettings] = useState<ShowcaseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [isPublic, setIsPublic] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [resolvedParams.id]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/vehicles/${resolvedParams.id}/showcase`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/subscribe');
          return;
        }
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data.settings);
      setIsPublic(data.settings.isPublic);
      setCustomSlug(data.settings.showcaseSlug || '');
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = (slug: string): boolean => {
    if (!slug) {
      setSlugError(null);
      return true;
    }
    if (slug.length < 3) {
      setSlugError('URL must be at least 3 characters');
      return false;
    }
    if (slug.length > 50) {
      setSlugError('URL must be at most 50 characters');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError('URL can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    setSlugError(null);
    return true;
  };

  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setCustomSlug(cleaned);
    validateSlug(cleaned);
  };

  const handleSave = async () => {
    if (!validateSlug(customSlug)) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/vehicles/${resolvedParams.id}/showcase`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublic,
          showcaseSlug: customSlug || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle not found</h1>
          <Link href="/garage" className="text-blue-600 hover:text-blue-700">
            Back to Garage
          </Link>
        </div>
      </div>
    );
  }

  const displayName = settings.nickname || `${settings.year} ${settings.make} ${settings.model}`;
  const previewUrl = customSlug || settings.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/garage/${resolvedParams.id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Vehicle
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Showcase Settings</h1>
        <p className="text-gray-600 mb-8">{displayName}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
          {/* Public Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Make Build Public</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Share your build with the Au7o community
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  isPublic ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isPublic && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Your build will be visible to everyone</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>Your display name will be shown</li>
                      <li>Vehicle details and modifications will be public</li>
                      <li>Anyone can share the link to your build</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom URL */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Custom URL (optional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">/builds/</span>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder={settings.id}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  slugError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {slugError && (
              <p className="text-sm text-red-600 mt-1">{slugError}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Preview: <span className="font-mono text-gray-700">/builds/{previewUrl}</span>
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Settings saved successfully!
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isPublic && (
              <Link
                href={`/builds/${previewUrl}`}
                target="_blank"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Preview Build Page
              </Link>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !!slugError}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Add Modifications CTA */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Want to show off your mods?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Add modifications to your vehicle to display them on your showcase page.
          </p>
          <Link
            href={`/garage/${resolvedParams.id}?tab=mods`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Manage Modifications
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
