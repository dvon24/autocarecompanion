import { z } from 'zod';

const PRISMA_INT_MAX = 2_147_483_647;
const boundedInt = z.number().finite().int().min(0).max(PRISMA_INT_MAX);

const VehiclePatchSchema = z.object({
  year: z.number().finite().int().min(1900).max(new Date().getFullYear() + 2).optional(),
  make: z.string().trim().min(1).max(100).optional(),
  model: z.string().trim().min(1).max(100).optional(),
  trim: z.string().trim().min(1).max(100).optional().nullable(),
  transmission: z.enum(['automatic', 'manual']).optional().nullable(),
  expectedUpdatedAt: z.string().datetime().optional(),
  vin: z.string().trim().min(1).max(17).transform((value) => value.toUpperCase()).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  nickname: z.string().max(100).optional().nullable(),
  currentMileage: boundedInt.optional().nullable(),
  annualMileage: z.number().finite().int().min(0).max(200000).optional().nullable(),
  isPrimary: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  showcaseSlug: z.string().trim().min(1).max(100)
    .transform((value) => value.toLowerCase())
    .refine((value) => /^[a-z0-9-]+$/.test(value), { message: 'Invalid showcase identifier' })
    .optional().nullable(),
}).strict().superRefine((value, context) => {
  if (Object.keys(value).every((key) => key === 'expectedUpdatedAt')) {
    context.addIssue({ code: 'custom', message: 'At least one vehicle field must change' });
  }
  if (Object.prototype.hasOwnProperty.call(value, 'transmission') && value.expectedUpdatedAt == null) {
    context.addIssue({
      code: 'custom',
      path: ['expectedUpdatedAt'],
      message: 'The current vehicle revision is required for a transmission choice',
    });
  }
});

function hasRealCalendarPrefix(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return calendar.getUTCFullYear() === year
    && calendar.getUTCMonth() === month - 1
    && calendar.getUTCDate() === day;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const OFFSET_DATETIME = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:0\d|1[0-3]):[0-5]\d|[+-]14:00)$/;

export function isAcceptedMaintenanceDate(value: string): boolean {
  if (value.endsWith('-00:00')) return false;
  if (!DATE_ONLY.test(value) && !OFFSET_DATETIME.test(value)) return false;
  return hasRealCalendarPrefix(value) && Number.isFinite(Date.parse(value));
}

const maintenanceDate = z.string().refine(isAcceptedMaintenanceDate, {
  message: 'Use YYYY-MM-DD or an ISO datetime with an explicit offset',
});

function isStrictlyLaterMaintenanceBoundary(next: string, completed: string): boolean {
  const nextDateOnly = DATE_ONLY.test(next);
  const completedDateOnly = DATE_ONLY.test(completed);
  if (nextDateOnly !== completedDateOnly) return next.slice(0, 10) > completed.slice(0, 10);
  return Date.parse(next) > Date.parse(completed);
}

const maintenanceCreateSchema = (isLoggableType: (type: string) => boolean) => z.object({
  vehicleId: z.string().trim().min(1),
  type: z.string().trim().refine(isLoggableType, { message: 'Invalid maintenance type' }),
  description: z.string().max(500).optional(),
  mileage: boundedInt,
  cost: z.number().finite().min(0).optional(),
  date: maintenanceDate,
  nextDueMileage: boundedInt.optional(),
  nextDueDate: maintenanceDate.optional(),
  notes: z.string().max(2000).optional(),
  receiptUrl: z.string().url().optional(),
  shopName: z.string().max(200).optional(),
}).strict().superRefine((value, context) => {
  if (value.nextDueMileage != null && value.nextDueMileage <= value.mileage) {
    context.addIssue({
      code: 'custom',
      path: ['nextDueMileage'],
      message: 'Next due mileage must be after the service mileage',
    });
  }
  if (value.nextDueDate && !isStrictlyLaterMaintenanceBoundary(value.nextDueDate, value.date)) {
    context.addIssue({
      code: 'custom',
      path: ['nextDueDate'],
      message: 'Next due date must be after the service date',
    });
  }
});

export const parseVehiclePatch = (body: unknown) => VehiclePatchSchema.safeParse(body);
export const parseMaintenanceCreate = (body: unknown, isLoggableType: (type: string) => boolean) => (
  maintenanceCreateSchema(isLoggableType).safeParse(body)
);

export function claimTransmissionMatchesVehicle(
  fitment: { requiresChoice: boolean; branch: 'automatic' | 'manual' | null },
  vehicleTransmission: string | null | undefined,
): boolean {
  return !fitment.requiresChoice
    || (fitment.branch != null && vehicleTransmission === fitment.branch);
}
