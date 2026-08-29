import prisma from '@/lib/db';
import { getVehicleSpecs } from '@/lib/maintenance';
import { getRecentThreads } from '@/lib/hub-data';
import { getLiveTwinForVehicle, getTwinDefinition, resolveTwinTransmissionBranch, sameTwinVehicleIdentity, twinMatchesVehicle } from '@/lib/twin-fulfillment';
import { isFounderEmail } from '@/lib/founder';
import { evaluateTwinAccess, evaluateTwinReservationProvenance, getConfirmedTwinTransmission, normalizeTwinSessionIdentity, type TwinAccessDecision } from '@/lib/twin-access';
import { hasValidReviewedTransmissionState, type TransmissionOption } from '@/lib/transmission-options';
import { getTwinByFulfillmentId } from '@/lib/vehicle-twin-catalog';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { buildTwinIssueSummary, type TwinIssueSummary } from '@/lib/twin-known-issues';

/**
 * Server payload for the live twin hub.
 *
 * The twin hub was built as a no-account demo whose every number was invented
 * so the screen would look interesting: a 65,000 mi odometer, a "Front brake
 * pads — 20,000 mi past a typical set" card, three sample chat threads. All of
 * that is fine for a demo and false for an owner.
 *
 * This builds the real version for one garage vehicle. What it deliberately
 * does NOT do is invent anything to fill a gap: no odometer means no live hub
 * (the caller falls back to the demo rather than showing a made-up mileage),
 * and an unmapped service type simply leaves that part unlogged rather than
 * guessing when it was last done.
 *
 * The tree itself is assembled on the client (see twin-trees.js) because the
 * service intervals live alongside the tree they annotate — one source of
 * truth for "what counts as due".
 */
export interface TwinServiceRecord {
  type: string;
  mileage: number;
  date: string;
  nextDueMileage: number | null;
  nextDueDate: string | null;
}

export interface TwinRecentThread {
  t: string;
  w: string;
  i: string;
  href: string;
}

export interface TwinHubData {
  vehicleId: string;
  vehicle: { year: number; make: string; model: string; trim: string; engine: string; color: string | null };
  miles: number;
  /** Raw logged services; the client folds these onto tree nodes. */
  records: TwinServiceRecord[];
  recent: TwinRecentThread[];
  issues: TwinIssueSummary[];
  installedParts: Array<{
    nodeId: string;
    category: string;
    name: string;
    brand: string | null;
    partNumber: string | null;
    cost: number | null;
    imageUrl: string | null;
    notes: string | null;
    kind: string;
    lifespanMiles: number | null;
    installedAtMileage: number | null;
    installDate: string | null;
    fitmentKey: string | null;
  }>;
  transmission: 'automatic' | 'manual' | null;
  transmissionOptions: readonly TransmissionOption[];
  canSelectTransmission: boolean;
  fulfillmentId: string;
  vehicleRevision: string;
  evaluatedAt: string;
}

export type TwinHubOutcome =
  | { access: Extract<TwinAccessDecision, { kind: 'allowed' }>; data: TwinHubData }
  | { access: Exclude<TwinAccessDecision, { kind: 'allowed' }>; data: null };

export const TWIN_SERVICE_RECORD_TYPES = [
  'oil_change',
  'air_filter',
  'cabin_filter',
  'brake_fluid',
  'wiper_blades',
  'coolant_flush',
  'tire_rotation',
  'tire_replacement',
  'brake_service',
  'cooling_system_service',
  'differential_fluid',
  'transfer_case_fluid',
  'transmission_fluid',
  'transmission_fluid_auto',
  'transmission_fluid_manual',
] as const;

type TwinServiceRecordType = (typeof TWIN_SERVICE_RECORD_TYPES)[number];
type TwinServiceRecordRow = {
  id: string;
  type: string;
  mileage: number;
  date: Date;
  nextDueMileage: number | null;
  nextDueDate: Date | null;
};

export function buildLatestTwinServiceRecordQuery(
  vehicleId: string,
  type: TwinServiceRecordType,
  currentMileage: number,
  now: Date,
) {
  return {
    where: {
      vehicleId,
      type,
      mileage: { lte: currentMileage },
      date: { lte: now },
    },
    orderBy: [{ date: 'desc' as const }, { mileage: 'desc' as const }, { id: 'desc' as const }],
    select: { id: true, type: true, mileage: true, date: true, nextDueMileage: true, nextDueDate: true },
  };
}

