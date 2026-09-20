type DatedService = { date: Date | string; mileage: number; id?: string };

/** Consumers filter invalid/future evidence first. Never mutates saved history. */
export function compareServiceRecordsNewestFirst(a: DatedService, b: DatedService): number {
  const time = (value: Date | string) => value instanceof Date ? value.getTime() : Date.parse(value);
  return time(b.date) - time(a.date)
    || b.mileage - a.mileage
    || (b.id ?? '').localeCompare(a.id ?? '');
}
