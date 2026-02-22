'use client';

import { useState, useEffect, useCallback } from 'react';

// Types matching the Prisma schema
export interface DemoVehicle {
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
  lastMileageUpdate?: string | null;
  imageUrl?: string | null;
  isPublic?: boolean;
  showcaseSlug?: string | null;
  maintenanceRecords: DemoMaintenanceRecord[];
  modifications: DemoModification[];
  mileageHistory: DemoMileageLog[];
}

export interface DemoMaintenanceRecord {
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

export interface DemoModification {
  id: string;
  category: string;
  name: string;
  brand?: string | null;
  partNumber?: string | null;
  description?: string | null;
  cost?: number | null;
  installDate?: string | null;
  imageUrl?: string | null;
  modelData?: Record<string, unknown> | null;
}

export interface DemoMileageLog {
  id: string;
  mileage: number;
  date: string;
  source?: string | null;
}

const STORAGE_KEY = 'autocare_demo_vehicles';

// Generate a unique ID
function generateId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sample demo vehicles for first-time users
const SAMPLE_VEHICLES: DemoVehicle[] = [
  {
    id: 'demo_sample_1',
    year: 2020,
    make: 'Honda',
    model: 'Accord',
    trim: 'Sport',
    color: '#1e3a5f',
    nickname: 'Daily Driver',
    isPrimary: true,
    currentMileage: 45000,
    lastMileageUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    maintenanceRecords: [
      {
        id: 'demo_maint_1',
        type: 'oil_change',
        description: 'Full synthetic oil change',
        mileage: 43000,
        cost: 65,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextDueMileage: 48000,
        shopName: 'Quick Lube',
      },
      {
        id: 'demo_maint_2',
        type: 'tire_rotation',
        mileage: 40000,
        cost: 25,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    modifications: [],
    mileageHistory: [
      { id: 'demo_mile_1', mileage: 45000, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), source: 'manual' },
      { id: 'demo_mile_2', mileage: 43000, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), source: 'manual' },
    ],
  },
];

/**
 * Hook for demo garage functionality using localStorage
 * Used when DATABASE_URL is not configured
 */
export function useDemoGarage() {
  const [vehicles, setVehicles] = useState<DemoVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Load vehicles from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVehicles(JSON.parse(stored));
      } else {
        // First time - add sample vehicles
        setVehicles(SAMPLE_VEHICLES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_VEHICLES));
      }
      setIsDemo(true);
    } catch (error) {
      console.error('Failed to load demo vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save vehicles to localStorage whenever they change
  const saveVehicles = useCallback((updatedVehicles: DemoVehicle[]) => {
    setVehicles(updatedVehicles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
  }, []);

  // Add a new vehicle
  const addVehicle = useCallback((vehicleData: Omit<DemoVehicle, 'id' | 'maintenanceRecords' | 'modifications' | 'mileageHistory'>): DemoVehicle => {
    const newVehicle: DemoVehicle = {
      ...vehicleData,
      id: generateId(),
      maintenanceRecords: [],
      modifications: [],
      mileageHistory: vehicleData.currentMileage ? [
        {
          id: generateId(),
          mileage: vehicleData.currentMileage,
          date: new Date().toISOString(),
          source: 'manual',
        }
      ] : [],
    };

    // If this is the first vehicle or marked as primary, update others
    const updatedVehicles = vehicleData.isPrimary || vehicles.length === 0
      ? vehicles.map(v => ({ ...v, isPrimary: false }))
      : [...vehicles];

    if (vehicleData.isPrimary || vehicles.length === 0) {
      newVehicle.isPrimary = true;
    }

    saveVehicles([newVehicle, ...updatedVehicles]);
    return newVehicle;
  }, [vehicles, saveVehicles]);

  // Get a single vehicle by ID
  const getVehicle = useCallback((id: string): DemoVehicle | undefined => {
    return vehicles.find(v => v.id === id);
  }, [vehicles]);

  // Update a vehicle
  const updateVehicle = useCallback((id: string, updates: Partial<DemoVehicle>): DemoVehicle | undefined => {
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex === -1) return undefined;

    const updatedVehicles = [...vehicles];
    updatedVehicles[vehicleIndex] = { ...updatedVehicles[vehicleIndex], ...updates };

    // Handle primary flag
    if (updates.isPrimary) {
      updatedVehicles.forEach((v, i) => {
        if (i !== vehicleIndex) v.isPrimary = false;
      });
    }

    saveVehicles(updatedVehicles);
    return updatedVehicles[vehicleIndex];
  }, [vehicles, saveVehicles]);

  // Delete a vehicle
  const deleteVehicle = useCallback((id: string): boolean => {
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex === -1) return false;

    const updatedVehicles = vehicles.filter(v => v.id !== id);

    // If we deleted the primary vehicle, make the first one primary
    if (vehicles[vehicleIndex].isPrimary && updatedVehicles.length > 0) {
      updatedVehicles[0].isPrimary = true;
    }

    saveVehicles(updatedVehicles);
    return true;
  }, [vehicles, saveVehicles]);

  // Update mileage
  const updateMileage = useCallback((vehicleId: string, mileage: number): boolean => {
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1) return false;

    const updatedVehicles = [...vehicles];
    const vehicle = { ...updatedVehicles[vehicleIndex] };

    vehicle.currentMileage = mileage;
    vehicle.lastMileageUpdate = new Date().toISOString();
    vehicle.mileageHistory = [
      {
        id: generateId(),
        mileage,
        date: new Date().toISOString(),
        source: 'manual',
      },
      ...vehicle.mileageHistory,
    ];

    updatedVehicles[vehicleIndex] = vehicle;
    saveVehicles(updatedVehicles);
    return true;
  }, [vehicles, saveVehicles]);

  // Add maintenance record
  const addMaintenanceRecord = useCallback((
    vehicleId: string,
    record: Omit<DemoMaintenanceRecord, 'id'>
  ): DemoMaintenanceRecord | undefined => {
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1) return undefined;

    const newRecord: DemoMaintenanceRecord = {
      ...record,
      id: generateId(),
    };

    const updatedVehicles = [...vehicles];
    const vehicle = { ...updatedVehicles[vehicleIndex] };
    vehicle.maintenanceRecords = [newRecord, ...vehicle.maintenanceRecords];

    // Update current mileage if the record's mileage is higher
    if (record.mileage > (vehicle.currentMileage || 0)) {
      vehicle.currentMileage = record.mileage;
      vehicle.lastMileageUpdate = new Date().toISOString();
    }

    updatedVehicles[vehicleIndex] = vehicle;
    saveVehicles(updatedVehicles);
    return newRecord;
  }, [vehicles, saveVehicles]);

  // Add modification
  const addModification = useCallback((
    vehicleId: string,
    mod: Omit<DemoModification, 'id'>
  ): DemoModification | undefined => {
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1) return undefined;

    const newMod: DemoModification = {
      ...mod,
      id: generateId(),
    };

    const updatedVehicles = [...vehicles];
    const vehicle = { ...updatedVehicles[vehicleIndex] };
    vehicle.modifications = [newMod, ...vehicle.modifications];

    updatedVehicles[vehicleIndex] = vehicle;
    saveVehicles(updatedVehicles);
    return newMod;
  }, [vehicles, saveVehicles]);

  // Clear all demo data
  const clearDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVehicles([]);
  }, []);

  // Reset to sample data
  const resetToSampleData = useCallback(() => {
    saveVehicles(SAMPLE_VEHICLES);
  }, [saveVehicles]);

  return {
    vehicles,
    loading,
    isDemo,
    addVehicle,
    getVehicle,
    updateVehicle,
    deleteVehicle,
    updateMileage,
    addMaintenanceRecord,
    addModification,
    clearDemoData,
    resetToSampleData,
  };
}

export default useDemoGarage;
