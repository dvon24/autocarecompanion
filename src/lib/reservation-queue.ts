import { isUSReservationCountry } from './reservation-identity';
import { RESERVATION_COUNTRIES } from './reservation';

export function reservationCountry(value: string | null | undefined): string {
  const text = value?.trim().replace(/\s+/g, ' ') ?? '';
  if (!text) return 'Unknown';
  if (isUSReservationCountry(text)) return 'United States';
  return RESERVATION_COUNTRIES.find(country => country.toLowerCase() === text.toLowerCase()) ?? text.toUpperCase();
}

export function reservationCountryCounts(rows: ReadonlyArray<{ country: string | null }>) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const country = reservationCountry(row.country);
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }
  return [...counts].sort(([left], [right]) => left.localeCompare(right));
}

export const isOpenReservation = (row: { twinStatus: string }) => !['claimed', 'canceled'].includes(row.twinStatus);
