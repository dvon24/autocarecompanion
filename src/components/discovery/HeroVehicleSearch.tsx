'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicleContext } from '@/contexts/AppContext';
import { type YMMTData, YMMTDataSchema } from '@/schemas/vehicle.schema';

/**
 * HeroVehicleSearch - Native select-based YMMT selector for the homepage hero.
 * Uses native <select> elements instead of Headless UI Listbox to avoid
 * scroll-lock issues on the landing page.
 * Routes to /known-issues/[make]-[model]?year=YYYY on submit.
 */

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '20px',
  paddingRight: '40px',
};

export function HeroVehicleSearch() {
  const router = useRouter();
  const { setVehicle } = useVehicleContext();
  const [ymmtData, setYmmtData] = useState<YMMTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');

  useEffect(() => {
    fetch('/data/ymmt.json')
      .then(res => res.json())
      .then(data => {
        setYmmtData(YMMTDataSchema.parse(data));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const availableYears = useMemo(() => {
    if (!ymmtData) return [];
    return Object.keys(ymmtData).map(y => parseInt(y, 10)).sort((a, b) => b - a);
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
    setSelectedYear(e.target.value);
    setSelectedMake('');
    setSelectedModel('');
    setSelectedTrim('');
  }, []);

  const handleMakeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMake(e.target.value);
    setSelectedModel('');
    setSelectedTrim('');
  }, []);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    setSelectedTrim('');
  }, []);

  const handleTrimChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrim(e.target.value);
  }, []);

  const isComplete = selectedYear && selectedMake && selectedModel && selectedTrim;

  const handleSubmit = useCallback(() => {
    if (!isComplete) return;
    setVehicle({
      year: parseInt(selectedYear, 10),
      make: selectedMake,
      model: selectedModel,
      trim: selectedTrim,
    });
    const slug = `${selectedMake}-${selectedModel}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    router.push(`/known-issues/${slug}?year=${selectedYear}`);
  }, [isComplete, selectedYear, selectedMake, selectedModel, selectedTrim, setVehicle, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading vehicles...</span>
      </div>
    );
  }

  const baseClass = 'min-h-[48px] px-4 py-3 rounded-lg border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none';

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className={`${baseClass} text-gray-900 cursor-pointer`}
          style={selectStyle}
        >
          <option value="">Year</option>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedMake}
          onChange={handleMakeChange}
          disabled={!selectedYear}
          className={`${baseClass} ${selectedYear ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
          style={selectStyle}
        >
          <option value="">{selectedYear ? 'Make' : 'Select year first'}</option>
          {availableMakes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={selectedModel}
          onChange={handleModelChange}
          disabled={!selectedMake}
          className={`${baseClass} ${selectedMake ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
          style={selectStyle}
        >
          <option value="">{selectedMake ? 'Model' : 'Select make first'}</option>
          {availableModels.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={selectedTrim}
          onChange={handleTrimChange}
          disabled={!selectedModel}
          className={`${baseClass} ${selectedModel ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
          style={selectStyle}
        >
          <option value="">{selectedModel ? 'Trim' : 'Select model first'}</option>
          {availableTrims.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`
            w-full min-h-[48px] py-3 px-6
            rounded-lg font-semibold text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isComplete
              ? 'bg-gray-900 hover:bg-gray-800 hover:scale-[1.02] hover:shadow-lg cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isComplete ? 'Show My Car\'s Issues' : 'Select your vehicle above'}
        </button>
      </div>
    </div>
  );
}
