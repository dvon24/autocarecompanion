'use client';

import { useState } from 'react';

interface VehicleData {
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
  color?: string;
  nickname?: string;
  isPrimary: boolean;
  currentMileage?: number;
}

interface AddVehicleModalProps {
  onClose: () => void;
  onVehicleAdded: (vehicleData: VehicleData) => void | Promise<void>;
}

export function AddVehicleModal({ onClose, onVehicleAdded }: AddVehicleModalProps) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    vin: '',
    color: '',
    nickname: '',
    currentMileage: '',
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vinLookup, setVinLookup] = useState(false);

  const handleVinLookup = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      setError('Please enter a valid 17-character VIN');
      return;
    }

    setVinLookup(true);
    setError('');

    try {
      const res = await fetch(`/api/vin/decode?vin=${formData.vin}`);
      if (res.ok) {
        const data = await res.json();
        if (data.vehicle) {
          setFormData((prev) => ({
            ...prev,
            year: data.vehicle.year || prev.year,
            make: data.vehicle.make || prev.make,
            model: data.vehicle.model || prev.model,
            trim: data.vehicle.trim || prev.trim,
          }));
        }
      } else {
        setError('Could not decode VIN. Please enter vehicle details manually.');
      }
    } catch {
      setError('VIN lookup failed. Please enter vehicle details manually.');
    } finally {
      setVinLookup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const vehicleData: VehicleData = {
        year: formData.year,
        make: formData.make,
        model: formData.model,
        trim: formData.trim || undefined,
        vin: formData.vin || undefined,
        color: formData.color || undefined,
        nickname: formData.nickname || undefined,
        currentMileage: formData.currentMileage
          ? parseInt(formData.currentMileage)
          : undefined,
        isPrimary: formData.isPrimary,
      };

      await onVehicleAdded(vehicleData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add vehicle. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Vehicle</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* VIN Lookup */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              VIN (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData((prev) => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                placeholder="Enter 17-character VIN"
                maxLength={17}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={handleVinLookup}
                disabled={vinLookup || formData.vin.length !== 17}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {vinLookup ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Auto-fill vehicle details from VIN
            </p>
          </div>

          {/* Year, Make, Model Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
                min={1900}
                max={new Date().getFullYear() + 2}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Make *
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData((prev) => ({ ...prev, make: e.target.value }))}
                placeholder="Toyota"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="Camry"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Trim and Color */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Trim
              </label>
              <input
                type="text"
                value={formData.trim}
                onChange={(e) => setFormData((prev) => ({ ...prev, trim: e.target.value }))}
                placeholder="SE, XLE, etc."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                placeholder="Silver"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Mileage and Nickname */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Mileage
              </label>
              <input
                type="number"
                value={formData.currentMileage}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentMileage: e.target.value }))}
                placeholder="50000"
                min={0}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nickname
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
                placeholder="Daily Driver"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Primary Vehicle Toggle */}
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrimary}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPrimary: e.target.checked }))}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Set as primary vehicle</span>
          </label>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.make || !formData.model}
              className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
