import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { vehicleSlug } from '@/lib/vehicle-slug';

interface GarageVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  nickname: string | null;
  isPrimary: boolean;
}

/**
 * "My Garage" body — tile grid for the AcctCard wrapper.
 *
 * The PRIMARY pill is backed by the real Vehicle.isPrimary flag (the
 * same field the garage / home / hub all key off), so this badge labels
 * the SAME vehicle as every other surface. The page orders by
 * [{ isPrimary: 'desc' }, { updatedAt: 'desc' }] to match.
 *
 * Two columns on desktop, single column on mobile. Empty state matches
 * the prior dashed-card pattern but uses the new BMAD chrome.
 */
export function GarageSummary({
  vehicles,
  columns = 2,
}: {
  vehicles: GarageVehicle[];
  columns?: 1 | 2;
}) {
  if (vehicles.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed p-6 text-center"
        style={{ borderColor: '#D8D2C3' }}
      >
        <p className="text-slate-600 text-sm">No vehicles yet.</p>
        <Link
          href="/garage"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 inline-block"
        >
          Add a vehicle →
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 10,
      }}
    >
      {vehicles.map((v) => {
        const isPrimary = v.isPrimary;
        const ymm = `${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}`;
        const display = v.nickname || ymm;
        return (
          <Link
            key={v.id}
            href={`/vehicle/${vehicleSlug(v.year, v.make, v.model, v.trim)}`}
            className="flex items-center gap-3 rounded-xl border hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all"
            style={{ padding: '13px 14px', background: '#EFEDE6', borderColor: '#E3DFD4' }}
          >
            <span
              className="inline-flex items-center justify-center bg-white text-slate-600 flex-shrink-0 border"
              style={{ width: 40, height: 40, borderRadius: 10, borderColor: '#E3DFD4' }}
            >
              <Icon name="car" size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-[-0.01em] text-slate-900 truncate">
                  {display}
                </span>
                {isPrimary && (
                  <span
                    className="text-[8.5px] font-bold uppercase text-blue-700 bg-blue-50 rounded-full flex-shrink-0"
                    style={{ padding: '2px 6px', letterSpacing: '0.05em' }}
                  >
                    PRIMARY
                  </span>
                )}
              </div>
              {v.nickname && (
                <div className="text-[11.5px] text-slate-600 mt-0.5 truncate">
                  {ymm}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
