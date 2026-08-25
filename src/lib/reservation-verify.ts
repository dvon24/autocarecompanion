import ymmtData from '../../public/data/ymmt.json';

/**
 * Server-side vehicle verification for reservations.
 *
 * Deliberately NOT in `reservation.ts`: that module is imported by
 * HeroReserveForm, and pulling the ~1 MB catalog in there would ship it to
 * every homepage visitor a second time. This file is only ever imported by the
 * API route.
 *
 * The point of the split is that `vehicleVerified` has to mean the vehicle
 * genuinely exists in ymmt.json, not merely that three fields were non-empty.
 * A caller can send `{year: 2019, make: "Chevorlet", model: "Camaro"}` and a
 * presence check would happily mark it verified; the maintenance schedule then
 * keys off a make that does not exist. So the values are resolved against the
 * catalog and returned in the catalog's own casing, which also normalises
 * "chevrolet" and "Chevrolet" to one stored spelling.
 *
 * Trim is verified separately. Plenty of models carry no trim list at all, and
 * a trim the owner typed is still worth keeping — it is the difference between
 * a ZL1 and an LT1 for every interval on the schedule. So an unrecognised trim
 * is stored as given with `trimVerified: false` rather than discarded, and the
 * schedule can decide whether to trust it.
 */

type Ymmt = Record<string, Record<string, Record<string, string[]>>>;
const ymmt = ymmtData as unknown as Ymmt;

const canon = (s: string) => s.trim().toLowerCase().replace(/[\s_-]+/g, ' ');

/** Exact hit first, then a case/spacing-tolerant scan. */
function findKey(keys: string[], wanted: string): string | null {
  if (keys.includes(wanted)) return wanted;
  const target = canon(wanted);
  return keys.find((k) => canon(k) === target) ?? null;
}

export interface VerifiedVehicle {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  /** year+make+model all resolved against ymmt.json. */
  vehicleVerified: boolean;
  /** trim was one of the catalog's own options for that year/make/model. */
  trimVerified: boolean;
}

const UNVERIFIED: VerifiedVehicle = {
  year: null, make: null, model: null, trim: null,
  vehicleVerified: false, trimVerified: false,
};

export function verifyVehicle(claimed: {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
}): VerifiedVehicle {
  const { year, make, model, trim } = claimed;
  if (!year || !make || !model) return UNVERIFIED;

  const yearKey = findKey(Object.keys(ymmt), String(year));
  if (!yearKey) return UNVERIFIED;

  const makeKey = findKey(Object.keys(ymmt[yearKey] ?? {}), make);
  if (!makeKey) return UNVERIFIED;

  const modelKey = findKey(Object.keys(ymmt[yearKey][makeKey] ?? {}), model);
  if (!modelKey) return UNVERIFIED;

  // Y/M/M confirmed. Trim is best-effort on top of that — never a reason to
  // throw away a vehicle we just proved is real.
  const trims = ymmt[yearKey][makeKey][modelKey] ?? [];
  const trimKey = trim ? findKey(trims, trim) : null;

  return {
    year: Number(yearKey),
    make: makeKey,
    model: modelKey,
    trim: trimKey ?? (trim ? trim.slice(0, 60) : null),
    vehicleVerified: true,
    trimVerified: Boolean(trimKey),
  };
}
