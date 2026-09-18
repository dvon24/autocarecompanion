'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageLayout, ContentCard } from '@/components/ui/PageLayout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { VehicleCard } from '@/components/garage/VehicleCard';
import { AddVehicleModal } from '@/components/garage/AddVehicleModal';
import { GarageAssistant } from '@/components/garage/GarageAssistant';
import { useGarage, Vehicle } from '@/contexts/GarageContext';
import { GarageTwinActions } from '@/components/account/GarageTwinActions';

interface NewVehiclePrompt {
  vehicleName: string;
  vehicleId: string;
}

/**
 * Client garage page — vehicle list + add/edit flow.
 *
 * Now used only for two cases:
 *   1. Anonymous users (demo mode, localStorage-backed garage)
 *   2. Signed-in users with NO saved vehicles yet (empty state)
 *
 * Signed-in users WITH vehicles are redirected at /garage/page.tsx
 * (server component) directly to /vehicle/{slug} for their primary
 * vehicle. The expectation is that the hub IS your garage when
 * you're signed in with a car saved.
 */
export default function GarageClient({ ownerSettings = false }: { ownerSettings?: boolean } = {}) {
  const { vehicles, loading, isDemo, error: garageError, deleteVehicle, addVehicle, refreshVehicles, updateVehicle } = useGarage();
  // ?add=1 (from the hub's "Add a vehicle") opens the add flow straight away.
  const searchParams = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(() => searchParams.get('add') === '1');
  const [newVehiclePrompt, setNewVehiclePrompt] = useState<NewVehiclePrompt | null>(null);

  const handleVehicleAdded = async (vehicleData: Omit<Vehicle, 'id' | 'maintenanceRecords' | 'modifications' | 'mileageHistory'>) => {
    const newVehicle = await addVehicle(vehicleData);
    setShowAddModal(false);

    // Trigger the assistant to prompt about maintenance setup (only for authenticated users)
    if (newVehicle && !isDemo) {
      const vehicleName = vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
      setNewVehiclePrompt({
        vehicleName,
        vehicleId: newVehicle.id,
      });
    }
  };

  const handleVehicleDeleted = async (id: string) => {
    if (!await deleteVehicle(id)) throw new Error('The deletion was not confirmed. Your saved vehicle has not been removed from this list. Refresh to check before trying again.');
  };

  const handleMileageUpdate = async (vehicleId: string, currentMileage: number | null, annualMileage: number | null): Promise<boolean> => {
    const result = await updateVehicle(vehicleId, {
      currentMileage,
      annualMileage,
      lastMileageUpdate: new Date().toISOString()
    });
    if (result) {
      await refreshVehicles();
    }
    return !!result;
  };

  if (loading && !(ownerSettings && !isDemo)) {
    return (
      <PageLayout backLink={{ href: ownerSettings ? '/account' : '/', label: ownerSettings ? 'Account' : 'Home' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // A failed authenticated load must never silently switch this screen to local demo data.
  if (ownerSettings && isDemo) return <PageLayout backLink={{href:'/account',label:'Account'}}>
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Saved vehicle settings</h1>
      <p role="alert" className="mt-4 text-red-700">We could not load your saved vehicles. No demo vehicles or editing controls are shown.</p>
      <a href="/garage?manage=1" className="mt-4 inline-block text-blue-700 underline">Retry loading saved vehicles</a>
      <Link href="/account" className="mt-4 ml-5 inline-block text-blue-700 underline">Return to Account</Link>
    </main>
  </PageLayout>;

  if (ownerSettings) return <PageLayout backLink={{href:'/account',label:'Account'}}>
    <main className="ki-theme-warm max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-semibold text-slate-900">Saved vehicle settings</h1><p className="text-sm text-slate-600 mt-2">Update mileage estimates or remove a vehicle. Open its Hub for parts and service.</p></div>
        <GarageTwinActions onVehicleAdded={() => { void refreshVehicles(); }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {garageError && <div role="alert" className="md:col-span-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p>We could not refresh your saved vehicles. This list may be out of date, including a vehicle you just saved. Do not add it again before checking.</p>
          <a href="/garage?manage=1" className="inline-block mt-2 text-blue-700 underline">Reload saved vehicle settings</a>
          <Link href="/account" className="inline-block mt-2 ml-4 text-blue-700 underline">Return to Account</Link>
        </div>}
        {vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} settingsOnly onDelete={() => handleVehicleDeleted(vehicle.id)} onMileageUpdate={handleMileageUpdate} />)}
      </div>
        {vehicles.length === 0 && !garageError && <p className="text-sm text-slate-600">No saved vehicles. Use Add vehicle to choose an available Twin, or request yours.</p>}
      <Link href="/account" className="inline-block mt-6 text-blue-700 underline">Return to Account</Link>
    </main>
  </PageLayout>;

  return (
    <PageLayout backLink={{ href: '/', label: 'Home' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Demo Mode Banner — anonymous users see this. Honest about
            current state: data is local-only, accounts + sync are still
            being finalized. */}
        {isDemo && (
          <ScrollReveal delay={0} duration={500}>
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    Demo Mode <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded">Beta</span>
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your garage data is stored locally in your browser for now. Cross-device sync,
                    push notifications, and SMS maintenance reminders are still in active development —
                    Public account enrollment is currently closed.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Header */}
        <ScrollReveal delay={50} duration={500}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Garage</h1>
              <p className="text-gray-500 mt-1">
                {vehicles.length === 0
                  ? 'Add your first vehicle to get started'
                  : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Vehicle
            </button>
          </div>
        </ScrollReveal>

        {/* Vehicle Grid */}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((vehicle, index) => (
              <ScrollReveal key={vehicle.id} delay={100 + index * 50} duration={500}>
                <VehicleCard
                  vehicle={vehicle}
                  onDelete={() => handleVehicleDeleted(vehicle.id)}
                  onMileageUpdate={handleMileageUpdate}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Empty State */}
        {vehicles.length === 0 && (
          <ScrollReveal delay={100} duration={500}>
            <ContentCard className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your garage is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add your first vehicle to start tracking maintenance and get
                personalized reminders.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Your First Vehicle
              </button>
            </ContentCard>
          </ScrollReveal>
        )}

        {/* Subscribe CTA for demo users */}
        {isDemo && vehicles.length > 0 && (
          <ScrollReveal delay={200} duration={500}>
            <ContentCard className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Unlock Full Features</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sync across devices, get maintenance reminders, and unlock AI assistant
                  </p>
                </div>
                <Link
                  href="/subscribe"
                  className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Subscribe — from $14.99/mo
                </Link>
              </div>
            </ContentCard>
          </ScrollReveal>
        )}

        {/* Add Vehicle Modal */}
        {showAddModal && (
          <AddVehicleModal
            onClose={() => setShowAddModal(false)}
            onVehicleAdded={handleVehicleAdded}
          />
        )}
      </div>

      {/* AI Garage Assistant - Only for authenticated users */}
      {!isDemo && (
        <GarageAssistant
          onActionComplete={refreshVehicles}
          newVehiclePrompt={newVehiclePrompt ?? undefined}
          onNewVehiclePromptShown={() => setNewVehiclePrompt(null)}
        />
      )}
    </PageLayout>
  );
}
