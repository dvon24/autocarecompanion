'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { allowReconciledHubVehicleRetry, createHubVehicle, HubVehicleSaveUnconfirmedError, reconcileHubVehicleSave, type CreatedHubVehicle } from './hub-add-vehicle';
import { getHubAddTwinOptions, hubAddTwinFields } from '@/lib/hub-add-twin-options';
import { OwnerEquipmentChoice } from '../OwnerEquipmentConfirmation';
import { MAX_HUB_MILEAGE, validHubMileage } from '@/lib/owner-hub-setup';

const twinOptions = getHubAddTwinOptions();

const fieldStyle: CSSProperties = {
  width: '100%', minWidth: 0, background: 'var(--ki-page)', border: '1px solid var(--ki-line)',
  borderRadius: 11, padding: '10px 12px', fontSize: 16, color: 'var(--ink)', fontFamily: 'var(--font-sans)',
};
const buttonStyle: CSSProperties = {
  borderRadius: 11, padding: '11px 16px', minHeight: 44, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-sans)', border: '1px solid var(--ki-line)',
};

export function HubAddVehicleModal({ onClose, onVehicleAdded, returnFocusTo, successDestination = 'hub' }: {
  onClose: () => void;
  onVehicleAdded: (vehicle: CreatedHubVehicle) => void;
  returnFocusTo?: HTMLElement | null;
  successDestination?: 'hub' | 'account';
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const savingRef = useRef(false);
  const checkRevision = useRef({ value: 0 });
  const id = useId();
  const [selectedId, setSelectedId] = useState('');
  const [equipmentConfirmed, setEquipmentConfirmed] = useState(false);
  const [transmission,setTransmission]=useState('');
  const [details, setDetails] = useState({ vin: '', currentMileage: '' });
  const selected = twinOptions.find((option) => option.id === selectedId && option.ownerReady);
  const fields = selected ? hubAddTwinFields(selected.id, {...details,transmission,...(equipmentConfirmed&&selected.equipment?{reviewedEquipmentId:selected.equipment.id}:{})}) : null;
  const requiredReady=validHubMileage(Number(details.currentMileage))&&(!selected?.transmissionOptions.length||selected.transmissionOptions.some(option=>option.value===transmission));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<CreatedHubVehicle | null>(null);
  const [needsReconciliation, setNeedsReconciliation] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkedMissing, setCheckedMissing] = useState(false);
  const [foundDuringCheck, setFoundDuringCheck] = useState(false);
  const [candidate, setCandidate] = useState<CreatedHubVehicle | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = returnFocusTo ?? document.activeElement;
    const lifetime = checkRevision.current;
    dialog?.showModal();
    return () => {
      lifetime.value++;
      dialog?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [returnFocusTo]);

  useEffect(() => { if (saved) successRef.current?.focus(); }, [saved]);

  const invalidateCheck = () => {
    checkRevision.current.value++;
    setCandidate(null);
    setCheckedMissing(false);
    setChecking(false);
  };
  const close = () => { if (!savingRef.current) { invalidateCheck(); onClose(); } };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current || saved || needsReconciliation || !fields || !requiredReady || (selected?.equipment && !equipmentConfirmed)) return;
    invalidateCheck();
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      const vehicle = await createHubVehicle(fields);
      setSaved(vehicle);
      onVehicleAdded(vehicle);
    } catch (failure) {
      if (failure instanceof HubVehicleSaveUnconfirmedError) {
        setNeedsReconciliation(true);
        setCheckedMissing(false);
      }
      setError(failure instanceof Error ? failure.message : 'Could not save this vehicle. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const reconcile = async () => {
    if (!fields || checking) return;
    const revision = ++checkRevision.current.value;
    setCandidate(null);
    setChecking(true);
    setCheckedMissing(false);
    setError('');
    try {
      const matches = await reconcileHubVehicleSave(fields);
      if (revision !== checkRevision.current.value) return;
      if (matches.length === 1) {
        setCandidate(matches[0]);
        setError('A vehicle with this year, model and trim is in your garage. That alone does not confirm this save, especially if you own two of the same build. Review the saved vehicle and its VIN/mileage before confirming.');
      } else if (matches.length > 1) {
        setError('Matching vehicles are already in your garage. Review them before adding another.');
      } else {
        setCheckedMissing(true);
        setError('No matching vehicle was returned by the latest check. The original save may still finish; check again before choosing to submit another request.');
      }
    } catch (failure) {
      if (revision === checkRevision.current.value) setError(failure instanceof Error ? failure.message : 'Could not check saved vehicles.');
    }
    finally { if (revision === checkRevision.current.value) setChecking(false); }
  };

  const input = (name: 'vin' | 'currentMileage', label: string, options: {
    required?: boolean; type?: 'text' | 'number'; min?: number; max?: number; maxLength?: number;
  } = {}) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, fontSize: 11.5, fontWeight: 600, color: 'var(--slate-700)' }}>
      {label}
      <input name={name} value={details[name]} {...options} step={options.type === 'number' ? 1 : undefined}
        autoCapitalize={name === 'vin' ? 'characters' : 'words'} spellCheck={false}
        onChange={(event) => { invalidateCheck(); setDetails((previous) => ({ ...previous, [name]: name === 'vin' ? event.target.value.toUpperCase() : event.target.value })); }}
        style={fieldStyle} />
    </label>
  );

  return (
    <dialog ref={dialogRef} className="hub-add-vehicle-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
      onCancel={(event) => { event.preventDefault(); close(); }}
      style={{ width: 'calc(100vw - 32px)', maxWidth: 620, maxHeight: 'calc(100dvh - 32px)', margin: 'auto', padding: 0,
        overflowY: 'auto', overscrollBehavior: 'contain', background: 'var(--ki-card)', color: 'var(--ink)',
        border: '1px solid var(--ki-line)', borderRadius: 18, boxShadow: '0 30px 80px rgba(0,0,0,.45)', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        .hub-add-vehicle-dialog::backdrop { background: rgba(8,11,18,.6); backdrop-filter: blur(6px); }
        .hub-add-vehicle-dialog :focus-visible { outline: 2px solid var(--au7o-blue, #3B82F6); outline-offset: 2px; }
        .hub-add-vehicle-dialog button:disabled { opacity: .55; cursor: not-allowed; }
        .hub-add-twin-options { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
        .hub-add-twin-card { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--ki-line); border-radius: 12px; background: var(--ki-page); color: var(--ink); cursor: pointer; }
        .hub-add-twin-card:has(input:checked) { border-color: #3B82F6; box-shadow: 0 0 0 1px #3B82F6; }
        .hub-add-twin-card:has(input:disabled) { cursor: not-allowed; }
        .hub-add-twin-card img { width: 100%; height: 100px; object-fit: contain; }
        .hub-add-vehicle-fields { display: grid; gap: 11px; grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 420px) { .hub-add-vehicle-fields, .hub-add-twin-options { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ki-line)', display: 'flex', alignItems: 'center', gap: 9 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/twin-stage/au7o-mascot.webp" alt="" width={24} height={24} style={{ objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="eyebrow" style={{ fontSize: 9.5, color: 'var(--au7o-blue)' }}>Your garage</div>
          <h2 id={`${id}-title`} style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 2 }}>Add vehicle</h2>
        </div>
        <button type="button" onClick={close} disabled={saving} aria-label="Close add vehicle"
          style={{ ...buttonStyle, padding: 0, width: 44, minWidth: 44, background: 'var(--ki-page)', color: 'var(--slate-500)', fontSize: 22 }}>×</button>
      </div>
      {saved ? (
        <div style={{ padding: '26px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 999, background: 'var(--ki-ok-bg)', color: 'var(--ki-ok-ink)' }}>✓</span>
          <h3 ref={successRef} tabIndex={-1} style={{ fontSize: 15.5, fontWeight: 600 }}>{foundDuringCheck ? 'Vehicle found in your garage' : 'Vehicle saved'}</h3>
          <p style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{saved.year} {saved.make} {saved.model} is in your garage.</p>
          <p id={`${id}-description`} style={{ fontSize: 12.5, color: 'var(--slate-500)', lineHeight: 1.5 }}>{successDestination === 'account' ? 'Choose it from My Garage on your Account page when you’re ready to open its Hub.' : 'Choose it from your vehicle switcher when you’re ready. Your current Hub stays open.'}</p>
          <button type="button" onClick={close} style={{ ...buttonStyle, marginTop: 4, background: 'var(--ink)', color: 'var(--ki-page)' }}>{successDestination === 'account' ? 'Back to My Garage' : 'Back to the car'}</button>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={saving} style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p id={`${id}-description`} style={{ fontSize: 12.5, color: 'var(--slate-500)', lineHeight: 1.5 }}>Choose the exact year, model, and trim of your vehicle. Demo-only builds aren’t available for owner garages yet.</p>
          <fieldset disabled={saving || needsReconciliation} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <legend style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Choose a built twin</legend>
            {[true, false].map((ready) => {
              const cards = <div className="hub-add-twin-options">
              {twinOptions.filter((option) => option.ownerReady === ready).map((option) => <label key={option.id} className="hub-add-twin-card">
                {option.artwork && <img src={option.artwork} alt="" loading="lazy" /> /* eslint-disable-line @next/next/no-img-element */}
                <span style={{ display: 'flex', alignItems: 'start', gap: 7, fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                  <input type="radio" name="twin" value={option.id} checked={selectedId === option.id} disabled={!option.ownerReady}
                    aria-label={option.label} aria-describedby={`${id}-${option.id}-status`}
                    onChange={() => { invalidateCheck(); setEquipmentConfirmed(false); setTransmission(''); setSelectedId(option.id); setError(''); }} style={{ marginTop: 3, accentColor: '#3B82F6', flexShrink: 0 }} />
                  {option.label}
                </span>
                <span id={`${id}-${option.id}-status`} style={{ fontSize: 11.5, color: 'var(--slate-500)' }}>{option.ownerReady ? 'Available for your garage' : 'Demo only · not available to add'}</span>
              </label>)}
              </div>;
              return ready ? <div key="ready">{cards}</div> : <details key="demo" style={{ marginTop: 12 }}>
                <summary style={{ minHeight: 44, padding: '12px 0', cursor: 'pointer', fontSize: 12 }}>Other twins · {twinOptions.filter((option) => !option.ownerReady).length} demo-only builds</summary>
                {cards}
              </details>;
            })}
          </fieldset>
          {selected && <p role="status" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Selected: <strong>{selected.label}</strong>. Add your actual mileage below; demo mileage and sample service records are not copied.</p>}
          {selected?.equipment && <OwnerEquipmentChoice profile={selected.equipment} checked={equipmentConfirmed} onChange={value=>{invalidateCheck();setEquipmentConfirmed(value);}} disabled={saving||needsReconciliation}/>}
          <fieldset disabled={saving || needsReconciliation} className="hub-add-vehicle-fields" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {input('vin', 'VIN (optional)', { maxLength: 17 })}
            {input('currentMileage', 'Current mileage in miles (required)', { type: 'number', min: 1, max:MAX_HUB_MILEAGE, required:true })}
            {!!selected?.transmissionOptions.length&&<label style={{display:'grid',gap:6,fontSize:12,fontWeight:600}}>Your transmission (required)<select aria-label="Your transmission (required)" required value={transmission} onChange={event=>{invalidateCheck();setTransmission(event.target.value);}} style={fieldStyle}><option value="">Choose your actual transmission</option>{selected.transmissionOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
          </fieldset>
          {error && <p role="alert" style={{ fontSize: 12.5, color: 'var(--ki-crit)', lineHeight: 1.5 }}>{error}</p>}
          {needsReconciliation && <div style={{ display:'grid', gap:8 }}>
            {candidate && <><a href={`/garage/${encodeURIComponent(candidate.id)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'underline' }}>Review matching vehicle in a new tab</a><button type="button" disabled={checking} onClick={() => { if (!fields || checking) return; invalidateCheck(); allowReconciledHubVehicleRetry(fields); setFoundDuringCheck(true); setSaved(candidate); onVehicleAdded(candidate); }} style={{ ...buttonStyle, background:'var(--ki-page)', color:'var(--ink)' }}>I verified this is the vehicle I just added</button></>}
            <button type="button" disabled={checking} onClick={reconcile} style={{ ...buttonStyle, background:'var(--ki-page)', color:'var(--ink)' }}>{checking ? 'Checking saved vehicles…' : 'Check saved vehicles'}</button>
            {checkedMissing && fields && <button type="button" disabled={checking} onClick={() => { invalidateCheck(); allowReconciledHubVehicleRetry(fields); setNeedsReconciliation(false); setError('Checked your garage. Submit again only if you want another save attempt.'); }} style={{ ...buttonStyle, background:'var(--ki-page)', color:'var(--ink)' }}>I checked — allow another attempt</button>}
          </div>}
          <div style={{ display: 'flex', gap: 9 }}>
            <button type="button" onClick={close} disabled={saving} style={{ ...buttonStyle, flex: 1, background: 'var(--ki-page)', color: 'var(--ink)' }}>Cancel</button>
            <button type="submit" disabled={!selected || !requiredReady || (Boolean(selected.equipment)&&!equipmentConfirmed) || saving || needsReconciliation} style={{ ...buttonStyle, flex: 1, background: '#3B82F6', color: '#fff', borderColor: '#3B82F6' }}>{saving ? 'Saving…' : 'Add vehicle'}</button>
          </div>
          <span role="status" style={{ fontSize: 12, color: 'var(--slate-500)' }}>{saving ? 'Saving your vehicle. Please wait.' : ''}</span>
        </form>
      )}
    </dialog>
  );
}
