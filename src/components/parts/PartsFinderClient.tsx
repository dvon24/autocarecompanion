'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicleContext } from '@/contexts/AppContext';
import { type YMMTData, YMMTDataSchema } from '@/schemas/vehicle.schema';
import { trackAffiliateClick } from '@/lib/analytics';

// ─── Types ─────────────────────────────────────────────────────────────

interface CrossReference {
  brand: string;
  partNumber: string;
}

interface PartResult {
  name: string;
  spec: string;
  detail?: string;
  searchQuery: string;
  partNumber?: string;
  oemBrand?: string;
  crossReferences?: CrossReference[];
  confidence?: 'oem-verified' | 'high' | 'moderate';
  quantity?: number;
}

interface TaskDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// ─── Constants ─────────────────────────────────────────────────────────

const AFFILIATE_TAG = 'au7o-20';

const TASKS: TaskDef[] = [
  { id: 'oil_change', name: 'Oil Change', icon: '🛢️', description: 'Oil, filter, drain plug specs' },
  { id: 'spark_plugs', name: 'Spark Plugs', icon: '⚡', description: 'Part number, gap, qty, torque' },
  { id: 'brake_inspection', name: 'Brakes', icon: '🛑', description: 'Pads, rotors, fluid' },
  { id: 'coolant_flush', name: 'Coolant', icon: '🌡️', description: 'Type and capacity' },
  { id: 'transmission_fluid', name: 'Trans Fluid', icon: '⚙️', description: 'Fluid type and capacity' },
  { id: 'air_filter', name: 'Air Filter', icon: '💨', description: 'Engine air filter' },
  { id: 'cabin_filter', name: 'Cabin Filter', icon: '🌬️', description: 'Cabin air filter' },
  { id: 'wiper_blades', name: 'Wipers', icon: '🌧️', description: 'Blade sizes' },
  { id: 'battery', name: 'Battery', icon: '🔋', description: 'Group size, CCA' },
  { id: 'differential_fluid', name: 'Diff Fluid', icon: '🔧', description: 'Differential specs' },
  { id: 'bulb_replacement', name: 'Light Bulbs', icon: '💡', description: 'All bulb numbers' },
  { id: 'tire_rotation', name: 'Lug Specs', icon: '🛞', description: 'Socket size, torque' },
];

function amazonUrl(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

function googleShoppingUrl(query: string) {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}

function buildSearchQuery(vehicle: { year: string; make: string; model: string; trim: string }, part: string) {
  const parts = [vehicle.year, vehicle.make, vehicle.model];
  if (vehicle.trim && !['Base', 'Standard'].includes(vehicle.trim)) {
    parts.push(vehicle.trim);
  }
  parts.push(part);
  return parts.join(' ');
}

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '20px',
  paddingRight: '40px',
};

// ─── Component ─────────────────────────────────────────────────────────

