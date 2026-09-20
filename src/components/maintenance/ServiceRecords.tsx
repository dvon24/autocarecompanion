'use client';

import { useMemo, useState } from 'react';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { serviceRecordEntry } from '@/lib/service-record-entry';
import { ServiceReview } from './ServiceReview';
import {
  MAINTENANCE_SCHEDULES,
} from '@/lib/maintenance';
import {
  calculateServiceRecordMetrics,
  classifyServiceProvider,
  filterServiceRecords,
  groupServiceRecordsByYear,
  sortServiceRecords,
  type ServiceRecordFilter,
  type ServiceRecordView,
} from '@/lib/service-records';

export interface ServiceRecordsVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  nickname?: string | null;
  vin?: string | null;
  currentMileage?: number | null;
  transmission?: string | null;
  reviewedEquipmentId?: string | null;
}

interface Props {
  vehicle: ServiceRecordsVehicle;
  records: ServiceRecordView[];
  recordsError?: string | null;
  onRetry?: () => Promise<void> | void;
  onRecordAdded: (record: ServiceRecordView) => void;
  onDeleteRecord?: (recordId: string) => Promise<void> | void;
  canManageMaintenance?: boolean;
  onReviewSaved?: () => Promise<void> | void;
}

const FILTERS: Array<{ id: ServiceRecordFilter; label: string }> = [
  { id: 'all', label: 'Everything' },
  { id: 'dealer', label: 'Dealer' },
  { id: 'independent', label: 'Independent' },
  { id: 'tire_shop', label: 'Tire shop' },
  { id: 'owner', label: 'You' },
];

const PROVIDERS = {
  dealer: { label: 'Dealer', dot: 'bg-blue-600', badge: 'bg-blue-600 text-white' },
  independent: { label: 'Independent', dot: 'bg-violet-600', badge: 'bg-violet-600 text-white' },
  tire_shop: { label: 'Tire shop', dot: 'bg-cyan-600', badge: 'bg-cyan-600 text-white' },
  owner: { label: 'You', dot: 'bg-emerald-600', badge: 'bg-emerald-600 text-white' },
} as const;

function recordName(record: ServiceRecordView): string {
  return MAINTENANCE_SCHEDULES[record.type]?.name || record.description || record.type.replaceAll('_', ' ');
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return 'Date unavailable';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#dfd9cb] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(11,18,32,.05)]">
      <div className="text-[10px] font-bold uppercase tracking-[.09em] text-slate-500">{label}</div>
      <div className="mt-1 break-words font-mono text-xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-[11px] leading-snug text-slate-500">{note}</div>
    </div>
  );
}

