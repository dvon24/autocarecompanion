'use client';

import { useRef, useState } from 'react';

type Preview = { html: string; subject: string; to: string; trialDays: number; expectedUpdatedAt: string; canSend: boolean };
export function TwinInvitationPreview({ id, expectedUpdatedAt, invitedAt }: { id: string; expectedUpdatedAt: string; invitedAt: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(!!invitedAt);
  const [uncertain, setUncertain] = useState(false);
  async function perform(action: 'preview' | 'send') {
    if (busy || sent || uncertain) return;
    if (action === 'preview') { setPreview(null); dialog.current?.showModal(); }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/reservations/invitation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        id, expectedUpdatedAt: preview?.expectedUpdatedAt ?? expectedUpdatedAt, action, ...(action === 'send' ? { confirm: true } : {}),
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Invitation unavailable');
      if (action === 'preview') setPreview(result);
      else setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invitation unavailable');
      if (action === 'send') setUncertain(true);
    } finally { setBusy(false); }
  }
  return <div className="mt-2 whitespace-normal">
    <button type="button" className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 disabled:text-gray-500" onClick={() => perform('preview')} disabled={busy || sent || uncertain}>{sent ? 'Invitation sent' : uncertain ? 'Check delivery status' : 'Preview invitation'}</button>
    <dialog ref={dialog} aria-label="Vehicle-ready invitation preview" onCancel={event => { if (busy) event.preventDefault(); }} className="m-auto w-[min(94vw,760px)] max-h-[90dvh] rounded-2xl border border-[#E4DED0] bg-[#FAF7F0] p-0 text-[#0B1220] backdrop:bg-black/50">
      <div className="flex items-start justify-between gap-3 border-b border-[#E4DED0] p-4"><div className="min-w-0 flex-1"><h2 className="text-lg font-bold">Vehicle-ready invitation</h2>{preview && <p className="mt-1 break-words text-sm"><span className="block break-all">To: {preview.to}</span><span className="block">{preview.trialDays} days complimentary</span></p>}</div><button type="button" onClick={() => dialog.current?.close()} disabled={busy} aria-label="Close invitation preview" className="shrink-0 rounded-lg border px-3 py-2">Close</button></div>
      {busy && !preview && <p role="status" className="p-4">Checking the saved offer…</p>}
      {preview && <><p className="px-4 pt-3 text-sm font-semibold">{preview.subject}</p><iframe title="Rendered vehicle-ready email" sandbox="" srcDoc={preview.html} className="my-3 h-[52dvh] w-full border-0" />
        <p className="px-4 text-sm">This invitation does not start billing or the trial clock. Access begins when the verified recipient activates their vehicle.</p></>}
      {error && <p role="alert" className="p-4 text-sm text-red-700">{error}{uncertain && ' Do not resend. Reconcile delivery before trying again.'}</p>}
      {sent ? <p role="status" className="p-4 text-sm text-green-700">Invitation sent. Refresh the reservation queue before editing this offer.</p> : preview && <div className="p-4"><button type="button" disabled={!preview.canSend || busy || uncertain} onClick={() => perform('send')} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send this invitation'}</button>{!preview.canSend && <p className="mt-2 text-xs text-slate-600">Preview only. Customer emails are on hold in this environment.</p>}</div>}
    </dialog>
  </div>;
}
