'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { AcctToggle } from './AcctToggle';

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
export default function AccountPrivacyActions({
  email,
  frameless = false,
}: {
  email: string;
  /** When true, skip the outer section/h2 chrome so the caller can
   *  wrap us in an AcctCard. */
  frameless?: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // GDPR Art. 21 — AI processing opt-out state. We fetch it once on
  // mount so the toggle reflects the persisted value, and PATCH on
  // change. Optimistic UI is intentional — a failed write reverts.
  const [aiOptOut, setAiOptOut] = useState<boolean | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/preferences')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (!cancelled) setAiOptOut(!!data.aiProcessingOptOut);
      })
      .catch(() => {
        if (!cancelled) setAiOptOut(false);
      });
    return () => { cancelled = true; };
  }, []);

  const toggleAiOptOut = async () => {
    if (aiOptOut === null || aiSaving) return;
    const next = !aiOptOut;
    setAiOptOut(next); // optimistic
    setAiSaving(true);
    setAiError(null);
    try {
      const res = await fetch('/api/account/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProcessingOptOut: next }),
      });
      if (!res.ok) {
        setAiOptOut(!next); // revert
        const data = await res.json().catch(() => ({}));
        setAiError(data.error || `Update failed (HTTP ${res.status})`);
      }
    } catch {
      setAiOptOut(!next); // revert
      setAiError('Network error. Try again.');
    } finally {
      setAiSaving(false);
    }
  };

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

  const body = (
    <div className="flex flex-col gap-4">
      <p className="text-[12.5px] text-slate-600 leading-relaxed m-0">
        Under GDPR and similar laws, you have the right to a copy of your data
        and the right to have it erased. Both controls below operate on your
        Au7o account (<b className="text-slate-700">{email}</b>). For other
        request types (rectification, restriction, automated-decision
        objection), use the{' '}
        <a
          href="/data-rights"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          data rights form
        </a>
        .
      </p>

      {/* AI processing opt-out — paper well. Uses AcctToggle with
          tone="negative" so the toggle renders RED when the user has
          opted out (matches the prior safety-relevant semantic, NOT
          BMAD's green-when-on default). */}
      <div
        className="flex items-center gap-3.5"
        style={{
          padding: '13px 15px',
          background: '#F1F5F9',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900">AI processing</div>
          <div className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
            Powers chat, repair guides, and parts lookups (Anthropic &amp; OpenAI). Article 21 — right to object. Opting out disables those features until re-enabled.
          </div>
          {aiError && <p className="text-xs text-red-600 mt-1.5">{aiError}</p>}
        </div>
        <label className="flex-shrink-0 inline-flex flex-col items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={aiOptOut === true}
            onChange={toggleAiOptOut}
            disabled={aiOptOut === null || aiSaving}
            className="sr-only"
          />
          <AcctToggle on={aiOptOut === true} tone="negative" />
          <span
            className="text-[10px] font-bold uppercase"
            style={{
              letterSpacing: '0.04em',
              color: aiOptOut === true ? '#DC2626' : '#10B981',
            }}
          >
            {aiOptOut === null ? '…' : aiOptOut ? 'OPTED OUT' : 'ALLOWED'}
          </span>
        </label>
      </div>

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
    </div>
  );

  if (frameless) return body;
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy &amp; Data</h2>
      {body}
    </section>
  );
}
