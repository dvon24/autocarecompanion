'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

/**
 * "Privacy & Data" section on the account page.
 *
 * Two GDPR-required actions:
 *   1. Export — GET /api/account/export downloads a JSON of every row
 *      we have keyed to this user. Browser handles the download via the
 *      Content-Disposition header; we don't need to do anything fancy
 *      client-side beyond navigating to the URL.
 *   2. Delete — DELETE /api/account/delete with a confirmation header,
 *      then signOut() to drop the JWT cookie. We require typing the
 *      literal word DELETE to arm the button so a fat-fingered tap on
 *      mobile doesn't nuke an account.
 */
export default function AccountPrivacyActions({ email }: { email: string }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    // Trigger the browser's download flow. The server response carries
    // Content-Disposition: attachment so this navigates+downloads
    // without leaving the page (for cookie-authenticated GETs).
    window.location.href = '/api/account/export';
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Type DELETE exactly to confirm.');
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'x-confirm-delete': 'true' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Delete failed (HTTP ${res.status})`);
        setDeleting(false);
        return;
      }
      // signOut clears the JWT cookie and redirects to home. The
      // account row is already gone server-side at this point.
      await signOut({ callbackUrl: '/?account=deleted' });
    } catch {
      setError('Network error. Try again.');
      setDeleting(false);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data</h2>
      <p className="text-sm text-gray-600 mb-4">
        Under GDPR and similar laws, you have the right to a copy of your data
        and the right to have it erased. Both controls below operate on your
        Au7o account ({email}).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Export */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Export my data</h3>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Download a JSON file with your profile, garage, chats, diagnoses,
            and parts searches. Article 20 (data portability).
          </p>
          <button
            onClick={handleExport}
            className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Download my data
          </button>
        </div>

        {/* Delete */}
        <div className="rounded-xl border border-red-200 bg-red-50/30 p-5">
          <h3 className="font-semibold text-red-900 mb-1">Delete my account</h3>
          <p className="text-xs text-red-700/80 mb-4 leading-relaxed">
            Permanently erases your account, garage, chats, and reminders.
            This is irreversible. Article 17 (right to erasure).
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-2.5 px-4 bg-white border border-red-300 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete account…
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs text-red-800 font-medium">
                Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError(null);
                }}
                autoFocus
                className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="DELETE"
              />
              {error && (
                <p className="text-xs text-red-700">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText('');
                    setError(null);
                  }}
                  disabled={deleting}
                  className="flex-1 py-2 px-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmText !== 'DELETE'}
                  className="flex-1 py-2 px-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
