import { z } from 'zod';
import { isLoggableMaintenanceType } from '@/lib/maintenance';
import { isAcceptedMaintenanceDate } from '@/lib/twin-route-contracts';

/** A reviewed invoice is one logical write. No OCR field is implicitly confirmed. */
export const ServiceReviewSchema = z.object({
  requestId: z.string().uuid(),
  vehicleId: z.string().trim().min(1).max(200),
  confirmed: z.literal(true),
  timeZone: z.string().max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isAcceptedMaintenanceDate),
  mileage: z.number().int().min(0).max(2_147_483_647),
  cost: z.number().finite().min(0).max(100_000_000).optional(),
  shopName: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
  jobs: z.array(z.object({
    type: z.string().refine(isLoggableMaintenanceType),
    description: z.string().trim().min(1).max(500),
  }).strict()).min(1).max(20),
}).strict().superRefine((value, context) => {
  if (new Set(value.jobs.map((job) => job.type)).size !== value.jobs.length) {
    context.addIssue({ code: 'custom', message: 'Combine work of the same service type into one reviewed job.' });
  }
});
export type ServiceReviewInput = z.infer<typeof ServiceReviewSchema>;
