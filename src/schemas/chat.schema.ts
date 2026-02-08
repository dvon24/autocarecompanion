import { z } from 'zod';
import { obdCodeEntrySchema } from './obd.schema';

/**
 * Chat Schema - Zod schemas for AI chat validation
 *
 * Follows Architecture patterns:
 * - Schema-first architecture with Zod
 * - TypeScript types derived via z.infer<>
 */

/**
 * Chat Message Role
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

/**
 * Chat Message Schema
 */
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Chat Session Schema
 * Represents a complete symptom diagnosis conversation
 */
export const ChatSessionSchema = z.object({
  id: z.string(),
  vehicleId: z.string().optional(), // Reference to vehicle context
  messages: z.array(ChatMessageSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

/**
 * Diagnosis Confidence Level
 */
export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

/**
 * Diagnosis Result Schema
 * When AI has enough info to provide a diagnosis
 */
export const DiagnosisSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: ConfidenceLevelSchema,
  possibleCauses: z.array(z.string()),
  recommendedAction: z.string().optional(),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

/**
 * Chat API Request Schema
 */
export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationHistory: z.array(ChatMessageSchema).optional(),
  vehicle: z.object({
    year: z.number(),
    make: z.string(),
    model: z.string(),
    trim: z.string(),
  }),
  obdCodes: z.array(obdCodeEntrySchema).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Chat API Response Schema
 */
export const ChatResponseSchema = z.object({
  message: ChatMessageSchema,
  diagnosis: DiagnosisSchema.nullable().optional(),
  needsMoreInfo: z.boolean().optional(),
  suggestedQuestions: z.array(z.string()).optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new chat message
 */
export function createChatMessage(
  role: MessageRole,
  content: string
): ChatMessage {
  return {
    id: generateMessageId(),
    role,
    content,
    timestamp: Date.now(),
  };
}
