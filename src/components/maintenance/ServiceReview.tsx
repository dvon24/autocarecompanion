'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MAINTENANCE_SCHEDULES, isLoggableMaintenanceType } from '@/lib/maintenance';
import { ServiceReviewSchema, type ServiceReviewInput } from '@/lib/maintenance-service-review';
import type { ReceiptExtraction } from '@/lib/maintenance-receipt-extraction';
import { maintenanceDocumentError, MAINTENANCE_DOCUMENT_LIMIT_LABEL } from '@/lib/maintenance-document';

type SavedRecord = { id: string; vehicleId: string; type: string; mileage: number; date: string; nextDueMileage?: number | null; nextDueDate?: string | null };
type Props = {
  vehicleId: string; vehicleLabel?: string; currentMileage?: number | null;
  service?: { typeId: string; label: string }; initialFile?: File | null;
  uploadFirst?: boolean;
  onSaved?: (records: SavedRecord[]) => void; onCancel?: () => void;
};
const field: CSSProperties = { display: 'block', width: '100%', minWidth: 0, minHeight: 42, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#0b1220', font: 'inherit', boxSizing: 'border-box' };
const button: CSSProperties = { minHeight: 42, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#0b1220', font: 'inherit', cursor: 'pointer' };
const services = [
  ...Object.entries(MAINTENANCE_SCHEDULES).filter(([type]) => isLoggableMaintenanceType(type)).map(([type, schedule]) => ({ type, name: schedule.name })),
  { type: 'transmission_fluid_auto', name: 'Automatic transmission fluid' },
  { type: 'transmission_fluid_manual', name: 'Manual transmission fluid' },
];
type ServiceAttempt = { body: ServiceReviewInput; file: File | null; completed?: SavedRecord[]; removed?: boolean };
// A breakpoint can remount the entire detail branch without user navigation.
// Keep unresolved identities and private File objects in tab memory, not storage.
const pendingReviews = new Map<string, ServiceAttempt>();

/** All entry points mount this vehicle-keyed review; OCR is never a write. */
export function ServiceReview(props: Props) {
  return <ReviewDraft key={props.vehicleId + ':' + (props.service?.typeId || 'all')} {...props} />;
}
function ReviewDraft({ vehicleId, vehicleLabel, currentMileage, service, initialFile, uploadFirst = false, onSaved, onCancel }: Props) {
  const [restored] = useState(() => pendingReviews.get(vehicleId));
  const [date, setDate] = useState(restored?.body.date || '');
  const [mileage, setMileage] = useState(restored ? String(restored.body.mileage) : '');
  const [cost, setCost] = useState(restored?.body.cost == null ? '' : String(restored.body.cost));
  const [shop, setShop] = useState(restored?.body.shopName || '');
  const [notes, setNotes] = useState(restored?.body.notes || '');
  const [jobs, setJobs] = useState(restored?.body.jobs || [{ type: service?.typeId || '', description: service?.label || '' }]);
  const [file, setFile] = useState<File | null>(restored?.file || initialFile || null);
  const [detailsVisible, setDetailsVisible] = useState(!uploadFirst || Boolean(restored));
  const [preview, setPreview] = useState('');
  const [consent, setConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(Boolean(restored));
  const [extracted, setExtracted] = useState<ReceiptExtraction | null>(null);
  const [vehicleResolved, setVehicleResolved] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<'extract' | 'save' | null>(null);
  const [ambiguous, setAmbiguous] = useState(Boolean(restored && !restored.completed && !restored.removed));
  const [removedAfterSave, setRemovedAfterSave] = useState(Boolean(restored?.removed));
  const [saved, setSaved] = useState<SavedRecord[] | null>(restored?.completed || null);
  const active = useRef(true);
  const reviewElement = useRef<HTMLElement | null>(null);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const attempt = useRef<ServiceAttempt | null>(restored || null);
  const forgetAttempt = () => {
    if (pendingReviews.get(vehicleId)?.body.requestId === attempt.current?.body.requestId) pendingReviews.delete(vehicleId);
  };
  const locked = Boolean(pending || ambiguous);
  const today = new Date().toLocaleDateString('en-CA');
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => {
    if (restored && (restored.completed || restored.removed) && pendingReviews.get(vehicleId) === restored) {
      pendingReviews.delete(vehicleId);
      if (restored.completed) onSaved?.(restored.completed);
    }
  }, [restored, vehicleId, onSaved]);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!pending && !ambiguous) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    // Inline node reviews have parent drawer/tree close controls. Keep their
    // transaction identity mounted until an uncertain save is reconciled.
    const protectReview = (event: Event) => {
      const keyboard = event instanceof KeyboardEvent;
      if ((keyboard && event.key === 'Escape') || (!keyboard && event.target instanceof Node && !reviewElement.current?.contains(event.target))) {
        event.preventDefault(); event.stopImmediatePropagation();
        setError('Finish or recheck this service review before closing or changing vehicles.');
      }
    };
    window.addEventListener('beforeunload', prevent);
    window.addEventListener('keydown', protectReview, true);
    window.addEventListener('pointerdown', protectReview, true);
    window.addEventListener('click', protectReview, true);
    return () => { window.removeEventListener('beforeunload', prevent); window.removeEventListener('keydown', protectReview, true); window.removeEventListener('pointerdown', protectReview, true); window.removeEventListener('click', protectReview, true); };
  }, [pending, ambiguous]);
  const chooseFile = (next: File | null) => {
    const validation = next && maintenanceDocumentError(next);
    if (validation) { setError(validation); return; }
    setError(''); setConfirmed(false); setExtracted(null); setVehicleResolved(false);
    setFile(next); setConsent(false);
    if (uploadFirst) setDetailsVisible(false);
  };
  const extract = async () => {
    if (!file || !consent || busy.current) return;
    busy.current = true; setPending('extract'); setError('');
    controller.current = new AbortController();
    try {
      const form = new FormData(); form.set('vehicleId', vehicleId); form.set('file', file); form.set('consent', 'true');
      const response = await fetch('/api/maintenance/receipts/extract', { method: 'POST', body: form, signal: AbortSignal.any([controller.current.signal, AbortSignal.timeout(30_000)]) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Receipt extraction is unavailable.');
      if (payload.vehicleId !== vehicleId || !payload.draft) throw new Error('The receipt draft belongs to a different vehicle.');
      if (!active.current) return;
      const draft: ReceiptExtraction = payload.draft;
      setExtracted(draft); setVehicleResolved(false); setConfirmed(false);
      setDate(draft.date || ''); setMileage(draft.mileage == null ? '' : String(draft.mileage));
      setShop(draft.provider || ''); setCost(draft.currency === 'USD' && draft.invoiceTotal != null ? String(draft.invoiceTotal) : '');
      setJobs(draft.jobs.length ? draft.jobs.map(job => ({ type: '', description: job.description })) : [{ type: '', description: '' }]);
      setDetailsVisible(true);
    } catch (cause) { if (active.current) setError(cause instanceof Error ? cause.message : 'Receipt extraction is unavailable.'); }
    finally { busy.current = false; if (active.current) setPending(null); }
  };
  const submit = async () => {
    if (busy.current) return;
    if (!attempt.current) {
      if (file && extracted?.vehicleMismatch !== 'no' && !vehicleResolved) { setError('Confirm this receipt belongs to the selected vehicle before saving.'); return; }
      const parsed = ServiceReviewSchema.safeParse({ requestId: crypto.randomUUID(), vehicleId, confirmed, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date, mileage: mileage.trim() ? Number(mileage) : NaN, ...(cost.trim() ? { cost: Number(cost) } : {}), ...(shop.trim() ? { shopName: shop.trim() } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}), jobs });
      if (!parsed.success || date > today) { setError('Enter the actual completion date and whole odometer reading, choose a distinct service for every job, and confirm the reviewed facts. Leave unknown cost blank.'); return; }
      attempt.current = { body: parsed.data, file };
      pendingReviews.set(vehicleId, attempt.current);
    }
    busy.current = true; setPending('save'); setError('');
    try {
      const current = attempt.current;
      let response: Response;
      if (current.file) {
        const form = new FormData(); form.set('file', current.file); form.set('review', JSON.stringify(current.body));
        response = await fetch('/api/maintenance/receipts', { method: 'POST', body: form, signal: AbortSignal.timeout(30_000) });
      } else response = await fetch('/api/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(current.body), signal: AbortSignal.timeout(30_000) });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 410) {
          if (!active.current) { current.removed = true; return; }
          forgetAttempt(); attempt.current = null; setAmbiguous(false); setConfirmed(false); setRemovedAfterSave(true); return;
        }
        if (payload.outcome === 'not_saved' || (response.status >= 400 && response.status < 500 && response.status !== 409)) { forgetAttempt(); attempt.current = null; setAmbiguous(false); setConfirmed(false); }
        else setAmbiguous(true);
        throw new Error(payload.message || payload.error || 'Save not confirmed.');
      }
      if (!Array.isArray(payload.records) || payload.records.length !== current.body.jobs.length || payload.records.some((record: SavedRecord) => record.vehicleId !== vehicleId || !record.id)) throw new Error('Save response could not be verified.');
      if (!active.current) { current.completed = payload.records; return; }
      forgetAttempt();
      setSaved(payload.records); setAmbiguous(false); onSaved?.(payload.records);
    } catch (cause) {
      if (active.current) { if (attempt.current) setAmbiguous(true); setError(cause instanceof Error ? cause.message : 'The save may have completed. Recheck this same review.'); }
    } finally { busy.current = false; if (active.current) setPending(null); }
  };
  if (removedAfterSave) return <section role="status" style={{ background: '#f8f5ed', color: '#0b1220', padding: 16, borderRadius: 12 }}>
    <h3>This service was already saved</h3><p>Some of its records were subsequently removed. Nothing was recreated. Check your history before recording different work.</p>
    <a href={`/garage/${encodeURIComponent(vehicleId)}/records`} style={{ color: '#1d4ed8' }}>View service history</a>
    {onCancel && <button type="button" onClick={onCancel} style={button}>Return to tree</button>}
  </section>;
  if (saved) return <section role="status" style={{ background: '#f8f5ed', color: '#0b1220', padding: 16, borderRadius: 12 }}>
    <h3>Saved to service history</h3><p>{saved.length} reviewed service{saved.length === 1 ? '' : 's'} saved for {vehicleLabel || 'this vehicle'}.</p>
    <p>Only documented work updates its mapped service clocks. Other warnings may remain; inspection or rotation does not mean parts were replaced.</p>
    <a href={`/garage/${encodeURIComponent(vehicleId)}/records`} style={{ color: '#1d4ed8' }}>View service history</a>
    {onCancel && <button type="button" onClick={onCancel} style={{ ...button, marginLeft: 8 }}>Return to tree</button>}
  </section>;
  return <section ref={reviewElement} aria-label="Review service" style={{ padding: 16, background: '#f8f5ed', color: '#0b1220', border: '1px solid #dfd9cb', borderRadius: 12, fontSize: 13, lineHeight: 1.5, minWidth: 0 }}>
    <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>{detailsVisible ? 'Review completed service' : file ? 'Review your document' : 'Upload service document'}</h3>
    <p style={{ margin: '0 0 12px' }}>{vehicleLabel || 'Selected vehicle'} · {detailsVisible ? 'No record is saved until you confirm. Enter completed work only, not estimates or recommendations.' : `Choose a service receipt or document. PDF, JPEG, PNG or WebP, up to ${MAINTENANCE_DOCUMENT_LIMIT_LABEL}. Selecting a file does not upload it or complete maintenance.`}</p>
    <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }} onChange={() => setConfirmed(false)}>
      <label style={{ display: 'block' }}>{uploadFirst ? 'Choose document' : 'Receipt file (optional)'}<input aria-label={uploadFirst ? 'Service document' : 'Receipt image'} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={event => { const next = event.target.files?.[0]; if (next) chooseFile(next); event.target.value = ''; }} style={{ ...field, marginTop: 4 }} /></label>
      {file && <div style={{ margin: '10px 0' }}>
        {preview && file.type !== 'application/pdf' && <img src={preview} alt="Selected receipt preview" style={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain' }} />}
        {preview && file.type === 'application/pdf' && <a href={preview} target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>Open selected PDF to review</a>}
        <p>{file.name} · Kept private when filed. Never sent to diagnosis or training capture.</p>
        <label><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /> Send this document for private AI extraction of a draft.</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}><button type="button" disabled={!consent} onClick={extract} style={button}>Extract receipt draft</button>{!detailsVisible && <button type="button" onClick={() => setDetailsVisible(true)} style={button}>Enter service details manually</button>}<button type="button" onClick={() => chooseFile(null)} style={button}>{uploadFirst ? 'Remove document' : 'Remove document / log manually'}</button></div>
        {extracted && <div role="status"><p>Check every extracted fact. {extracted.vehicleEvidence || 'No vehicle identity was readable.'}</p>{extracted.warnings.map((warning, index) => <p key={index}>{warning}</p>)}{extracted.currency !== 'USD' && <p>The receipt currency is {extracted.currency || 'uncertain'}. Cost was left blank; enter USD only if you can confirm a USD amount.</p>}</div>}
        {detailsVisible && extracted?.vehicleMismatch !== 'no' && <label style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={vehicleResolved} onChange={event => setVehicleResolved(event.target.checked)} /> I checked the vehicle evidence and confirm this receipt is for {vehicleLabel || 'this selected vehicle'}, resolving any mismatch.</label>}
      </div>}
      {detailsVisible && <><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: 10, margin: '12px 0' }}>
        <label>Actual completion date<input aria-label="Actual completion date" type="date" max={today} value={date} onChange={event => setDate(event.target.value)} style={field} /></label>
        <label>Odometer at service<input aria-label="Odometer at service" type="number" min="0" step="1" value={mileage} onChange={event => setMileage(event.target.value)} style={field} />{currentMileage != null && <button type="button" onClick={() => { setMileage(String(currentMileage)); setConfirmed(false); }} style={{ ...button, fontSize: 11 }}>Use current mileage ({currentMileage.toLocaleString()})</button>}</label>
        <label>Invoice total (USD, once)<input aria-label="Invoice total USD" type="number" min="0" step="0.01" value={cost} onChange={event => setCost(event.target.value)} placeholder="Unknown — leave blank" style={field} /></label>
        <label>Shop / provider (optional)<input aria-label="Shop or provider" maxLength={200} value={shop} onChange={event => setShop(event.target.value)} style={field} /></label>
      </div>
      {jobs.map((job, index) => <div key={index} style={{ padding: 10, border: '1px solid #dfd9cb', borderRadius: 8, marginBottom: 10 }}>
        <label>Completed work {index + 1}<input aria-label={`Completed work ${index + 1}`} maxLength={500} value={job.description} onChange={event => setJobs(previous => previous.map((item, at) => at === index ? { ...item, description: event.target.value } : item))} style={field} /></label>
        <label>Confirmed service {index + 1}<select aria-label={`Confirmed service ${index + 1}`} value={job.type} onChange={event => setJobs(previous => previous.map((item, at) => at === index ? { ...item, type: event.target.value } : item))} style={field}><option value="">Choose the documented service</option>{services.map(({ type, name }) => <option key={type} value={type}>{name}</option>)}</select></label>
        {jobs.length > 1 && <button type="button" onClick={() => { setJobs(previous => previous.filter((_, at) => at !== index)); setConfirmed(false); }} style={button}>Remove job {index + 1}</button>}
      </div>)}
      {jobs.length < 20 && <button type="button" onClick={() => { setJobs(previous => [...previous, { type: '', description: '' }]); setConfirmed(false); }} style={button}>Add another completed job</button>}
      <p>Do not map inspections, rotations, or partial brake work to a replacement. Generic brake service is recorded without claiming all pads or rotors were replaced.</p>
      <label>Notes (optional)<textarea aria-label="Service notes" value={notes} maxLength={2000} onChange={event => setNotes(event.target.value)} style={field} /></label>
      </>}
    </fieldset>
    {detailsVisible && <label style={{ display: 'block', margin: '12px 0' }}><input disabled={locked} type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> I confirm the vehicle, completed work, date and mileage are correct.</label>}
    {error && <p role="alert" style={{ color: '#991b1b' }}>{error}</p>}
    {pending === 'extract' && <button type="button" onClick={() => controller.current?.abort()} style={button}>Cancel receipt reading</button>}
    {ambiguous && <p>The result is not confirmed. Keep this review open and recheck the same submission; do not start a second record. Your original draft is retained.</p>}
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{detailsVisible && <button type="button" disabled={Boolean(pending) || (!ambiguous && !confirmed)} onClick={submit} style={{ ...button, background: '#0b1220', color: '#fff' }}>{pending === 'save' ? 'Saving…' : pending === 'extract' ? 'Reading receipt…' : ambiguous ? 'Recheck this save' : 'Confirm and save service'}</button>}{onCancel && <button type="button" disabled={locked} onClick={onCancel} style={button}>Cancel review</button>}</div>
  </section>;
}
