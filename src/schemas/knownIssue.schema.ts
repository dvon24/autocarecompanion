import { z } from 'zod';

/**
 * Citation source for known issue evidence
 */
export const citationSchema = z.object({
  // `manufacturer` is emitted for official OEM campaign/bulletin pages;
  // `investigation` identifies official NHTSA ODI investigation documents.
  type: z.enum(['tsb', 'recall', 'forum', 'manual', 'nhtsa', 'manufacturer', 'investigation']),
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
 * fixParts — the buyable resolution: the exact part(s) to fix this issue,
 * PN-precise with validated buy-links built from the verified part number.
 * The au7o differentiator (problem -> proven fix -> the exact part to buy).
 */
export const fixPartSchema = z.object({
  component: z.string(),
  oemPartNumber: z.string().nullable().optional().default(''),
  aftermarketXref: z.array(z.string()).optional().default([]),
  priceLow: z.number().nullable().optional(),
  priceHigh: z.number().nullable().optional(),
  note: z.string().optional().default(''),
  buyLinks: z.array(z.object({
    vendor: z.string(),
    url: z.string(),
    linkType: z.string().optional(),
    verified: z.boolean().optional(),
    affiliate: z.boolean().optional(),
  })).optional().default([]),
  /**
   * FITMENT SCOPE — which vehicles WITHIN the article's span this exact part fits.
   *
   * An article commonly spans more years than any one part number does: a
   * 2007-2016 page can carry a pump that only fits 2009-2013. Before this field
   * existed there was nowhere to say so, and the caveat lived in `note` prose
   * that only a human could read.
   *
   * ABSENT means "not yet scoped", NOT "fits everything". Treat an unscoped part
   * as inheriting the article's own vehicle match — that is how every part
   * already in the catalog behaves, so adding this field changes nothing until a
   * part is deliberately scoped.
   */
  fitment: z.object({
    years: z.array(z.number()).optional(),
    engines: z.array(z.string()).optional(),
    trims: z.array(z.string()).optional(),
  }).optional(),
  // ── record-store audit fields (from the parts-audit persist) ──
  /**
   * Year/engine/package-keyed PN rows when fitment splits (TIPM-style).
   * `scope` is human-readable; `fitment` is the machine-readable form that
   * lets a renderer pick the right PN for a specific vehicle on its own.
   */
  variants: z.array(z.object({
    scope: z.string(),
    oemPartNumber: z.string(),
    note: z.string().optional().default(''),
    fitment: z.object({
      years: z.array(z.number()).optional(),
      engines: z.array(z.string()).optional(),
      trims: z.array(z.string()).optional(),
    }).optional(),
  })).optional().default([]),
  /** True when this issue is recall-covered → the primary CTA is a free VIN check. */
  recallFirst: z.boolean().optional(),
  /** Guaranteed-live descriptive search — the fallback if a deep link rots. */
  fallbackUrl: z.string().optional(),
  /** The buy links were web-search-verified to real product pages. */
  verified: z.boolean().optional(),
  provenance: z.string().optional(),
  confidence: z.number().nullable().optional(),
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
  fixParts: z.array(fixPartSchema).optional(),
  source: z.enum(['nhtsa-verified', 'recall-related', 'ai-researched', 'manual']).optional(),
  humanApproved: z.boolean(),
  lastReportedByOwners: z.string(), // When owners last reported this issue
  reviewedOn: z.string(), // When we verified/reviewed the issue
  /** Date-only ISO value for the latest meaningful public content correction. */
  contentUpdatedOn: z.string().optional(),
  /** Short, human-authored explanation paired with contentUpdatedOn. */
  contentUpdateSummary: z.string().optional(),
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
export type FixPart = z.infer<typeof fixPartSchema>;
export type VehicleMatch = z.infer<typeof vehicleMatchSchema>;
export type IssueCategory = z.infer<typeof issueCategorySchema>;
export type KnownIssue = z.infer<typeof knownIssueSchema>;
export type IssueReport = z.infer<typeof issueReportSchema>;
export type SymptomCapture = z.infer<typeof symptomCaptureSchema>;
