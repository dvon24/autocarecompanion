'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  vehicle: { year: number; make: string; model: string; trim?: string | null };
  /** Initial value from the server (Vehicle.currentMileage for signed-in users; null for anon). */
  initialMileage: number | null;
  /** When true we also POST to /api/vehicle-mileage to persist server-side. */
  isAuthed: boolean;
  /**
   * Called whenever the displayed mileage changes so the host can refresh
   * downstream UI (greeting text, maintenance suggestions). Optional —
   * a full route refresh would also work but is heavier.
   */
  onChange?: (mileage: number | null) => void;
  /** Compact mode for tight headers (smaller text/padding). */
  compact?: boolean;
}

/**
 * Inline tap-to-edit current mileage.
 *
 * - Anonymous: writes to localStorage keyed by year-make-model so the
 *   value persists across visits even without a Vehicle row.
 * - Signed-in: writes to localStorage AND fires a POST to
 *   /api/vehicle-mileage which upserts the user's Vehicle row.
 *
 * Style is intentionally minimal — designed to live inside the m-veh-pill
 * subtext row without dominating it. "0 mi" → "Tap to set" copy gently
 * onboards users who haven't entered a value yet.
 */
export function MileageEditor({ vehicle, initialMileage, isAuthed, onChange, compact = false }: Props) {
  const storageKey = `au7o:mileage:${vehicle.year}-${vehicle.make}-${vehicle.model}`.toLowerCase().replace(/\s+/g, '-');

  const [mileage, setMileage] = useState<number | null>(initialMileage);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage on first mount when the server didn't have a
  // value. We never overwrite a server-supplied value — DB is authoritative.
  useEffect(() => {
    if (initialMileage != null) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const n = parseInt(stored, 10);
        if (Number.isFinite(n) && n >= 0) {
          setMileage(n);
          onChange?.(n);
        }
      }
    } catch {
      // localStorage disabled / SSR — ignore.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, initialMileage]);

  // Auto-focus + select when entering edit mode.
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const openEditor = () => {
    setDraft(mileage != null ? String(mileage) : '');
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft('');
  };

  const save = async () => {
    const cleaned = draft.replace(/[^0-9]/g, '');
    if (!cleaned) {
      cancel();
      return;
    }
    const value = parseInt(cleaned, 10);
    if (!Number.isFinite(value) || value < 0 || value > 9_999_999) {
      cancel();
      return;
    }
    setSaving(true);
    setMileage(value);
    onChange?.(value);
    try {
      localStorage.setItem(storageKey, String(value));
    } catch { /* ignore */ }
    if (isAuthed) {
      try {
        await fetch('/api/vehicle-mileage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim ?? null,
            mileage: value,
          }),
        });
      } catch {
        // Localstorage already updated — server write is best-effort here.
      }
    }
    setSaving(false);
    setEditing(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  };

  const fontSize = compact ? 11 : 13;
  const padding = compact ? '2px 6px' : '4px 8px';

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={onKey}
          onBlur={save}
          disabled={saving}
          aria-label="Current mileage"
          style={{
            // Prevent iOS auto-zoom on focus by ensuring >=16px font.
            fontSize: Math.max(fontSize, 16),
            padding,
            width: 80,
            border: '1px solid var(--slate-300, #cbd5e1)',
            borderRadius: 6,
            outline: 'none',
            fontFamily: 'inherit',
            color: '#0b1220',
            background: '#fff',
          }}
          placeholder="0"
        />
        <span style={{ fontSize, color: 'var(--slate-500, #64748b)' }}>mi</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditor(); }}
      aria-label={mileage != null ? `Edit mileage (currently ${mileage.toLocaleString()} miles)` : 'Set current mileage'}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        fontFamily: 'inherit',
        fontSize,
        color: mileage != null ? 'inherit' : 'var(--blue-600, #2563eb)',
        cursor: 'pointer',
        textDecoration: mileage != null ? 'none' : 'underline',
        textDecorationStyle: 'dotted',
      }}
    >
      {mileage != null ? `${mileage.toLocaleString()} mi` : 'Tap to set mileage'}
    </button>
  );
}
