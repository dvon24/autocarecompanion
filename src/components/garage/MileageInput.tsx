'use client';

import { useState } from 'react';

interface MileageInputProps {
  vehicleId: string;
  currentMileage?: number | null;
  onMileageUpdated: (newMileage: number) => void;
  isDemo?: boolean;
}

export function MileageInput({ vehicleId, currentMileage, onMileageUpdated, isDemo = false }: MileageInputProps) {
  const [mileage, setMileage] = useState(currentMileage?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newMileage = parseInt(mileage);
    if (isNaN(newMileage) || newMileage < 0) {
      setError('Please enter a valid mileage');
      return;
    }

    if (currentMileage && newMileage < currentMileage) {
      setError('New mileage cannot be less than current mileage');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    // In demo mode, skip API call and update directly
    if (isDemo) {
      onMileageUpdated(newMileage);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/mileage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mileage: newMileage }),
      });

      if (res.ok) {
        onMileageUpdated(newMileage);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update mileage');
      }
    } catch {
      setError('Failed to update mileage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <div className="relative">
          <input
            type="number"
            value={mileage}
            onChange={(e) => {
              setMileage(e.target.value);
              setError('');
              setSuccess(false);
            }}
            placeholder={currentMileage?.toString() || 'Enter current mileage'}
            min={currentMileage || 0}
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            mi
          </span>
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 mt-1">Mileage updated successfully!</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !mileage}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}
