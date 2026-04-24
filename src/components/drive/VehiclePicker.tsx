'use client';

import { useEffect, useState } from 'react';

export interface DriveVehicle {
  year: number;
  make: string;
  model: string;
  trim: string;
}

interface Props {
  value: DriveVehicle | null;
  onChange: (v: DriveVehicle | null) => void;
}

type Ymmt = Record<string, Record<string, Record<string, string[]>>>;

/**
 * Small pill in the top-left of /drive that opens a modal with cascading
 * Year → Make → Model → Trim dropdowns. Persists to localStorage so the
 * user doesn't have to pick every session, and so no login is required.
 */
export function VehiclePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [ymmt, setYmmt] = useState<Ymmt | null>(null);
  const [year, setYear] = useState<number | null>(value?.year ?? null);
  const [make, setMake] = useState<string>(value?.make ?? '');
  const [model, setModel] = useState<string>(value?.model ?? '');
  const [trim, setTrim] = useState<string>(value?.trim ?? '');

  useEffect(() => {
    if (!open || ymmt) return;
    fetch('/data/ymmt.json')
      .then((r) => r.json())
      .then((data: Ymmt) => setYmmt(data))
      .catch(() => setYmmt({}));
  }, [open, ymmt]);

  const years = ymmt ? Object.keys(ymmt).sort((a, b) => Number(b) - Number(a)) : [];
  const makes = year && ymmt?.[String(year)] ? Object.keys(ymmt[String(year)]).sort() : [];
  const models = year && make && ymmt?.[String(year)]?.[make] ? Object.keys(ymmt[String(year)][make]).sort() : [];
  const trims = year && make && model && ymmt?.[String(year)]?.[make]?.[model] ? ymmt[String(year)][make][model] : [];

  const canSave = year && make && model && trim;

  const save = () => {
    if (!canSave) return;
    onChange({ year: year!, make, model, trim });
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setYear(null); setMake(''); setModel(''); setTrim('');
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-800 text-xs font-medium shadow-sm border border-gray-200 hover:bg-white transition"
        aria-label="Change vehicle"
      >
        🚗 {value ? `${value.year} ${value.make} ${value.model}` : 'Pick vehicle'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">What are you driving?</h3>
            <p className="text-xs text-gray-500 mb-4">Au7o uses this to estimate fuel range and tailor the voice assistant.</p>

            <div className="space-y-3">
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={year ?? ''}
                onChange={(e) => { setYear(e.target.value ? Number(e.target.value) : null); setMake(''); setModel(''); setTrim(''); }}
              >
                <option value="">Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                disabled={!year || makes.length === 0}
                value={make}
                onChange={(e) => { setMake(e.target.value); setModel(''); setTrim(''); }}
              >
                <option value="">Make</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                disabled={!make || models.length === 0}
                value={model}
                onChange={(e) => { setModel(e.target.value); setTrim(''); }}
              >
                <option value="">Model</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                disabled={!model || trims.length === 0}
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
              >
                <option value="">Trim</option>
                {trims.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={clear}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
