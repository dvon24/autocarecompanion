'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GarageAssistant } from '@/components/garage/GarageAssistant';
import { ServiceRecords } from '@/components/maintenance/ServiceRecords';
import { PageLayout } from '@/components/ui/PageLayout';
import type { ServiceRecordView } from '@/lib/service-records';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  vin?: string | null;
  nickname?: string | null;
  currentMileage?: number | null;
}

async function fetchCompleteHistory(vehicleId: string): Promise<ServiceRecordView[]> {
  const records: ServiceRecordView[] = [];
  let offset = 0;
  while (true) {
    const response = await fetch(`/api/maintenance?vehicleId=${encodeURIComponent(vehicleId)}&limit=100&offset=${offset}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.error || 'Service records could not be loaded.');
    const page = Array.isArray(payload.records) ? payload.records as ServiceRecordView[] : [];
    records.push(...page);
    if (payload.nextOffset == null) return records;
    if (!Number.isInteger(payload.nextOffset) || payload.nextOffset <= offset) throw new Error('Service history pagination returned an invalid continuation.');
    offset = payload.nextOffset;
  }
}

export function GarageServiceRecordsClient() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecordView[]>([]);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehicleResponse, historyResult] = await Promise.all([
        fetch(`/api/vehicles/${encodeURIComponent(vehicleId)}`),
        fetchCompleteHistory(vehicleId).then((history) => ({ history, error:null as string | null })).catch((cause) => ({ history:null, error:cause instanceof Error ? cause.message : 'Service records could not be loaded.' })),
      ]);
      if (vehicleResponse.status === 404) return router.replace('/garage');
      const vehiclePayload = await vehicleResponse.json().catch(() => ({}));
      if (!vehicleResponse.ok || !vehiclePayload.vehicle) throw new Error(vehiclePayload.message || vehiclePayload.error || 'Vehicle could not be loaded.');
      setVehicle(vehiclePayload.vehicle);
      if (historyResult.history) {
        setRecords(historyResult.history);
        setRecordsError(null);
      } else setRecordsError(historyResult.error);
    } catch (cause) {
      setRecordsError(cause instanceof Error ? cause.message : 'Service records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [router, vehicleId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/subscribe');
    else if (status === 'authenticated' && vehicleId) void fetchData();
  }, [fetchData, router, status, vehicleId]);

  const deleteRecord = async (recordId: string) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    const response = await fetch(`/api/maintenance/${encodeURIComponent(recordId)}`, { method:'DELETE' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.error || 'Could not delete this record.');
    setRecords((current) => current.filter((record) => record.id !== recordId));
  };

  if (status === 'loading' || loading) return <PageLayout backLink={{ href:'/garage', label:'Back to Garage' }}><div className="grid min-h-[45vh] place-items-center text-sm text-slate-500">Loading service records…</div></PageLayout>;
  if (!vehicle) return <PageLayout backLink={{ href:'/garage', label:'Back to Garage' }}><div className="grid min-h-[45vh] place-items-center px-6 text-center text-sm text-slate-600">{recordsError || 'Vehicle not found.'}</div></PageLayout>;

  return (
    <PageLayout backLink={{ href:'/garage', label:'Back to Garage' }}>
      <ServiceRecords
        vehicle={vehicle}
        records={records}
        recordsError={recordsError}
        onRetry={fetchData}
        onRecordAdded={(record) => {
          setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
          setVehicle((current) => current && record.mileage > (current.currentMileage ?? 0) ? { ...current, currentMileage:record.mileage } : current);
          setRecordsError(null);
        }}
        onDeleteRecord={deleteRecord}
      />
      <GarageAssistant vehicleId={vehicle.id} vehicleName={vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`} onActionComplete={fetchData}/>
    </PageLayout>
  );
}
