import { z } from 'zod';

/**
 * Guide Schema - Zod schemas for repair guide validation
 *
 * Follows Architecture patterns:
 * - Schema-first architecture with Zod
 * - TypeScript types derived via z.infer<>
 * - Story 1.6: Guide Generation via AI
 * - FR71: Standardized guide data model
 */

/**
 * Safety Level Enum
 * Per FR40: DIY-Safe, DIY-Safe with Care, Requires Mechanic
 */
export const SafetyLevelSchema = z.enum([
  'diy-safe',
  'diy-safe-with-care',
  'requires-mechanic',
]);
export type SafetyLevel = z.infer<typeof SafetyLevelSchema>;

/**
 * Difficulty Rating (1-5 stars)
 * Per FR39: Difficulty rating scale
 */
export const DifficultySchema = z.number().int().min(1).max(5);
export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * Safety Warning within a step
 * Per FR16, FR58: Safety warnings with severity levels
 */
export const SafetyWarningSchema = z.object({
  id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  message: z.string(),
});
export type SafetyWarning = z.infer<typeof SafetyWarningSchema>;

/**
 * Inline Tip for stuck points
 * Per FR15, FR47: Inline tips for common stuck points
 */
export const TipSchema = z.object({
  id: z.string(),
  content: z.string(),
});
export type Tip = z.infer<typeof TipSchema>;

/**
 * Tool required for the guide
 * Per FR37: Required tools with cost ranges and alternatives
 */
export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string().optional(),
  costRange: z.string().optional(),
  alternatives: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});
export type Tool = z.infer<typeof ToolSchema>;

/**
 * Part required for the guide
 * Per FR38: Required parts with OEM vs aftermarket
 */
export const PartSchema = z.object({
  id: z.string(),
  name: z.string(),
  partNumber: z.string().optional(),
  oemPrice: z.string().optional(),
  aftermarketPrice: z.string().optional(),
  notes: z.string().optional(),
});
export type Part = z.infer<typeof PartSchema>;

/**
 * Guide Step
 * Per FR9: Step-by-step instructions
 */
export const GuideStepSchema = z.object({
  number: z.number().int().min(1),
  instruction: z.string(),
  tips: z.array(TipSchema).default([]),
  safetyWarnings: z.array(SafetyWarningSchema).default([]),
  estimatedMinutes: z.number().optional(),
});
export type GuideStep = z.infer<typeof GuideStepSchema>;

/**
 * Complete Repair Guide
 * Per FR71: Standardized guide data model
 */
export const GuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  vehicle: z.object({
    year: z.number(),
    make: z.string(),
    model: z.string(),
    trim: z.string(),
  }),
  diagnosis: z.object({
    id: z.string(),
    title: z.string(),
  }).optional(),
  difficulty: DifficultySchema,
  safetyLevel: SafetyLevelSchema,
  timeEstimate: z.string(), // e.g., "30-45 minutes"
  steps: z.array(GuideStepSchema),
  tools: z.array(ToolSchema).default([]),
  parts: z.array(PartSchema).default([]),
  source: z.enum(['ai-generated', 'verified-procedure']).optional(),
  createdAt: z.number(),
  version: z.number().default(1),
});
export type Guide = z.infer<typeof GuideSchema>;

/**
 * Guide Generation Request
 */
export const GuideGenerationRequestSchema = z.object({
  vehicle: z.object({
    year: z.number(),
    make: z.string(),
    model: z.string(),
    trim: z.string(),
  }),
  diagnosis: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    confidence: z.enum(['high', 'medium', 'low']),
  }),
});
export type GuideGenerationRequest = z.infer<typeof GuideGenerationRequestSchema>;

/**
 * Guide Generation Response
 */
export const GuideGenerationResponseSchema = z.object({
  guide: GuideSchema,
  generationTimeMs: z.number().optional(),
});
export type GuideGenerationResponse = z.infer<typeof GuideGenerationResponseSchema>;

/**
 * Generate a unique guide ID
 */
export function generateGuideId(): string {
  return `guide_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
