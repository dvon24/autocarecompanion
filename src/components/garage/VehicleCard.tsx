'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaintenanceOverview } from '@/components/maintenance/MaintenanceStatusBar';
import { useGuide } from '@/hooks/useGuide';
import { useKnownIssues } from '@/hooks/useKnownIssues';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  vin?: string | null;
  color?: string | null;
  nickname?: string | null;
  isPrimary: boolean;
  currentMileage?: number | null;
  annualMileage?: number | null;
  imageUrl?: string | null;
  maintenanceRecords: Array<{
    id: string;
    type: string;
    mileage: number;
    date: string;
    nextDueMileage?: number | null;
    nextDueDate?: string | null;
  }>;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete: () => void | Promise<void>;
  onMileageUpdate?: (vehicleId: string, currentMileage: number, annualMileage: number | null) => Promise<boolean>;
}

export function VehicleCard({ vehicle, onDelete, onMileageUpdate }: VehicleCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingMileage, setEditingMileage] = useState(false);
  const [currentMileageInput, setCurrentMileageInput] = useState(vehicle.currentMileage?.toString() || '');
  const [annualMileageInput, setAnnualMileageInput] = useState(vehicle.annualMileage?.toString() || '');
  const [savingMileage, setSavingMileage] = useState(false);
  const [localMileage, setLocalMileage] = useState(vehicle.currentMileage);
  const [localAnnualMileage, setLocalAnnualMileage] = useState(vehicle.annualMileage);
  const [generatingGuideFor, setGeneratingGuideFor] = useState<string | null>(null);

  // Guide generation hook
  const {
    guide,
    isGenerating,
    hasGuide,
    generateGuide,
  } = useGuide();

  // Known issues hook
  const { issues: knownIssues, loading: knownIssuesLoading } = useKnownIssues({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? undefined,
  });

  const criticalIssuesCount = knownIssues.filter(i => i.severity === 'high').length;

  const displayName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const fullName = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;

  const handleGenerateGuide = async (maintenanceType: string) => {
    if (isGenerating) return;

    const type = MAINTENANCE_SCHEDULES[maintenanceType];
    if (!type) return;

    setGeneratingGuideFor(maintenanceType);

    // Create a diagnosis object for the maintenance task
    const taskDiagnosis = {
      id: `maintenance_${maintenanceType}_${Date.now()}`,
      title: type.name,
      description: `Routine ${type.name.toLowerCase()} maintenance for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      confidence: 'high' as const,
      possibleCauses: [],
      recommendedAction: `Perform ${type.name.toLowerCase()} following manufacturer specifications`,
    };

    // Create vehicle object for the guide API
    const vehicleForGuide = {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim || '',
    };

    await generateGuide(vehicleForGuide, taskDiagnosis);
  };

  // Navigate to guide page when guide is ready
  useEffect(() => {
    if (hasGuide && guide) {
      sessionStorage.setItem('currentGuide', JSON.stringify(guide));
      setGeneratingGuideFor(null);
      router.push('/guide');
    }
  }, [hasGuide, guide, router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveMileage = async () => {
    if (!onMileageUpdate) return;

    const newCurrentMileage = parseInt(currentMileageInput) || 0;
    const newAnnualMileage = annualMileageInput ? parseInt(annualMileageInput) : null;

    if (newCurrentMileage < 0) return;

    setSavingMileage(true);
    try {
      const success = await onMileageUpdate(vehicle.id, newCurrentMileage, newAnnualMileage);
      if (success) {
        setLocalMileage(newCurrentMileage);
        setLocalAnnualMileage(newAnnualMileage);
        setEditingMileage(false);
      }
    } catch (error) {
      console.error('Failed to update mileage:', error);
    } finally {
      setSavingMileage(false);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMileageInput(localMileage?.toString() || '');
    setAnnualMileageInput(localAnnualMileage?.toString() || '');
    setEditingMileage(false);
  };

  const lastService = vehicle.maintenanceRecords[0];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {displayName}
              </h3>
              {vehicle.isPrimary && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Primary
                </span>
              )}
              {!knownIssuesLoading && knownIssues.length > 0 && (
                <Link
                  href={`/garage/${vehicle.id}/maintenance`}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    criticalIssuesCount > 0
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                  title={`${knownIssues.length} known issue${knownIssues.length !== 1 ? 's' : ''} for this vehicle`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {criticalIssuesCount > 0 ? `${criticalIssuesCount} Critical` : `${knownIssues.length} Issue${knownIssues.length !== 1 ? 's' : ''}`}
                </Link>
              )}
            </div>
            {vehicle.nickname && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">{fullName}</p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete vehicle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* Delete confirmation popover */}
            {showDeleteConfirm && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                <p className="text-sm text-gray-700 mb-3">
                  Delete this vehicle? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-3 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mileage Section */}
        <div className="mt-4">
          {editingMileage ? (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Current Mileage
                  </label>
                  <input
                    type="number"
                    value={currentMileageInput}
                    onChange={(e) => setCurrentMileageInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 45000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Annual Miles
                  </label>
                  <input
                    type="number"
                    value={annualMileageInput}
                    onChange={(e) => setAnnualMileageInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={savingMileage}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMileage}
                  disabled={savingMileage}
                  className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {savingMileage ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Current</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">
                      {localMileage
                        ? `${localMileage.toLocaleString()} mi`
                        : 'Not set'}
                    </p>
                  </div>
                  {localAnnualMileage && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Annual</p>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">
                        ~{localAnnualMileage.toLocaleString()} mi/yr
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lastService && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Last Service</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {new Date(lastService.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {onMileageUpdate && (
                  <button
                    onClick={() => setEditingMileage(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit mileage"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Status Bars */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Maintenance Status</p>
          <MaintenanceOverview
            currentMileage={localMileage}
            annualMileage={localAnnualMileage}
            maintenanceRecords={vehicle.maintenanceRecords.map(r => ({
              ...r,
              mileage: r.mileage || 0,
              date: new Date(r.date),
            }))}
            onGenerateGuide={handleGenerateGuide}
            generatingGuideFor={generatingGuideFor}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Actions - Single button now */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
        <Link
          href={`/garage/${vehicle.id}/maintenance`}
          className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Maintenance
        </Link>
      </div>
    </div>
  );
}
