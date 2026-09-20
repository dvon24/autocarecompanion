import { prisma } from './db';
import { entitlementSelect, productEntitlements } from './product-entitlements';
import { getTwinHubData } from './twin-hub-data';
import { sameTwinVehicleIdentity } from './twin-fulfillment';

/** Paid personal features or a separately claimed, unexpired exact-car beta. */
export async function canUsePersonalVehicle(userId: string, vehicleId: string, database: typeof prisma = prisma) {
  const user = await database.user.findUnique({ where: { id: userId }, select: entitlementSelect });
  if (!user) return false;
  const vehicle = await database.vehicle.findFirst({ where: { id: vehicleId, userId }, select: { id: true } });
  if (!vehicle) return false;
  if (productEntitlements(user).hub) return true;
  if (!user.emailVerified) return false;
  return (await getTwinHubData(userId, user.email, vehicleId, { prisma: database, getRecentThreads: async () => [] })).access.allowed;
}

/** Repair only the missing equipment attestation of an already claimed beta.
 * This does not grant service access, claim an offer or change the trial clock. */
export async function canConfirmPersonalVehicleEquipment(
  userId: string, vehicleId: string, input: unknown,
  database: typeof prisma = prisma,
) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const patch = input as Record<string, unknown>;
  if (Object.keys(patch).length !== 2
    || typeof patch.reviewedEquipmentId !== 'string'
    || typeof patch.expectedUpdatedAt !== 'string') return false;
  const user = await database.user.findUnique({ where: { id: userId }, select: entitlementSelect });
  if (!user?.emailVerified) return false;
  const result = await getTwinHubData(userId, user.email, vehicleId, { prisma: database, getRecentThreads: async () => [] });
  if (!('equipmentSetup' in result)) return false;
  const setup = result.equipmentSetup;
  return !!setup?.canConfirm && setup.vehicleId === vehicleId
    && setup.profile.id === patch.reviewedEquipmentId
    && setup.vehicleRevision === patch.expectedUpdatedAt;
}

/** A beta entitlement is checked against the requested exact vehicle, never
 * promoted into an account-wide subscriber flag. Ambiguous garage rows deny. */
export async function canUsePersonalVehicleContext(userId: string, input: unknown, deps: { database: typeof prisma; authorize: typeof canUsePersonalVehicle } = { database: prisma, authorize: canUsePersonalVehicle }) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const context = input as Record<string, unknown>;
  const id = typeof context.vehicleId === 'string' ? context.vehicleId : typeof context.id === 'string' ? context.id : null;
  if (id && context.year == null && context.make == null && context.model == null) return deps.authorize(userId, id, deps.database);
  const year = Number(context.year);
  if (!Number.isInteger(year) || typeof context.make !== 'string' || typeof context.model !== 'string') return false;
  const identity = { year, make: context.make, model: context.model, trim: typeof context.trim === 'string' ? context.trim : null };
  const rows = await deps.database.vehicle.findMany({ where: { userId, year, ...(id ? { id } : {}) }, select: { id: true, year: true, make: true, model: true, trim: true } });
  const matches = rows.filter((row) => sameTwinVehicleIdentity(identity, row));
  return matches.length === 1 && deps.authorize(userId, matches[0].id, deps.database);
}
