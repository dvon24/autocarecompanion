'use client';

import { useState, FormEvent } from 'react';
import { useVehicleContext } from '@/contexts/AppContext';

interface CustomVehicleInputProps {
  onComplete?: () => void;
}

interface ParsedVehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
}

export function CustomVehicleInput({ onComplete }: CustomVehicleInputProps) {
  const { setVehicle } = useVehicleContext();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [parsedVehicle, setParsedVehicle] = useState<ParsedVehicle | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your vehicle information');
      return;
    }

    setStatus('validating');
    setErrorMessage('');

    try {
      const response = await fetch('/api/vehicle/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setParsedVehicle(data.vehicle);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Could not validate this vehicle. Please check the details and try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Unable to validate vehicle. Please try again or use manual selection.');
    }
  };

  const handleConfirm = () => {
    if (parsedVehicle) {
      setVehicle({
        year: parsedVehicle.year,
        make: parsedVehicle.make,
        model: parsedVehicle.model,
        trim: parsedVehicle.trim || 'Base',
      });
      onComplete?.();
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setParsedVehicle(null);
    setErrorMessage('');
  };

  if (status === 'success' && parsedVehicle) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-green-800">Vehicle Validated</p>
              <p className="text-green-700 mt-1">
                {parsedVehicle.year} {parsedVehicle.make} {parsedVehicle.model}
                {parsedVehicle.trim && ` ${parsedVehicle.trim}`}
              </p>
              {parsedVehicle.engine && (
                <p className="text-green-600 text-sm mt-0.5">Engine: {parsedVehicle.engine}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Change
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="vehicle-input" className="block text-sm font-medium text-gray-700 mb-1">
          Describe your vehicle
        </label>
        <textarea
          id="vehicle-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="e.g., 2015 Honda Civic LX 1.8L&#10;or 2019 Ford F-150 XLT EcoBoost"
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
            status === 'error' ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={status === 'validating'}
        />
        {status === 'error' && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Include year, make, model, and trim if known. Engine size helps us find the most accurate guides.
        </p>
      </div>

      <button
        type="submit"
        disabled={status === 'validating' || !input.trim()}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          status === 'validating' || !input.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {status === 'validating' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Validating with AI...
          </span>
        ) : (
          'Validate Vehicle'
        )}
      </button>
    </form>
  );
}