export function ServiceRecords({ vehicle, records, recordsError, onRetry, onDeleteRecord, canManageMaintenance = false, onReviewSaved }: Props) {
  const [filter, setFilter] = useState<ServiceRecordFilter>('all');
  const [showReview, setShowReview] = useState(false);
  const [recordActionError, setRecordActionError] = useState('');
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const metrics = useMemo(() => calculateServiceRecordMetrics(records, vehicle.currentMileage), [records, vehicle.currentMileage]);
  const filtered = useMemo(() => recordsError ? [] : filterServiceRecords(records, filter), [records, filter, recordsError]);
  const groups = useMemo(() => groupServiceRecordsByYear(filtered), [filtered]);
  const printRecords = useMemo(() => sortServiceRecords(records), [records]);
  const providerCounts = useMemo(() => records.reduce<Record<ServiceRecordFilter, number>>((counts, record) => {
    counts.all += 1;
    counts[classifyServiceProvider(record)] += 1;
    return counts;
  }, { all:0, dealer:0, independent:0, tire_shop:0, owner:0 }), [records]);
  const displayName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const serviceEntry = `/vehicle/${vehicleSlug(vehicle.year, vehicle.make, vehicle.model, vehicle.trim)}?vehicleId=${encodeURIComponent(vehicle.id)}&open=car&view=schedule`;
  const entry = serviceRecordEntry(vehicle, canManageMaintenance);

  const deleteRecord = async (recordId: string) => {
    if (!onDeleteRecord || deletingRecordId) return;
    setDeletingRecordId(recordId);
    setRecordActionError('');
    try {
      await onDeleteRecord(recordId);
    } catch (cause) {
      setRecordActionError(cause instanceof Error ? cause.message : 'Could not delete this record.');
    } finally {
      setDeletingRecordId(null);
    }
  };

  return (
    <div id="service-records-page" className="service-records-page min-w-0 bg-[#f8f5ed] text-slate-950">
      <style jsx global>{`
        .service-records-print-only { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          #service-records-print, #service-records-print * { visibility: visible !important; }
          #service-records-print { display: block !important; position: absolute; inset: 0; width: 100%; background: white; color: black; }
          .service-records-screen { display: none !important; }
          .service-records-print-only { display: block !important; }
          @page { margin: 14mm; }
        }
      `}</style>
      <div className="service-records-screen mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="min-w-0 border-b border-[#d9d1c2] pb-6">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.13em] text-blue-700">Au7o service records</p>
              <h1 className="mt-2 break-words text-3xl font-bold tracking-[-.035em] sm:text-4xl">{displayName}</h1>
              <p className="mt-2 break-words text-sm text-slate-600">
                {vehicle.year} {vehicle.make} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}
                {vehicle.currentMileage != null ? ` · ${vehicle.currentMileage.toLocaleString('en-US')} mi` : ''}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <button type="button" disabled={Boolean(recordsError)} onClick={() => { if (!recordsError) window.print(); }} className="min-h-11 rounded-xl border border-[#d9d1c2] bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">Print records</button>
              {entry === 'tree' && <a href={serviceEntry} className="inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">Log service or attach receipt in Tech Tree</a>}
              {entry === 'review' && <button type="button" onClick={() => setShowReview(true)} className="min-h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">Log service or attach receipt</button>}
            </div>
          </div>
          {recordsError && (
            <div role="alert" className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <span className="min-w-0 break-words">{recordsError} History and totals are unavailable until refreshed.</span>
              {onRetry && <button type="button" onClick={() => void onRetry()} className="min-h-9 shrink-0 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold">Try again</button>}
            </div>
          )}
          {recordActionError && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{recordActionError}</p>}
        </header>

        {showReview && entry === 'review' && <div className="mt-6"><ServiceReview vehicleId={vehicle.id} vehicleLabel={displayName} currentMileage={vehicle.currentMileage} onCancel={() => setShowReview(false)} onSaved={() => { setShowReview(false); void onReviewSaved?.(); }} /></div>}

        {!recordsError && <section aria-label="Service record summary" className="mt-6 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Recorded spend" value={metrics.pricedRecordCount ? formatCurrency(metrics.totalSpent) : '—'} note={metrics.pricedRecordCount ? `${metrics.pricedRecordCount} record${metrics.pricedRecordCount === 1 ? '' : 's'} with cost` : 'No costs entered'} />
          <Metric label="Receipts" value={String(metrics.receiptCount)} note={`${records.length} service record${records.length === 1 ? '' : 's'} total`} />
          <Metric label="Since latest" value={metrics.milesSinceLatest == null ? '—' : `${metrics.milesSinceLatest.toLocaleString('en-US')} mi`} note={records.length ? 'From current odometer' : 'No service history'} />
          <Metric label="Longest gap" value={metrics.longestMileageGap == null ? '—' : `${metrics.longestMileageGap.toLocaleString('en-US')} mi`} note="Between logged odometers" />
        </section>}

        <div className="mt-7 flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter service records">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-semibold ${filter === item.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-[#d9d1c2] bg-white text-slate-600'}`}>{item.label} <span className="font-mono opacity-70">{providerCounts[item.id]}</span></button>
          ))}
        </div>

        <section className="mt-6 min-w-0" aria-live="polite">
          {groups.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#cfc6b5] bg-white/60 px-5 py-14 text-center">
              <h2 className="text-lg font-bold">{recordsError ? 'Service records unavailable' : records.length ? 'No records match this filter' : 'No service records yet'}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">{recordsError ? 'Retry before relying on this history or printout.' : 'Log completed work or attach a real receipt. Au7o never creates sample visits or claims receipt details were extracted.'}</p>
            </div>
          ) : groups.map((group) => (
            <div key={group.year} className="mb-8 min-w-0">
              <div className="mb-3 flex items-center gap-3"><h2 className="font-mono text-sm font-bold text-slate-700">{group.year}</h2><span className="h-px flex-1 bg-[#d9d1c2]" /><span className="font-mono text-[10px] text-slate-400">{group.records.some((record) => typeof record.cost === 'number') ? formatCurrency(group.records.reduce((sum, record) => sum + (record.cost ?? 0), 0)) : 'Cost not entered'}</span></div>
              <div className="grid min-w-0 gap-3">
                {group.records.map((record) => {
                  const provider = PROVIDERS[classifyServiceProvider(record)];
                  return (
                  <div key={record.id} className="grid min-w-0 grid-cols-[18px_minmax(0,1fr)] gap-2 sm:grid-cols-[62px_minmax(0,1fr)] sm:gap-3">
                    <div className="relative flex min-w-0 flex-col items-center pt-5 after:absolute after:bottom-[-14px] after:right-[8px] after:top-8 after:w-px after:bg-[#d9d1c2] last:after:hidden sm:items-end sm:after:right-[4px]">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${provider.dot}`} />
                      <span className="mt-1 hidden font-mono text-[10px] font-semibold text-slate-400 sm:block">{(record.mileage / 1000).toFixed(1)}k</span>
                    </div>
                  <details className="group min-w-0 overflow-hidden rounded-2xl border border-[#dfd9cb] bg-white shadow-[0_1px_2px_rgba(11,18,32,.05)]">
                    <summary className="flex min-w-0 cursor-pointer list-none flex-col gap-3 px-4 py-4 marker:hidden sm:flex-row sm:items-center sm:px-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="min-w-0 break-words text-[15px] font-bold text-slate-950">{record.shopName?.trim() || 'Driveway'}</h3>
                          <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${provider.badge}`}>{provider.label}</span>
                          {record.receiptUrl && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Receipt attached</span>}
                        </div>
                        <p className="mt-1 break-words text-xs text-slate-500">{recordName(record)} · {formatDate(record.date)} · {record.mileage.toLocaleString('en-US')} mi</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                        <span className="font-mono text-sm font-bold text-slate-800">{record.cost == null ? 'Cost not entered' : formatCurrency(record.cost)}</span>
                        <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-180">⌄</span>
                      </div>
                    </summary>
                    <div className="min-w-0 border-t border-[#ebe6dc] bg-[#fbf9f4] px-4 py-4 sm:px-5">
                      <dl className="grid min-w-0 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                        {record.description && <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Work recorded</dt><dd className="mt-1 break-words text-slate-800">{record.description}</dd></div>}
                        {record.notes && <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Notes</dt><dd className="mt-1 break-words text-slate-800">{record.notes}</dd></div>}
                        {record.nextDueMileage != null && <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Next due mileage</dt><dd className="mt-1 font-mono text-slate-800">{record.nextDueMileage.toLocaleString('en-US')} mi</dd></div>}
                        {record.nextDueDate && <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Next due date</dt><dd className="mt-1 text-slate-800">{formatDate(record.nextDueDate)}</dd></div>}
                      </dl>
                      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                        {record.receiptUrl && <a href={`/api/maintenance/${encodeURIComponent(record.id)}/receipt`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800">Open private receipt</a>}
                        {onDeleteRecord && <button disabled={deletingRecordId != null} type="button" onClick={() => void deleteRecord(record.id)} className="min-h-10 rounded-xl border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 disabled:opacity-60">{deletingRecordId === record.id ? 'Deleting…' : 'Delete record'}</button>}
                      </div>
                    </div>
                  </details>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      <section id="service-records-print" className="service-records-print-only p-2">
        <h1 className="text-2xl font-bold">Au7o Service Records</h1>
        <p className="mt-1 text-sm">{displayName} · {vehicle.year} {vehicle.make} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}{vehicle.currentMileage != null ? ` · ${vehicle.currentMileage.toLocaleString('en-US')} mi` : ''}</p>
        <p className="mt-1 text-xs">Printed {formatDate(new Date().toISOString())}</p>
        {recordsError ? <p>Service history could not be confirmed. Refresh successfully before printing.</p> : <table className="mt-6 w-full border-collapse text-left text-xs">
          <thead><tr>{['Date', 'Service', 'Mileage', 'Source', 'Cost', 'Receipt'].map((label) => <th key={label} className="border-b-2 border-black px-1 py-2">{label}</th>)}</tr></thead>
          <tbody>{printRecords.map((record) => <tr key={record.id}><td className="border-b border-gray-300 px-1 py-2">{formatDate(record.date)}</td><td className="border-b border-gray-300 px-1 py-2">{recordName(record)}</td><td className="border-b border-gray-300 px-1 py-2">{record.mileage.toLocaleString('en-US')} mi</td><td className="border-b border-gray-300 px-1 py-2">{record.shopName?.trim() || 'Owner entered'}</td><td className="border-b border-gray-300 px-1 py-2">{record.cost == null ? '—' : formatCurrency(record.cost)}</td><td className="border-b border-gray-300 px-1 py-2">{record.receiptUrl ? 'Attached' : 'None'}</td></tr>)}</tbody>
        </table>}
      </section>

    </div>
  );
}