export function PartsFinderClient() {
  const { setVehicle } = useVehicleContext();
  const [ymmtData, setYmmtData] = useState<YMMTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const [partsResults, setPartsResults] = useState<PartResult[]>([]);
  const [partsSource, setPartsSource] = useState<string>('');
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/data/ymmt.json')
      .then((res) => res.json())
      .then((data) => {
        setYmmtData(YMMTDataSchema.parse(data));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Fetch parts from API when task is selected
  useEffect(() => {
    if (!selectedYear || !selectedMake || !selectedModel || !selectedTrim || !selectedTask) {
      setPartsResults([]);
      setPartsSource('');
      setPartsError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPartsLoading(true);
    setPartsError(null);
    setPartsResults([]);

    const params = new URLSearchParams({
      year: selectedYear,
      make: selectedMake,
      model: selectedModel,
      trim: selectedTrim,
      task: selectedTask,
    });

    fetch(`/api/parts?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load parts');
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setPartsResults(data.parts || []);
          setPartsSource(data.source || '');
          setPartsLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setPartsError('Something went wrong looking up parts. Please try again.');
        setPartsLoading(false);
      });

    return () => controller.abort();
  }, [selectedYear, selectedMake, selectedModel, selectedTrim, selectedTask]);

  const availableYears = useMemo(() => {
    if (!ymmtData) return [];
    return Object.keys(ymmtData).map((y) => parseInt(y, 10)).sort((a, b) => b - a);
  }, [ymmtData]);

  const availableMakes = useMemo(() => {
    if (!ymmtData || !selectedYear) return [];
    const yearData = ymmtData[selectedYear];
    return yearData ? Object.keys(yearData).sort() : [];
  }, [ymmtData, selectedYear]);

  const availableModels = useMemo(() => {
    if (!ymmtData || !selectedYear || !selectedMake) return [];
    const yearData = ymmtData[selectedYear];
    if (!yearData) return [];
    const makeData = yearData[selectedMake];
    return makeData ? Object.keys(makeData).sort() : [];
  }, [ymmtData, selectedYear, selectedMake]);

  const availableTrims = useMemo(() => {
    if (!ymmtData || !selectedYear || !selectedMake || !selectedModel) return [];
    const yearData = ymmtData[selectedYear];
    if (!yearData) return [];
    const makeData = yearData[selectedMake];
    if (!makeData) return [];
    return makeData[selectedModel] || [];
  }, [ymmtData, selectedYear, selectedMake, selectedModel]);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value); setSelectedMake(''); setSelectedModel(''); setSelectedTrim(''); setSelectedTask(null);
  }, []);
  const handleMakeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMake(e.target.value); setSelectedModel(''); setSelectedTrim(''); setSelectedTask(null);
  }, []);
  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value); setSelectedTrim(''); setSelectedTask(null);
  }, []);
  const handleTrimChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedTrim(e.target.value);
      setSelectedTask(null);
      if (e.target.value && selectedYear && selectedMake && selectedModel) {
        setVehicle({ year: parseInt(selectedYear, 10), make: selectedMake, model: selectedModel, trim: e.target.value });
      }
    },
    [selectedYear, selectedMake, selectedModel, setVehicle]
  );

  const isVehicleSelected = selectedYear && selectedMake && selectedModel && selectedTrim;
  const vehicle = { year: selectedYear, make: selectedMake, model: selectedModel, trim: selectedTrim };
  const taskName = TASKS.find(t => t.id === selectedTask)?.name || '';

  const baseSelectClass =
    'min-h-[48px] px-4 py-3 rounded-lg border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none';

  return (
    <>
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/known-issues" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Known Issues
            </Link>
            <Link href="/get-started" className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-700 font-medium">Parts Finder</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Parts Finder</h1>
          <p className="text-gray-500 max-w-xl">
            Select your vehicle and task to get exact parts with OEM numbers, cross-references, and links to compare prices.
          </p>
        </header>

        {/* YMMT Selector */}
        <section className="mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Loading vehicles...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={selectedYear} onChange={handleYearChange} className={`${baseSelectClass} text-gray-900 cursor-pointer`} style={selectStyle}>
                <option value="">Year</option>
                {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={selectedMake} onChange={handleMakeChange} disabled={!selectedYear} className={`${baseSelectClass} ${selectedYear ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`} style={selectStyle}>
                <option value="">{selectedYear ? 'Make' : 'Select year'}</option>
                {availableMakes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={selectedModel} onChange={handleModelChange} disabled={!selectedMake} className={`${baseSelectClass} ${selectedMake ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`} style={selectStyle}>
                <option value="">{selectedMake ? 'Model' : 'Select make'}</option>
                {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={selectedTrim} onChange={handleTrimChange} disabled={!selectedModel} className={`${baseSelectClass} ${selectedModel ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`} style={selectStyle}>
                <option value="">{selectedModel ? 'Trim' : 'Select model'}</option>
                {availableTrims.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </section>

        {/* Task Grid */}
        {isVehicleSelected && !selectedTask && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">What do you need?</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {TASKS.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTask(task.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                >
                  <span className="text-xl">{task.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{task.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {isVehicleSelected && selectedTask && (
          <section>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {taskName} — {selectedYear} {selectedMake} {selectedModel} {selectedTrim}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {partsSource === 'static' ? '✅ Verified from OEM specs' :
                   partsSource === 'ai' ? '⚡ Looked up via AI — verify before purchasing' :
                   'Loading...'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Change task
              </button>
            </div>

            {/* Loading */}
            {partsLoading && (
              <div className="border border-gray-200 rounded-lg p-8 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Looking up exact parts for your vehicle...</p>
              </div>
            )}

            {/* Error */}
            {partsError && (
              <div className="border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 text-sm mb-3">{partsError}</p>
                <button
                  type="button"
                  onClick={() => { const t = selectedTask; setSelectedTask(null); setTimeout(() => setSelectedTask(t), 50); }}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Parts list */}
            {!partsLoading && !partsError && partsResults.length > 0 && (
              <div className="space-y-4">
                {partsResults.map((part, idx) => (
                  <PartCard key={idx} part={part} vehicle={vehicle} />
                ))}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <Link
                    href={`/known-issues/${selectedMake.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${selectedModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Known Issues
                  </Link>
                  <Link
                    href="/get-started"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Get DIY Repair Guide
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Explainer when no vehicle selected */}
        {!isVehicleSelected && (
          <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">OEM Part Numbers</h3>
              <p className="text-xs text-gray-500">Exact part numbers from service manuals with aftermarket cross-references.</p>
            </div>
            <div className="p-5 rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">🛒</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Compare Prices</h3>
              <p className="text-xs text-gray-500">One-click links to Google Shopping and Amazon to find the best price.</p>
            </div>
            <div className="p-5 rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Confidence Badges</h3>
              <p className="text-xs text-gray-500">Every part shows whether it&apos;s OEM verified or AI recommended.</p>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 py-3 mt-8">
          <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-400 leading-relaxed">
            Part numbers are sourced from OEM specs and AI cross-referencing. Always confirm compatibility before purchasing. Prices shown on external sites may vary.
          </p>
        </div>

        <footer className="pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Au7o. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}

// ─── Part Card ─────────────────────────────────────────────────────────

function PartCard({
  part,
  vehicle,
}: {
  part: PartResult;
  vehicle: { year: string; make: string; model: string; trim: string };
}) {
  const searchTerm = part.partNumber || part.searchQuery;
  const fullQuery = buildSearchQuery(vehicle, searchTerm);
  const amzUrl = amazonUrl(fullQuery);
  const shopUrl = googleShoppingUrl(fullQuery);

  const confidenceConfig = {
    'oem-verified': { label: 'OEM Verified', color: 'text-green-700 bg-green-50 border-green-200' },
    high: { label: 'High Confidence', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    moderate: { label: 'AI Recommended', color: 'text-gray-600 bg-gray-50 border-gray-200' },
  };

  const conf = confidenceConfig[part.confidence || 'moderate'];

  const handleAmazonClick = () => {
    trackAffiliateClick({
      issueId: `parts-finder-${vehicle.make}-${vehicle.model}`.toLowerCase(),
      recommendationIndex: 0,
      linkUrl: amzUrl,
      partNumber: part.partNumber || undefined,
      partName: part.name,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{part.name}</h3>
          {part.quantity && part.quantity > 1 && (
            <span className="text-xs text-gray-400">Qty: {part.quantity}</span>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${conf.color}`}>
          {conf.label}
        </span>
      </div>

      {/* Spec */}
      <div className="mb-3">
        <span className="text-sm font-mono text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded">
          {part.spec}
        </span>
        {part.oemBrand && (
          <span className="text-xs text-gray-400 ml-2">{part.oemBrand}</span>
        )}
      </div>

      {part.detail && <p className="text-sm text-gray-500 mb-3">{part.detail}</p>}

      {/* Cross-references */}
      {part.crossReferences && part.crossReferences.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">Also fits:</p>
          <div className="flex flex-wrap gap-1.5">
            {part.crossReferences.map((cr, i) => (
              <span key={i} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {cr.brand} {cr.partNumber}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buy links */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Compare Prices
        </a>
        <a
          href={amzUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAmazonClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
        >
          Amazon
        </a>
      </div>
    </div>
  );
}