export function twinServiceRecordTypesForBranch(
  transmission: 'automatic' | 'manual' | null,
): readonly TwinServiceRecordType[] {
  const shared = TWIN_SERVICE_RECORD_TYPES.filter((type) => (
    type !== 'transmission_fluid_auto' && type !== 'transmission_fluid_manual'
  ));
  if (transmission === 'automatic') return [...shared, 'transmission_fluid_auto'];
  if (transmission === 'manual') return [...shared, 'transmission_fluid_manual'];
  return shared;
}

/** Exactly one bounded eligible row per supported type; unrelated history is never loaded. */
export async function loadLatestTwinServiceRecords(
  vehicleId: string,
  currentMileage: number,
  now: Date,
  findFirst: (query: ReturnType<typeof buildLatestTwinServiceRecordQuery>) => Promise<TwinServiceRecordRow | null>,
  types: readonly TwinServiceRecordType[] = TWIN_SERVICE_RECORD_TYPES,
): Promise<TwinServiceRecordRow[]> {
  const rows = await Promise.all(types.map((type) => (
    findFirst(buildLatestTwinServiceRecordQuery(vehicleId, type, currentMileage, now))
  )));
  return rows.filter((row): row is TwinServiceRecordRow => row != null);
}

/**
 * Vehicles the twin can honestly depict.
 *
 * The stage is not a generic car: `car-base.webp`, the five hotspot glow
 * layers, the x-ray layer and every hotspot coordinate are photographs of a
 * 2015 Challenger. Show them to a Camaro owner and the hub states, in the most
 * literal way available, that their car is something it is not - while the
 * tree underneath quotes Mopar part numbers as a "verified fit".
 *
 * So the twin is gated on having art for the vehicle, not merely on the owner
 * being allowed to see it. Widening this list means producing the layer set
 * and re-mapping TH_HOTSPOTS for that body first.
 */
