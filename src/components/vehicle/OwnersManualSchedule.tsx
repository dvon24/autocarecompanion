import type { VehicleSchedule } from '@/lib/owners-manual-schedule';

/**
 * Renders the owner's-manual-sourced maintenance schedule for a vehicle.
 * Distinct from the suggestion-engine timeline (which is dynamic based on
 * user mileage + history) — this is the authoritative reference schedule
 * straight from the manufacturer manual.
 *
 * Used on /vehicle/[slug] pages when a matching VehicleSchedule exists.
 */
export function OwnersManualSchedule({ schedule }: { schedule: VehicleSchedule }) {
  const services = Object.entries(schedule.schedule);
  const verifiedCount = services.filter(([, s]) => s.verified).length;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 my-6">
      <header className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Owner&apos;s Manual Maintenance Schedule
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {schedule.engine} · {schedule.transmission}
          </p>
        </div>
        {verifiedCount === services.length && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified from owner&apos;s manual
          </span>
        )}
      </header>

      {schedule.owner_alerts && schedule.owner_alerts.length > 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2">
            Owner Alerts
          </p>
          <ul className="space-y-1.5 text-sm text-amber-900">
            {schedule.owner_alerts.map((alert, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-amber-600 flex-shrink-0">⚠</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {services.map(([typeId, service]) => (
          <ServiceRow key={typeId} typeId={typeId} service={service} />
        ))}
      </div>

      <footer className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Source:{' '}
          {schedule.source.url ? (
            <a
              href={schedule.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {schedule.source.primary}
            </a>
          ) : (
            schedule.source.primary
          )}
          {schedule.source.section && <span> · {schedule.source.section}</span>}
        </p>
      </footer>
    </section>
  );
}

const SERVICE_LABELS: Record<string, string> = {
  engine_oil: 'Engine Oil',
  supercharger_oil: 'Supercharger Oil',
  intercooler_coolant: 'Intercooler Coolant',
  engine_coolant: 'Engine Coolant',
  transmission_fluid_auto: 'Transmission Fluid (Automatic)',
  transmission_fluid_manual: 'Transmission Fluid (Manual)',
  rear_differential: 'Rear Differential Fluid',
  front_differential: 'Front Differential Fluid',
  transfer_case: 'Transfer Case Fluid',
  brake_fluid: 'Brake Fluid',
  spark_plugs: 'Spark Plugs',
  air_filter: 'Engine Air Filter',
  cabin_filter: 'Cabin Air Filter',
  tire_rotation: 'Tire Rotation',
  wiper_blades: 'Wiper Blades',
  battery: 'Battery',
  power_steering_fluid: 'Power Steering Fluid',
  fuel_filter: 'Fuel Filter',
};

function ServiceRow({ typeId, service }: { typeId: string; service: import('@/lib/owners-manual-schedule').ServiceInterval }) {
  const label = SERVICE_LABELS[typeId] ?? typeId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <span className="text-xs text-gray-500">{service.interval_display}</span>
      </div>
      {(service.fluid || service.capacity || service.part_number) && (
        <dl className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs">
          {service.fluid && (
            <div className="flex gap-1.5">
              <dt className="text-gray-500 flex-shrink-0">Fluid:</dt>
              <dd className="text-gray-700">{service.fluid}</dd>
            </div>
          )}
          {service.capacity && (
            <div className="flex gap-1.5">
              <dt className="text-gray-500 flex-shrink-0">Capacity:</dt>
              <dd className="text-gray-700">{service.capacity}</dd>
            </div>
          )}
          {service.part_number && (
            <div className="flex gap-1.5">
              <dt className="text-gray-500 flex-shrink-0">Part:</dt>
              <dd className="text-gray-700">{service.part_number}</dd>
            </div>
          )}
        </dl>
      )}
      {service.interval_severe_display && (
        <p className="mt-1 text-xs text-amber-700">
          <span className="font-medium">Severe service:</span> {service.interval_severe_display}
        </p>
      )}
      {service.note && (
        <p className="mt-1 text-xs text-gray-500 italic">{service.note}</p>
      )}
    </div>
  );
}
