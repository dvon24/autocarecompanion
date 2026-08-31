'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageLayout, ContentCard } from '@/components/ui/PageLayout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { LogMaintenanceModal } from '@/components/maintenance/LogMaintenanceModal';
import { GarageAssistant } from '@/components/garage/GarageAssistant';
import { ServiceRecords } from '@/components/maintenance/ServiceRecords';
import { useGuide } from '@/hooks/useGuide';
import { useKnownIssues } from '@/hooks/useKnownIssues';
import { useRecalls } from '@/hooks/useRecalls';
import { useIssueFixes } from '@/hooks/useIssueFixes';
import { KnownIssueCard } from '@/components/known-issues/KnownIssueCard';
import {
  MAINTENANCE_SCHEDULES,
  getAllMaintenanceStatuses,
  getApplicableSchedules,
  getVehicleSpecs,
  getSpecsForMaintenanceType,
  getResolvedMileage,
  type MaintenanceStatusResult,
  type VehicleContext,
  type ResolvedSchedule,
} from '@/lib/maintenance';

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
  receiptUrl?: string | null;
  shopName?: string | null;
  createdAt?: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  vin?: string | null;
  nickname?: string | null;
  currentMileage?: number | null;
  annualMileage?: number | null;
  lastMileageUpdate?: string | null;
  modifications?: Array<{ id: string; name: string; cost?: number | null }>;
}

type FilterType = 'all' | 'routine' | 'periodic' | 'major';