/** "2d ago" / "3w ago" — the sidebar's existing format. */
function agoLabel(iso: string, now: Date): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((now.getTime() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/**
 * Build the live payload for a vehicle the signed-in user owns.
 *
 * Returns null when the twin cannot honestly be shown — no such vehicle, not
 * this user's, or no odometer reading. The whole screen is a statement about
 * mileage ("this part is past its life at X miles"), so without a real X there
 * is nothing truthful to render and the caller keeps the ordinary hub.
 */
export async function getTwinHubData(
  userId: string,
  userEmail: string,
  vehicleId: string,
  dependencies: {
    prisma: typeof prisma;
    getRecentThreads: typeof getRecentThreads;
    resolveOwnerCatalog?: typeof getTwinByFulfillmentId;
  } = { prisma, getRecentThreads },
): Promise<TwinHubOutcome> {
  const identity = normalizeTwinSessionIdentity({ user: { id: userId, email: userEmail } });
  if (!identity) return { access: evaluateTwinReservationProvenance(null)!, data: null };
  userId = identity.userId;
  const email = identity.email;
  const founder = isFounderEmail(email);
  const snapshot = await dependencies.prisma.$transaction(async (tx) => {
    const currentTimeRows = await tx.$queryRaw<Array<{ now: Date }>>`SELECT CURRENT_TIMESTAMP AS "now"`;
    const now = currentTimeRows[0]?.now ?? new Date(Number.NaN);
    const [vehicle, reservation] = await Promise.all([
      tx.vehicle.findFirst({
        where: { id: vehicleId, userId },
        select: {
          id: true, year: true, make: true, model: true, trim: true,
          transmission: true, color: true, currentMileage: true, updatedAt: true,
        },
      }),
      tx.reservation.findUnique({
        where: { email },
        select: {
          twinStatus: true, assignedTwin: true, transmission: true, trialDays: true, claimedAt: true,
          year: true, make: true, model: true, trim: true, vehicleVerified: true, trimVerified: true,
        },
      }),
    ]);

    if (!vehicle) {
      const access = evaluateTwinAccess({
        founder, supported: false, garageMatches: false, positiveMileage: false,
        assignmentMatches: false, requiresTransmissionChoice: false,
        customerTransmissionMatches: false, reservation: null, now,
      });
      return { access, payload: null };
    }

    if (!hasValidReviewedTransmissionState(vehicle)) {
      const access = evaluateTwinAccess({
        founder, supported: false, garageMatches: false, positiveMileage: false,
        assignmentMatches: false, requiresTransmissionChoice: false,
        customerTransmissionMatches: false, reservation: null, now,
      });
      return { access, payload: null };
    }

    if (!founder) {
      const provenanceRejection = evaluateTwinReservationProvenance(reservation);
      if (provenanceRejection) return { access: provenanceRejection, payload: null };
      if (reservation && !hasValidReviewedTransmissionState(reservation)) {
        const access = evaluateTwinAccess({
          founder: false, supported: false, garageMatches: false, positiveMileage: false,
          assignmentMatches: false, requiresTransmissionChoice: false,
          customerTransmissionMatches: false, reservation, now,
        });
        return { access, payload: null };
      }
    }

    const directTwin = getLiveTwinForVehicle(vehicle);
    const assignedTwin = getTwinDefinition(reservation?.assignedTwin);
    const twin = founder ? directTwin : assignedTwin;
    const catalog = (dependencies.resolveOwnerCatalog ?? getTwinByFulfillmentId)(twin?.id);
    const reservedVehicle = reservation?.year && reservation.make && reservation.model
      ? { year: reservation.year, make: reservation.make, model: reservation.model, trim: reservation.trim }
      : null;

    let exactCustomerGarage = true;
    if (!founder && reservedVehicle && assignedTwin) {
      const candidates = await tx.vehicle.findMany({
        where: { userId, year: reservedVehicle.year },
        select: { id: true, year: true, make: true, model: true, trim: true },
      });
      const exactCandidates = candidates.filter((candidate) => (
        twinMatchesVehicle(assignedTwin, candidate)
        && sameTwinVehicleIdentity(reservedVehicle, candidate)
      ));
      exactCustomerGarage = exactCandidates.length === 1 && exactCandidates[0].id === vehicle.id;
    }

    const exactAssignment = exactCustomerGarage
      && !!assignedTwin
      && !!directTwin
      && assignedTwin.id === directTwin.id
      && !!reservedVehicle
      && twinMatchesVehicle(assignedTwin, vehicle)
      && twinMatchesVehicle(assignedTwin, reservedVehicle)
      && sameTwinVehicleIdentity(reservedVehicle, vehicle);
    const transmissionFitment = resolveTwinTransmissionBranch(twin, vehicle.transmission, vehicle);
    const needsTransmission = transmissionFitment.requiresChoice;
    const reservationTransmission = getConfirmedTwinTransmission(reservation, exactAssignment);
    const customerTransmissionMatches = !needsTransmission
      || (reservationTransmission != null && reservationTransmission === transmissionFitment.branch);
    const confirmedTransmission = founder
      ? transmissionFitment.branch
      : (needsTransmission
        ? (reservationTransmission === transmissionFitment.branch ? transmissionFitment.branch : null)
        : transmissionFitment.branch);
    const access = evaluateTwinAccess({
      founder,
      supported: !!directTwin && !!catalog?.ownerReady && transmissionFitment.options.length > 0,
      garageMatches: !!directTwin && exactCustomerGarage,
      positiveMileage: typeof vehicle.currentMileage === 'number' && vehicle.currentMileage > 0,
      assignmentMatches: exactAssignment,
      requiresTransmissionChoice: needsTransmission,
      customerTransmissionMatches,
      reservation,
      now,
    });
    const currentMileage = vehicle.currentMileage;
    if (access.kind !== 'allowed' || !twin || !catalog?.ownerReady || typeof currentMileage !== 'number' || currentMileage <= 0) {
      return { access, payload: null };
    }

    const recordTypes = twinServiceRecordTypesForBranch(confirmedTransmission);
    const records = await loadLatestTwinServiceRecords(
      vehicle.id,
      currentMileage,
      now,
      (query) => tx.maintenanceRecord.findFirst(query),
      recordTypes,
    );
    return {
      access,
      payload: {
        vehicle: { ...vehicle, currentMileage },
        twin,
        records,
        now,
        transmissionFitment,
        confirmedTransmission,
      },
    };
  }, { isolationLevel: 'Serializable' });

  if (snapshot.access.kind !== 'allowed' || !snapshot.payload) {
    return { access: snapshot.access as Exclude<TwinAccessDecision, { kind: 'allowed' }>, data: null };
  }

  const { vehicle, twin, records, now, transmissionFitment, confirmedTransmission } = snapshot.payload;
  const catalog = (dependencies.resolveOwnerCatalog ?? getTwinByFulfillmentId)(twin.id);
  const knownIssueIds = [...new Set(catalog?.hotspots.flatMap((hotspot) => hotspot.knownIssueIds || []) || [])];
  const [threads, modifications, issueRows] = await Promise.all([
    dependencies.getRecentThreads(userId, vehicle.id, 3).catch(() => []),
    dependencies.prisma.modification.findMany({
      where: { vehicleId: vehicle.id },
      select: { category:true, name:true, brand:true, partNumber:true, cost:true, imageUrl:true, description:true, modelData:true, installDate:true },
      orderBy: { createdAt: 'desc' },
    }),
    knownIssueIds.length ? dependencies.prisma.knownIssue.findMany({
      where: { id: { in: knownIssueIds }, status: 'published', years: { has: vehicle.year } },
      select: { id:true, title:true, severity:true, make:true, model:true, description:true, solution:true, fixParts:true, communityRecommendations:true },
    }).catch(() => []) : Promise.resolve([]),
  ]);
  const specs = getVehicleSpecs({
    year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim ?? undefined,
  });
  const transmissionOptions: readonly TransmissionOption[] = transmissionFitment.options.map((value) => ({
    value,
    label: value === 'automatic' ? 'Automatic' : 'Manual',
  }));
  const data: TwinHubData = {
    vehicleId: vehicle.id,
    vehicle: {
      year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim ?? '',
      engine: specs?.engine || vehicle.trim || '', color: vehicle.color,
    },
    miles: vehicle.currentMileage,
    records: records.map((record) => ({
      type: record.type,
      mileage: record.mileage,
      date: record.date.toISOString(),
      nextDueMileage: record.nextDueMileage,
      nextDueDate: record.nextDueDate?.toISOString() ?? null,
    })),
    recent: threads.map((thread) => ({
      t: thread.preview || 'Untitled thread',
      w: agoLabel(thread.updatedAt, now),
      i: 'chat',
      href: `/vehicle/${vehicleSlug(vehicle.year, vehicle.make, vehicle.model, vehicle.trim)}?session=${thread.id}`,
    })),
    issues: issueRows.map(buildTwinIssueSummary),
    installedParts: modifications.map((modification) => {
      const modelData = modification.modelData && typeof modification.modelData === 'object' && !Array.isArray(modification.modelData)
        ? modification.modelData as Record<string, unknown>
        : {};
      return {
        nodeId: typeof modelData.nodeId === 'string' ? modelData.nodeId : '',
        category: modification.category,
        name: modification.name,
        brand: modification.brand,
        partNumber: modification.partNumber,
        cost: modification.cost,
        imageUrl: modification.imageUrl,
        notes: modification.description,
        kind: typeof modelData.kind === 'string' ? modelData.kind : 'installed-part',
        lifespanMiles: typeof modelData.lifespanMiles === 'number' && modelData.lifespanMiles > 0 ? modelData.lifespanMiles : null,
        installedAtMileage: typeof modelData.installedAtMileage === 'number' && modelData.installedAtMileage >= 0 ? modelData.installedAtMileage : null,
        installDate: modification.installDate?.toISOString() ?? null,
        fitmentKey: typeof modelData.fitmentKey === 'string' ? modelData.fitmentKey : null,
      };
    }),
    transmission: confirmedTransmission,
    transmissionOptions,
    canSelectTransmission: founder && transmissionFitment.requiresChoice,
    fulfillmentId: twin.id,
    vehicleRevision: vehicle.updatedAt.toISOString(),
    evaluatedAt: now.toISOString(),
  };
  return { access: snapshot.access, data };
}
