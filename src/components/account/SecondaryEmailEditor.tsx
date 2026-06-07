'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * Inline editor for the optional secondary contact email.
 *
 * The User.email field is the immutable login identity (NextAuth
 * credentials provider matches on it). This control edits
 * secondaryEmail — a soft contact slot for receipts, business contact
 * display, etc. Cleared by submitting an empty value.
 *
 * `frameless` skips the outer card chrome so the redesigned /account
 * page can wrap us in an AcctCard.
 */
export default function SecondaryEmailEditor({
  loginEmail,
  initialSecondary,
  frameless = false,
}: {
  loginEmail: string;
  initialSecondary: string | null;
  frameless?: boolean;
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

  const body = (
    <div className="flex flex-col gap-3">
      <p className="text-[12.5px] text-slate-600 leading-relaxed m-0">
        Your login email can&apos;t be changed here. Add a secondary email for receipts and contact.
      </p>

      <div>
        <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          LOGIN
        </div>
        <div
          className="flex items-center gap-2.5"
          style={{
            padding: '11px 13px',
            background: '#EFEDE6',
            border: '1px solid #E3DFD4',
            borderRadius: 10,
          }}
        >
          <span className="text-slate-500 flex-shrink-0">
            <Icon name="user" size={13} />
          </span>
          <span className="flex-1 text-[13px] text-slate-900 truncate">{loginEmail}</span>
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 flex-shrink-0">
            Read-only
          </span>
        </div>
      </div>

      <div>
        <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          SECONDARY (CONTACT)
        </div>
        <div
          className="flex items-center gap-2.5"
          style={{
            padding: '11px 13px',
            background: '#fff',
            border: '1px solid #E3DFD4',
            borderRadius: 10,
          }}
        >
          <span className="text-slate-500 flex-shrink-0">
            <Icon name="chat" size={13} />
          </span>
          {editing ? (
            <>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="business@example.com"
                className="flex-1 text-[13px] text-slate-900 placeholder-slate-400 outline-none bg-transparent min-w-0"
                autoFocus
              />
              <button
                onClick={submit}
                disabled={pending || !dirty}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setValue(saved ?? '');
                  setEditing(false);
                  setError(null);
                }}
                disabled={pending}
                className="text-xs font-medium px-2 py-1.5 rounded-md text-slate-600 hover:text-slate-900 flex-shrink-0"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 text-[13px] text-slate-900 truncate">
                {saved ? saved : <span className="text-slate-400">Not set</span>}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-[11.5px] font-semibold text-blue-600 hover:text-blue-700 ml-1 flex-shrink-0 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                style={{ padding: '4px 10px' }}
              >
                {saved ? 'Change' : 'Add'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );

  if (frameless) return body;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">Account emails</h3>
      </div>
      {body}
    </div>
  );
}
