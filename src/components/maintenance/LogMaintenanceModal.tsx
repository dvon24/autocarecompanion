'use client';

import { useState } from 'react';
import { MAINTENANCE_SCHEDULES, getApplicableSchedules, type VehicleContext, type ResolvedSchedule } from '@/lib/maintenance';

interface MaintenanceRecord {
  id: string;
  type: string;
  description?: string | null;
  mileage: number;
  cost?: number | null;
  date: string;
  nextDueMileage?: number | null;
  nextDueDate?: string | null;
  notes?: string | null;
  shopName?: string | null;
}

interface LogMaintenanceModalProps {
  vehicleId: string;
  currentMileage?: number | null;
  preselectedType?: string | null;
  vehicleContext?: VehicleContext;
  onClose: () => void;
  onRecordAdded: (record: MaintenanceRecord) => void;
}

export function LogMaintenanceModal({
  vehicleId,
  currentMileage,
  preselectedType,
  vehicleContext,
  onClose,
  onRecordAdded,
}: LogMaintenanceModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    type: preselectedType || '',
    description: '',
    mileage: currentMileage?.toString() || '',
    cost: '',
    date: today,
    notes: '',
    shopName: '',
    setNextDue: false,
    nextDueMileage: '',
    nextDueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const mileage = parseInt(formData.mileage);
    if (isNaN(mileage) || mileage < 0) {
      setError('Please enter a valid mileage');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          type: formData.type,
          description: formData.description || undefined,
          mileage,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          date: formData.date,
          notes: formData.notes || undefined,
          shopName: formData.shopName || undefined,
          nextDueMileage: formData.setNextDue && formData.nextDueMileage
            ? parseInt(formData.nextDueMileage)
            : undefined,
          nextDueDate: formData.setNextDue && formData.nextDueDate
            ? formData.nextDueDate
            : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onRecordAdded(data.record);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to log maintenance');
      }
    } catch {
      setError('Failed to log maintenance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = formData.type ? MAINTENANCE_SCHEDULES[formData.type] : null;

  // Get applicable schedules for the vehicle (if context provided)
  const applicableSchedules = vehicleContext ? getApplicableSchedules(vehicleContext) : null;
  const applicableIds = applicableSchedules ? new Set(applicableSchedules.map(s => s.id)) : null;

  // Get the resolved schedule for the selected type
  const resolvedType = applicableSchedules?.find(s => s.id === formData.type);

  // Calculate suggested next due using resolved interval
  const intervalMiles = resolvedType?.intervalMiles ?? selectedType?.defaultIntervalMiles;
  const suggestedNextMileage = selectedType && formData.mileage && intervalMiles
    ? parseInt(formData.mileage) + intervalMiles
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Log Maintenance</h2>
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

          {/* Maintenance Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Service Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Select service type</option>
              <optgroup label="Routine">
                {Object.entries(MAINTENANCE_SCHEDULES)
                  .filter(([id, t]) => t.category === 'routine' && (!applicableIds || applicableIds.has(id)))
                  .map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Periodic">
                {Object.entries(MAINTENANCE_SCHEDULES)
                  .filter(([id, t]) => t.category === 'periodic' && (!applicableIds || applicableIds.has(id)))
                  .map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Major">
                {Object.entries(MAINTENANCE_SCHEDULES)
                  .filter(([id, t]) => t.category === 'major' && (!applicableIds || applicableIds.has(id)))
                  .map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Full synthetic 0W-20"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Mileage and Date */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mileage *
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData((prev) => ({ ...prev, mileage: e.target.value }))}
                placeholder="50000"
                required
                min={0}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
                max={today}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Cost and Shop */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cost
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Shop/Location
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData((prev) => ({ ...prev, shopName: e.target.value }))}
                placeholder="DIY, Jiffy Lube, etc."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Next Due */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.setNextDue}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    setNextDue: checked,
                    nextDueMileage: checked && suggestedNextMileage
                      ? suggestedNextMileage.toString()
                      : '',
                  }));
                }}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Set custom next due date/mileage</span>
            </label>

            {formData.setNextDue && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Next Due Mileage</label>
                  <input
                    type="number"
                    value={formData.nextDueMileage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nextDueMileage: e.target.value }))}
                    placeholder={suggestedNextMileage?.toString() || '55000'}
                    min={parseInt(formData.mileage) || 0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nextDueDate: e.target.value }))}
                    min={formData.date}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>

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
              disabled={loading || !formData.type || !formData.mileage}
              className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
