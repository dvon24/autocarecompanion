'use client';

import { useState } from 'react';

/**
 * Inline editor for the optional secondary contact email.
 *
 * The User.email field is the immutable login identity (NextAuth
 * credentials provider matches on it). This control edits
 * secondaryEmail — a soft contact slot for receipts, business contact
 * display, etc. Cleared by submitting an empty value.
 */
export default function SecondaryEmailEditor({
  loginEmail,
  initialSecondary,
}: {
  loginEmail: string;
  initialSecondary: string | null;
}) {
  const [value, setValue] = useState(initialSecondary ?? '');
  const [saved, setSaved] = useState(initialSecondary ?? '');
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = value.trim() !== (saved ?? '');

  const submit = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/user/secondary-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || data.error || 'Could not save.');
        return;
      }
      setSaved(data.secondaryEmail ?? '');
      setValue(data.secondaryEmail ?? '');
      setEditing(false);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">Account emails</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Your login email can&apos;t be changed here. Add a secondary email for receipts and contact.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Login</div>
            <div className="text-sm font-medium text-gray-900 truncate">{loginEmail}</div>
          </div>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Read-only</span>
        </div>

        <div className="rounded-lg border border-gray-200 px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Secondary (contact)
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="business@example.com"
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                autoFocus
              />
              <button
                onClick={submit}
                disabled={pending || !dirty}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setValue(saved ?? ''); setEditing(false); setError(null); }}
                disabled={pending}
                className="text-xs font-medium px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-900 truncate">
                {saved ? saved : <span className="text-gray-400">Not set</span>}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-3"
              >
                {saved ? 'Change' : 'Add'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
    </div>
  );
}
