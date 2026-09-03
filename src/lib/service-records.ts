export interface ServiceRecordView {
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

export type ServiceProviderType = 'dealer' | 'independent' | 'tire_shop' | 'owner';
export type ServiceRecordFilter = 'all' | ServiceProviderType;

export interface ServiceRecordMetrics {
  totalSpent: number;
  pricedRecordCount: number;
  receiptCount: number;
  milesSinceLatest: number | null;
  longestMileageGap: number | null;
}

function finiteCost(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function serviceRecordTimestamp(record: ServiceRecordView): number {
  const value = Date.parse(record.date);
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

export function sortServiceRecords(records: ServiceRecordView[]): ServiceRecordView[] {
  return [...records].sort((a, b) => {
    const dateDelta = serviceRecordTimestamp(b) - serviceRecordTimestamp(a);
    if (Number.isFinite(dateDelta) && dateDelta !== 0) return dateDelta;
    return b.mileage - a.mileage;
  });
}

export function filterServiceRecords(
  records: ServiceRecordView[],
  filter: ServiceRecordFilter,
): ServiceRecordView[] {
  if (filter !== 'all') return records.filter((record) => classifyServiceProvider(record) === filter);
  return records;
}

const TIRE_PROVIDER = /\b(tire|tyre|discount tire|firestone|goodyear|ntb|mavis|les schwab|big o)\b/i;
const DEALER_PROVIDER = /\b(dealer|dealership|cdjr|acura|audi|bmw|buick|cadillac|chevrolet|chevy|chrysler|dodge|ford|genesis|gmc|honda|hyundai|infiniti|jeep|kia|lexus|lincoln|mazda|mercedes|mini|mitsubishi|nissan|porsche|ram|subaru|tesla|toyota|volkswagen|volvo)\b/i;
const OWNER_PROVIDER = /\b(owner|self|diy|driveway|home garage)\b/i;

/**
 * MaintenanceRecord predates an explicit provider-category field. Keep the
 * presentation truthful by deriving a conservative category from the source
 * Au7o already stores. Unknown named shops remain independent rather than
 * being promoted to dealers.
 */
export function classifyServiceProvider(record: Pick<ServiceRecordView, 'shopName'>): ServiceProviderType {
  const provider = record.shopName?.trim();
  if (!provider || OWNER_PROVIDER.test(provider)) return 'owner';
  if (TIRE_PROVIDER.test(provider)) return 'tire_shop';
  if (DEALER_PROVIDER.test(provider)) return 'dealer';
  return 'independent';
}

export function groupServiceRecordsByYear(
  records: ServiceRecordView[],
): Array<{ year: string; records: ServiceRecordView[] }> {
  const grouped = new Map<string, ServiceRecordView[]>();
  for (const record of sortServiceRecords(records)) {
    const timestamp = serviceRecordTimestamp(record);
    const year = Number.isFinite(timestamp)
      ? String(new Date(timestamp).getUTCFullYear())
      : 'Date unavailable';
    const existing = grouped.get(year) ?? [];
    existing.push(record);
    grouped.set(year, existing);
  }
  return [...grouped].map(([year, yearRecords]) => ({ year, records: yearRecords }));
}

export function calculateServiceRecordMetrics(
  records: ServiceRecordView[],
  currentMileage: number | null | undefined,
): ServiceRecordMetrics {
  let totalSpent = 0;
  let pricedRecordCount = 0;
  let receiptCount = 0;
  for (const record of records) {
    const cost = finiteCost(record.cost);
    if (cost != null) {
      totalSpent += cost;
      pricedRecordCount += 1;
    }
    if (record.receiptUrl) receiptCount += 1;
  }

  const latest = sortServiceRecords(records)[0];
  const milesSinceLatest = latest
    && typeof currentMileage === 'number'
    && Number.isFinite(currentMileage)
    && currentMileage >= latest.mileage
      ? currentMileage - latest.mileage
      : null;

  const mileages = records
    .map((record) => record.mileage)
    .filter((mileage) => Number.isFinite(mileage) && mileage >= 0)
    .sort((a, b) => a - b);
  let longestMileageGap: number | null = null;
  for (let index = 1; index < mileages.length; index += 1) {
    const gap = mileages[index] - mileages[index - 1];
    longestMileageGap = Math.max(longestMileageGap ?? 0, gap);
  }

  return { totalSpent, pricedRecordCount, receiptCount, milesSinceLatest, longestMileageGap };
}
