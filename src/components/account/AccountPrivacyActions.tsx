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
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // GDPR Art. 21 — AI processing opt-out state. We fetch it once on
  // mount so the toggle reflects the persisted value, and PATCH on
  // change. Optimistic UI is intentional — a failed write reverts.
  const [aiOptOut, setAiOptOut] = useState<boolean | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Visual data flywheel (Phase 0) opt-IN. Separate, default-off consent.
  // Optimistic like the AI opt-out; a failed write reverts.
  const [visualOptIn, setVisualOptIn] = useState<boolean | null>(null);
  const [visualSaving, setVisualSaving] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/preferences')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (!cancelled) {
          setAiOptOut(!!data.aiProcessingOptOut);
          setVisualOptIn(!!data.visualDatasetOptIn);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAiOptOut(false);
          setVisualOptIn(false);
        }
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

  const toggleVisualOptIn = async () => {
    if (visualOptIn === null || visualSaving) return;
    const next = !visualOptIn;
    setVisualOptIn(next); // optimistic
    setVisualSaving(true);
    setVisualError(null);
    try {
      const res = await fetch('/api/account/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visualDatasetOptIn: next }),
      });
      if (!res.ok) {
        setVisualOptIn(!next); // revert
        const data = await res.json().catch(() => ({}));
        setVisualError(data.error || `Update failed (HTTP ${res.status})`);
      }
    } catch {
      setVisualOptIn(!next); // revert
      setVisualError('Network error. Try again.');
    } finally {
      setVisualSaving(false);
    }
  };

  const handleExport = async () => {
    // Fetch → blob → download so we can show real progress. The old
    // window.location.href gave ZERO feedback — a user clicked it 5x not
    // knowing it was already working. Now the button shows "Preparing
    // your download…" while the server builds the JSON, then the file
    // downloads.
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) throw new Error(`Export failed (HTTP ${res.status})`);
      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || 'au7o-data-export.json';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Could not prepare your download. Try again.');
    } finally {
      setExporting(false);
    }
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
          background: '#EFEDE6',
          border: '1px solid #E3DFD4',
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

      {/* Visual data flywheel opt-IN — paper well. tone="positive" so the
          toggle renders GREEN when on (opt-IN semantic, the opposite of
          the red AI opt-OUT above). Default off. Copy describes ONLY what
          Phase 0.0 keeps (diagnosis metadata, no photos) so consent is
          accurate; adding stored image crops (Phase 0.1) is a scope change
          that bumps consentVersion and re-prompts. */}
      <div
        className="flex items-center gap-3.5"
        style={{
          padding: '13px 15px',
          background: '#EFEDE6',
          border: '1px solid #E3DFD4',
          borderRadius: 12,
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900">Help improve Au7o&apos;s diagnoses</div>
          <div className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
            Let Au7o keep the details of the diagnoses you run — the part identified plus a privacy-scrubbed summary (license plates, VINs, and location stripped) — to make future diagnoses smarter. No photos are kept. Off by default; turn it off anytime, and deleting your account erases it all.
          </div>
          {visualError && <p className="text-xs text-red-600 mt-1.5">{visualError}</p>}
        </div>
        <label className="flex-shrink-0 inline-flex flex-col items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={visualOptIn === true}
            onChange={toggleVisualOptIn}
            disabled={visualOptIn === null || visualSaving}
            className="sr-only"
          />
          <AcctToggle on={visualOptIn === true} tone="positive" />
          <span
            className="text-[10px] font-bold uppercase"
            style={{
              letterSpacing: '0.04em',
              color: visualOptIn === true ? '#10B981' : '#94A3B8',
            }}
          >
            {visualOptIn === null ? '…' : visualOptIn ? 'SHARING' : 'PRIVATE'}
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
            disabled={exporting}
            aria-busy={exporting}
            className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {exporting && (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
            )}
            {exporting ? 'Preparing your download…' : 'Download my data'}
          </button>
          {exportError && <p className="text-xs text-red-600 mt-2">{exportError}</p>}
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
