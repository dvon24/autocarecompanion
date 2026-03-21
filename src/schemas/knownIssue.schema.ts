import { z } from 'zod';

/**
 * Citation source for known issue evidence
 */
export const citationSchema = z.object({
  type: z.enum(['tsb', 'recall', 'forum', 'manual']),
  title: z.string(),
  url: z.string().url().optional(),
});

/**
 * Community recommendation for parts/fixes
 */
export const communityRecommendationSchema = z.object({
  type: z.enum(['part', 'tip', 'warning']),
  content: z.string(),
  partName: z.string().optional(),
  partBrand: z.string().optional(),
  partNumber: z.string().optional(),
  upvotes: z.number().default(0),
  needsReview: z.boolean().optional(),
  affiliateUrl: z.string().url().optional(),
  affiliateLink: z.string().url().optional(),
  amazonLink: z.string().url().optional(),
});

/**
 * Vehicle matching criteria
 */
export const vehicleMatchSchema = z.object({
  years: z.array(z.number()),
  make: z.string(),
  model: z.string(),
  trims: z.array(z.string()).optional(),
  engines: z.array(z.string()).optional(),
});

/**
 * Issue categories for grouping
 */
export const issueCategorySchema = z.enum([
  'engine',
  'transmission',
  'drivetrain',
  'electrical',
  'brakes',
  'suspension',
  'cooling',
  'fuel',
  'interior',
  'exterior',
  'body',
  'safety',
  'exhaust',
  'steering',
  'hvac',
  'emissions',
  'other',
]);

/**
 * Known issue schema
 */
export const knownIssueSchema = z.object({
  id: z.string(),
  vehicleMatch: vehicleMatchSchema,
  category: issueCategorySchema,
  title: z.string(),
  description: z.string(),
  solution: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  confidence: z.enum(['high', 'medium', 'low']),
  symptoms: z.array(z.string()),
  affectedSystems: z.array(z.string()).optional(),
  estimatedCost: z.object({
    low: z.number(),
    high: z.number(),
  }).optional(),
  typicalMileage: z.object({
    low: z.number(),
    high: z.number(),
  }).optional(),
  citations: z.array(citationSchema),
  communityRecommendations: z.array(communityRecommendationSchema).optional(),
  humanApproved: z.boolean(),
  lastReportedByOwners: z.string(), // When owners last reported this issue
  reviewedOn: z.string(), // When we verified/reviewed the issue
  reportCount: z.number(),
  status: z.enum(['published', 'pending_review', 'archived']),
  dtcCodes: z.array(z.string()).optional(),
});

/**
 * Issue report from user
 */
export const issueReportSchema = z.object({
  vehicleYear: z.number(),
  vehicleMake: z.string(),
  vehicleModel: z.string(),
  vehicleTrim: z.string().optional(),
  description: z.string(),
  severity: z.enum(['high', 'medium', 'low']).optional(),
  timestamp: z.string(),
  ipHash: z.string(),
});

/**
 * Captured symptom from chat (anonymous)
 */
export const symptomCaptureSchema = z.object({
  vehicle: z.object({
    year: z.number(),
    make: z.string(),
    model: z.string(),
    trim: z.string().optional(),
  }),
  symptoms: z.array(z.string()),
  obdCodes: z.array(z.string()).optional(),
  diagnosisTitle: z.string().optional(),
  sessionHash: z.string(),
  timestamp: z.string(),
});

// TypeScript types
export type Citation = z.infer<typeof citationSchema>;
export type CommunityRecommendation = z.infer<typeof communityRecommendationSchema>;
export type VehicleMatch = z.infer<typeof vehicleMatchSchema>;
export type IssueCategory = z.infer<typeof issueCategorySchema>;
export type KnownIssue = z.infer<typeof knownIssueSchema>;
export type IssueReport = z.infer<typeof issueReportSchema>;
export type SymptomCapture = z.infer<typeof symptomCaptureSchema>;