async function fetchCompleteMaintenanceHistory(vehicleId: string): Promise<MaintenanceRecord[]> {
  const records: MaintenanceRecord[] = [];
  let offset = 0;
  while (true) {
    const response = await fetch(`/api/maintenance?vehicleId=${encodeURIComponent(vehicleId)}&limit=100&offset=${offset}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.error || 'Service records could not be loaded.');
    const page = Array.isArray(payload.records) ? payload.records as MaintenanceRecord[] : [];
    records.push(...page);
    if (payload.nextOffset == null) return records;
    if (!Number.isInteger(payload.nextOffset) || payload.nextOffset <= offset) {
      throw new Error('Service history pagination returned an invalid continuation.');
    }
    offset = payload.nextOffset;
  }
}

export default function MaintenancePage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [editingMileage, setEditingMileage] = useState(false);
  const [mileageInput, setMileageInput] = useState('');
  const [annualMileageInput, setAnnualMileageInput] = useState('');
  const [savingMileage, setSavingMileage] = useState(false);
  const [generatingGuideFor, setGeneratingGuideFor] = useState<string | null>(null);
  const [showKnownIssues, setShowKnownIssues] = useState(false);
  const [showJackPoints, setShowJackPoints] = useState(false);

  const vehicleId = params.id as string;

  // Guide generation hook
  const {
    guide,
    isGenerating,
    hasGuide,
    error: guideError,
    generateGuide,
  } = useGuide();

  // Known issues hook - fetch once vehicle is loaded
  const {
    issues: knownIssues,
    loading: knownIssuesLoading,
  } = useKnownIssues({
    year: vehicle?.year ?? 0,
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    trim: vehicle?.trim ?? undefined,
  });

  // NHTSA recall alerts
  const {
    recalls,
    loading: recallsLoading,
    criticalCount: recallCriticalCount,
  } = useRecalls({
    year: vehicle?.year ?? 0,
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    vin: vehicle?.vin,
  });

  const [showRecalls, setShowRecalls] = useState(false);

  // User's fixes for known issues
  const {
    refetch: refetchFixes,
    getFixForIssue,
  } = useIssueFixes({
    vehicleId: vehicleId,
  });

  const fetchData = useCallback(async () => {
    try {
      const [vehicleRes, historyResult] = await Promise.all([
        fetch(`/api/vehicles/${vehicleId}`),
        fetchCompleteMaintenanceHistory(vehicleId)
          .then((history) => ({ history, error: null as string | null }))
          .catch((cause) => ({
            history: null,
            error: cause instanceof Error ? cause.message : 'Service records could not be loaded.',
          })),
      ]);

      if (vehicleRes.ok) {
        const data = await vehicleRes.json();
        setVehicle(data.vehicle);
        setMileageInput(data.vehicle.currentMileage?.toString() || '');
        setAnnualMileageInput(data.vehicle.annualMileage?.toString() || '');
      } else if (vehicleRes.status === 404) {
        router.push('/garage');
        return;
      }

      if (historyResult.history) {
        setRecords(historyResult.history);
        setRecordsError(null);
      } else {
        setRecordsError(historyResult.error || 'Service records could not be loaded.');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRecordsError('Service records could not be loaded. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [vehicleId, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/subscribe');
      return;
    }

    if (status === 'authenticated' && vehicleId) {
      fetchData();
    }
  }, [status, vehicleId, router, fetchData]);

  const handleRecordAdded = (record: MaintenanceRecord) => {
    setRecords((prev) => [record, ...prev]);
    setRecordsError(null);
    setVehicle((current) => current && record.mileage > (current.currentMileage ?? 0)
      ? { ...current, currentMileage: record.mileage, lastMileageUpdate: new Date().toISOString() }
      : current);
    setShowLogModal(false);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Delete this maintenance record?')) return;

    try {
      const res = await fetch(`/api/maintenance/${recordId}`, {
        method: 'DELETE',
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || payload.error || 'Could not delete this record.');
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    }
  };

  const handleSaveMileage = async () => {
    if (!vehicle) return;

    const newMileage = parseInt(mileageInput) || 0;
    const newAnnualMileage = annualMileageInput ? parseInt(annualMileageInput) : null;

    setSavingMileage(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMileage: newMileage,
          annualMileage: newAnnualMileage,
        }),
      });

      if (res.ok) {
        setVehicle({
          ...vehicle,
          currentMileage: newMileage,
          annualMileage: newAnnualMileage,
          lastMileageUpdate: new Date().toISOString(),
        });
        setEditingMileage(false);
      }
    } catch (error) {
      console.error('Failed to update mileage:', error);
    } finally {
      setSavingMileage(false);
    }
  };

  // Handle guide generation for a maintenance type
  const handleGenerateGuide = async (typeId: string) => {
    if (!vehicle || isGenerating) return;

    const maintenanceType = MAINTENANCE_SCHEDULES[typeId];
    if (!maintenanceType) return;

    setGeneratingGuideFor(typeId);

    // Create a diagnosis object for the maintenance task
    const taskDiagnosis = {
      id: `maintenance_${typeId}_${Date.now()}`,
      title: maintenanceType.name,
      description: `Routine ${maintenanceType.name.toLowerCase()} maintenance for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      confidence: 'high' as const,
      possibleCauses: [],
      recommendedAction: `Perform ${maintenanceType.name.toLowerCase()} following manufacturer specifications`,
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

  // Clear generating state on error
  useEffect(() => {
    if (guideError) {
      setGeneratingGuideFor(null);
    }
  }, [guideError]);

  if (status === 'loading' || loading) {
    return (
      <PageLayout backLink={{ href: '/garage', label: 'Back to Garage' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!vehicle) {
    return (
      <PageLayout backLink={{ href: '/garage', label: 'Back to Garage' }}>
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle not found</h1>
          <Link href="/garage" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to garage
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (searchParams.get('view') === 'history') {
    return (
      <PageLayout backLink={{ href: `/garage/${vehicleId}/maintenance`, label: 'Maintenance status' }}>
        <ServiceRecords
          vehicle={vehicle}
          records={records}
          recordsError={recordsError}
          onRetry={fetchData}
          onRecordAdded={handleRecordAdded}
          onDeleteRecord={handleDeleteRecord}
        />
        <GarageAssistant
          vehicleId={vehicle.id}
          vehicleName={vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          onActionComplete={fetchData}
        />
      </PageLayout>
    );
  }

  const displayName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const totalSpent = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Build vehicle context for vehicle-specific schedules
  const vehicleContext: VehicleContext = {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    trim: vehicle.trim || undefined,
  };

  // Get applicable schedules for this vehicle
  const applicableSchedules = getApplicableSchedules(vehicleContext);

  // Look up vehicle specs for display
  const vehicleSpecs = getVehicleSpecs({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim || undefined,
  });

  // Get maintenance statuses using vehicle-specific intervals.
  // Pass year + annualMileage + lastMileageUpdate so the helper can estimate when the user
  // hasn't filled in a current mileage yet.
  const statusVehicle = {
    year: vehicle.year,
    currentMileage: vehicle.currentMileage,
    lastMileageUpdate: vehicle.lastMileageUpdate ? new Date(vehicle.lastMileageUpdate) : null,
    annualMileage: vehicle.annualMileage,
  };
  const statuses = getAllMaintenanceStatuses(
    statusVehicle,
    records.map((r) => ({
      ...r,
      date: new Date(r.date),
      nextDueDate: r.nextDueDate ? new Date(r.nextDueDate) : null,
    })),
    vehicleContext
  );
  const resolvedMileage = getResolvedMileage(statusVehicle);

  // Filter applicable schedules by category
  const filteredTypes: [string, ResolvedSchedule][] = applicableSchedules
    .filter((s) => filter === 'all' || s.category === filter)
    .map((s) => [s.id, s] as [string, ResolvedSchedule]);

  const getStatusIcon = (status: MaintenanceStatusResult['status']) => {
    switch (status) {
      case 'ok':
        return '✓';
      case 'due_soon':
        return '⚠';
      case 'overdue':
        return '!';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: MaintenanceStatusResult['status']) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-700';
      case 'due_soon':
        return 'bg-orange-100 text-orange-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const typeRecords = selectedType
    ? records.filter((r) => r.type === selectedType)
    : records;

  return (
    <PageLayout backLink={{ href: '/garage', label: 'Back to Garage' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <ScrollReveal delay={0} duration={500}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500 mt-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.trim ? ` ${vehicle.trim}` : ''}
              </p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log Maintenance
            </button>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <ScrollReveal delay={50} duration={500}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Current Mileage - Editable */}
            <div
              onClick={() => !editingMileage && setEditingMileage(true)}
              className={`cursor-pointer transition-all ${editingMileage ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
            >
              <ContentCard
                className={`p-5 ${!editingMileage ? 'hover:bg-gray-50' : ''}`}
              >
                {editingMileage ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-gray-500">Current Mileage</p>
                    <input
                      type="number"
                      value={mileageInput}
                      onChange={(e) => setMileageInput(e.target.value)}
                      className="w-full px-2 py-1 text-lg font-bold border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setMileageInput(vehicle.currentMileage?.toString() || '');
                          setEditingMileage(false);
                        }}
                        className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMileage}
                        disabled={savingMileage}
                        className="flex-1 px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Current Mileage</p>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {vehicle.currentMileage
                        ? `${vehicle.currentMileage.toLocaleString()}`
                        : resolvedMileage.mileage
                          ? `~${resolvedMileage.mileage.toLocaleString()}`
                          : '—'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {vehicle.currentMileage
                        ? 'miles'
                        : resolvedMileage.isEstimated
                          ? 'miles (estimated)'
                          : 'miles'}
                    </p>
                  </>
                )}
              </ContentCard>
            </div>

            <ContentCard className="p-5">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalSpent.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">on maintenance</p>
            </ContentCard>

            <ContentCard className="p-5">
              <p className="text-sm text-gray-500">Services</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {records.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">logged</p>
            </ContentCard>

            <ContentCard className="p-5">
              <p className="text-sm text-gray-500">Annual Miles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {vehicle.annualMileage ? `${vehicle.annualMileage.toLocaleString()}` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">per year</p>
            </ContentCard>
          </div>
        </ScrollReveal>

        {/* Vehicle Specs Section */}
        {vehicleSpecs && (
          <ScrollReveal delay={60} duration={500}>
            <ContentCard className="p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Vehicle Specs</h2>
                  <p className="text-sm text-gray-500">{vehicleSpecs.engine}</p>
                </div>
              </div>

              {/* Safety Warnings */}
              {vehicleSpecs.safety && vehicleSpecs.safety.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-amber-800">Safety Notes</span>
                  </div>
                  <ul className="space-y-1">
                    {vehicleSpecs.safety.map((note, i) => (
                      <li key={i} className="text-sm text-amber-800 flex gap-2">
                        <span className="text-amber-400 flex-shrink-0">&#8226;</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick reference specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {vehicleSpecs.oil && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Oil</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicleSpecs.oil.type}</p>
                    <p className="text-xs text-gray-600">{vehicleSpecs.oil.capacity} &middot; Filter: {vehicleSpecs.oil.filterPartNumber}</p>
                  </div>
                )}
                {vehicleSpecs.coolant && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Coolant</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicleSpecs.coolant.type}</p>
                    <p className="text-xs text-gray-600">{vehicleSpecs.coolant.capacity}</p>
                  </div>
                )}
                {vehicleSpecs.transmission && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Transmission</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicleSpecs.transmission.type}</p>
                    <p className="text-xs text-gray-600">{vehicleSpecs.transmission.capacity}</p>
                  </div>
                )}
                {vehicleSpecs.sparkPlugs && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Spark Plugs</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicleSpecs.sparkPlugs.partNumber}</p>
                    <p className="text-xs text-gray-600">Gap: {vehicleSpecs.sparkPlugs.gap} &middot; Qty: {vehicleSpecs.sparkPlugs.quantity}</p>
                  </div>
                )}
              </div>

              {/* Lug spec line */}
              {vehicleSpecs.lug && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                  <span className="font-medium">Lug {vehicleSpecs.lug.useBolts ? 'Bolts' : 'Nuts'}:</span>
                  <span>{vehicleSpecs.lug.size} @ {vehicleSpecs.lug.torque}</span>
                </div>
              )}

              {/* Jack Points - collapsible */}
              {vehicleSpecs.jackPoints && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowJackPoints(!showJackPoints)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">Jack Points</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${showJackPoints ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showJackPoints && (
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Front</p>
                        <p className="text-sm text-gray-800">{vehicleSpecs.jackPoints.front}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Rear</p>
                        <p className="text-sm text-gray-800">{vehicleSpecs.jackPoints.rear}</p>
                      </div>
                      {vehicleSpecs.jackPoints.frontLift && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">Front Lift Point</p>
                          <p className="text-sm text-gray-800">{vehicleSpecs.jackPoints.frontLift}</p>
                        </div>
                      )}
                      {vehicleSpecs.jackPoints.rearLift && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">Rear Lift Point</p>
                          <p className="text-sm text-gray-800">{vehicleSpecs.jackPoints.rearLift}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ContentCard>
          </ScrollReveal>
        )}

        {/* Known Issues Section */}
        {!knownIssuesLoading && knownIssues.length > 0 && (
          <ScrollReveal delay={75} duration={500}>
            <ContentCard className="p-0 mb-8 overflow-hidden">
              <button
                onClick={() => setShowKnownIssues(!showKnownIssues)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-gray-900">Known Issues</h2>
                    <p className="text-sm text-gray-500">
                      {knownIssues.filter(i => i.severity === 'high').length > 0 && (
                        <span className="text-red-600 font-medium">
                          {knownIssues.filter(i => i.severity === 'high').length} critical
                        </span>
                      )}
                      {knownIssues.filter(i => i.severity === 'high').length > 0 && knownIssues.length > knownIssues.filter(i => i.severity === 'high').length && ' · '}
                      {knownIssues.length} total issue{knownIssues.length !== 1 ? 's' : ''} documented
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showKnownIssues ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showKnownIssues && (
                <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                  {knownIssues
                    .sort((a, b) => {
                      const severityOrder = { high: 0, medium: 1, low: 2 };
                      return severityOrder[a.severity] - severityOrder[b.severity];
                    })
                    .map((issue) => (
                      <KnownIssueCard
                        key={issue.id}
                        issue={issue}
                        vehicleInfo={{
                          year: vehicle.year,
                          make: vehicle.make,
                          model: vehicle.model,
                          trim: vehicle.trim ?? undefined,
                        }}
                        vehicleId={vehicle.id}
                        userFix={getFixForIssue(issue.id)}
                        onFixUpdated={refetchFixes}
                      />
                    ))}
                </div>
              )}
            </ContentCard>
          </ScrollReveal>
        )}

        {/* NHTSA Recall Alerts */}
        {!recallsLoading && recalls.length > 0 && (
          <ScrollReveal delay={80} duration={500}>
            <ContentCard className="p-0 mb-8 overflow-hidden">
              <button
                onClick={() => setShowRecalls(!showRecalls)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    recallCriticalCount > 0 ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <svg className={`w-5 h-5 ${recallCriticalCount > 0 ? 'text-red-600' : 'text-orange-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-gray-900">NHTSA Recall Alerts</h2>
                    <p className="text-sm text-gray-500">
                      {recallCriticalCount > 0 && (
                        <span className="text-red-600 font-medium">
                          {recallCriticalCount} safety-critical
                        </span>
                      )}
                      {recallCriticalCount > 0 && recalls.length > recallCriticalCount && ' · '}
                      {recalls.length} recall{recalls.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showRecalls ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showRecalls && (
                <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                  {recalls.map((recall) => (
                    <div
                      key={recall.campaignNumber}
                      className={`rounded-lg border p-4 ${
                        recall.severity === 'critical'
                          ? 'border-red-200 bg-red-50'
                          : recall.severity === 'high'
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            recall.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : recall.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {recall.severity === 'critical' ? 'DO NOT DRIVE' : recall.severity.toUpperCase()}
                          </span>
                          {recall.parkIt && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-200 text-red-900">
                              PARK IT
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(recall.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{recall.component}</h3>
                      <p className="text-sm text-gray-700 mb-2">{recall.summary}</p>
                      {recall.consequence && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">Risk: </span>
                          <span className="text-sm text-gray-700">{recall.consequence}</span>
                        </div>
                      )}
                      {recall.remedy && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">Remedy: </span>
                          <span className="text-sm text-gray-700">{recall.remedy}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60">
                        <span className="text-xs text-gray-400">Campaign #{recall.campaignNumber}</span>
                        <a
                          href={`https://www.nhtsa.gov/recalls?nhtsaId=${recall.campaignNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View on NHTSA.gov
                        </a>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-2">
                    Recall data from NHTSA. Contact your dealer to verify recall status and schedule repairs. Recalls are typically repaired at no cost.
                  </p>
                </div>
              )}
            </ContentCard>
          </ScrollReveal>
        )}

        {/* Category Filter */}
        <ScrollReveal delay={100} duration={500}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'routine', 'periodic', 'major'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setSelectedType(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Maintenance Schedule Grid */}
        <ScrollReveal delay={150} duration={500}>
          <ContentCard className="p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Maintenance Schedule
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.map(([typeId, type]) => {
                const typeStatus = statuses[typeId];
                const dueAtMileage = typeStatus.dueAtMileage;
                const isUrgent = typeStatus.status === 'overdue' || typeStatus.status === 'due_soon';

                return (
                  <div
                    key={typeId}
                    className={`p-4 rounded-xl transition-all ${
                      selectedType === typeId
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : typeStatus.status === 'overdue'
                          ? 'bg-red-50 border border-red-200'
                          : typeStatus.status === 'due_soon'
                            ? 'bg-orange-50 border border-orange-200'
                            : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {type.icon === 'droplet' && '🛢️'}
                          {type.icon === 'refresh-cw' && '🔄'}
                          {type.icon === 'cloud-rain' && '🧹'}
                          {type.icon === 'disc' && '🛑'}
                          {type.icon === 'wind' && '💨'}
                          {type.icon === 'air-vent' && '🌬️'}
                          {type.icon === 'crosshair' && '🎯'}
                          {type.icon === 'settings' && '⚙️'}
                          {type.icon === 'thermometer' && '❄️'}
                          {type.icon === 'droplets' && '💧'}
                          {type.icon === 'filter' && '⛽'}
                          {type.icon === 'git-branch' && '🔀'}
                          {type.icon === 'box' && '📦'}
                          {type.icon === 'navigation' && '🧭'}
                          {type.icon === 'zap' && '⚡'}
                          {type.icon === 'link' && '🔗'}
                          {type.icon === 'repeat' && '🔁'}
                          {type.icon === 'battery-charging' && '🔋'}
                          {type.icon === 'battery-full' && '🔌'}
                        </span>
                        <span className="font-semibold text-gray-900">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {typeStatus.isEstimated && (
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium uppercase tracking-wide">
                            est
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(
                            typeStatus.status
                          )}`}
                        >
                          {getStatusIcon(typeStatus.status)} {typeStatus.status === 'ok' ? 'OK' : typeStatus.status === 'due_soon' ? 'Soon' : typeStatus.status === 'overdue' ? 'Overdue' : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Due info */}
                    <div className="mb-3">
                      <p className={`text-sm font-medium ${
                        typeStatus.status === 'overdue' ? 'text-red-700' :
                        typeStatus.status === 'due_soon' ? 'text-orange-700' :
                        'text-gray-700'
                      }`}>
                        {typeStatus.status === 'overdue' && typeStatus.milesUntilDue
                          ? `Overdue by ${Math.abs(typeStatus.milesUntilDue).toLocaleString()} mi`
                          : dueAtMileage
                            ? `Due @ ${dueAtMileage.toLocaleString()} mi`
                            : typeStatus.message
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Every {(type as ResolvedSchedule).intervalMiles?.toLocaleString() ?? type.defaultIntervalMiles.toLocaleString()} mi or {(type as ResolvedSchedule).intervalMonths ?? type.defaultIntervalMonths} mo
                      </p>
                    </div>

                    {/* Per-card vehicle specs */}
                    {(() => {
                      const cardSpecs = vehicleSpecs ? getSpecsForMaintenanceType(typeId, {
                        year: vehicle.year,
                        make: vehicle.make,
                        model: vehicle.model,
                        trim: vehicle.trim || undefined,
                      }) : null;
                      if (!cardSpecs) return null;
                      const entries = Object.entries(cardSpecs);
                      const shown = entries.slice(0, 3);
                      const extra = entries.length - 3;
                      return (
                        <div className="mb-3 px-2 py-1.5 bg-white/60 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-700">
                            {shown.map(([k, v], i) => (
                              <span key={k}>
                                {i > 0 && <span className="text-gray-300"> &middot; </span>}
                                <span className="font-medium">{v}</span>
                              </span>
                            ))}
                            {extra > 0 && <span className="text-gray-400"> +{extra} more</span>}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedType(selectedType === typeId ? null : typeId)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleGenerateGuide(typeId)}
                        disabled={isGenerating}
                        className={`flex-1 px-3 py-2 text-xs font-medium text-center rounded-lg transition-colors ${
                          generatingGuideFor === typeId
                            ? 'bg-blue-100 text-blue-400 cursor-wait'
                            : isUrgent
                              ? 'text-white bg-blue-600 hover:bg-blue-700'
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        } ${isGenerating && generatingGuideFor !== typeId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {generatingGuideFor === typeId ? (
                          <span className="flex items-center justify-center gap-1">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Generating...
                          </span>
                        ) : (
                          'Get Guide'
                        )}
                      </button>
                      {isUrgent && (
                        <button
                          onClick={() => {
                            setSelectedType(typeId);
                            setShowLogModal(true);
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Log It
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentCard>
        </ScrollReveal>

        {/* Maintenance History */}
        <ScrollReveal delay={200} duration={500}>
          <ContentCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedType
                  ? `${MAINTENANCE_SCHEDULES[selectedType]?.name || selectedType} History`
                  : 'All Maintenance History'}
              </h2>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                  href={`/garage/${vehicleId}/maintenance?view=history`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Full service records
                </Link>
              {selectedType && (
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Show all
                </button>
              )}
              </div>
            </div>

            {typeRecords.length > 0 ? (
              <div className="space-y-3">
                {typeRecords.map((record) => {
                  const maintenanceType = MAINTENANCE_SCHEDULES[record.type];
                  return (
                    <div
                      key={record.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-xl group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 mt-0.5">
                          <span className="text-lg">
                            {maintenanceType?.icon === 'droplet' && '🛢️'}
                            {maintenanceType?.icon === 'refresh-cw' && '🔄'}
                            {maintenanceType?.icon === 'cloud-rain' && '🧹'}
                            {maintenanceType?.icon === 'disc' && '🛑'}
                            {maintenanceType?.icon === 'wind' && '💨'}
                            {maintenanceType?.icon === 'air-vent' && '🌬️'}
                            {maintenanceType?.icon === 'crosshair' && '🎯'}
                            {maintenanceType?.icon === 'settings' && '⚙️'}
                            {maintenanceType?.icon === 'thermometer' && '❄️'}
                            {maintenanceType?.icon === 'droplets' && '💧'}
                            {maintenanceType?.icon === 'filter' && '⛽'}
                            {maintenanceType?.icon === 'git-branch' && '🔀'}
                            {maintenanceType?.icon === 'box' && '📦'}
                            {maintenanceType?.icon === 'navigation' && '🧭'}
                            {maintenanceType?.icon === 'zap' && '⚡'}
                            {maintenanceType?.icon === 'link' && '🔗'}
                            {maintenanceType?.icon === 'repeat' && '🔁'}
                            {maintenanceType?.icon === 'battery-charging' && '🔋'}
                            {maintenanceType?.icon === 'battery-full' && '🔌'}
                            {!maintenanceType && '🔧'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {maintenanceType?.name || record.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.mileage.toLocaleString()} mi ·{' '}
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          {record.description && (
                            <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                          )}
                          {record.shopName && (
                            <p className="text-xs text-gray-400 mt-1">@ {record.shopName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {record.cost && (
                          <span className="text-sm font-medium text-gray-900">
                            ${record.cost.toFixed(0)}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete record"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">
                  {selectedType
                    ? `No ${MAINTENANCE_SCHEDULES[selectedType]?.name.toLowerCase() || selectedType} records yet`
                    : 'No maintenance records yet'}
                </p>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Log your first service
                </button>
              </div>
            )}
          </ContentCard>
        </ScrollReveal>

        {/* Log Maintenance Modal */}
        {showLogModal && (
          <LogMaintenanceModal
            vehicleId={vehicleId}
            currentMileage={vehicle.currentMileage}
            preselectedType={selectedType}
            vehicleContext={vehicleContext}
            onClose={() => setShowLogModal(false)}
            onRecordAdded={handleRecordAdded}
          />
        )}
      </div>

      {/* AI Garage Assistant with maintenance context */}
      <GarageAssistant
        onActionComplete={fetchData}
        vehicleId={vehicleId}
        vehicleName={displayName}
        maintenanceStatuses={Object.entries(statuses).map(([typeId, status]) => ({
          type: typeId,
          typeName: MAINTENANCE_SCHEDULES[typeId]?.name || typeId,
          status: status.status,
          message: status.message,
        }))}
      />
    </PageLayout>
  );
}
