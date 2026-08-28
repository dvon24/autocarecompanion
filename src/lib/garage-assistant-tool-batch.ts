import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { prisma as prismaClient } from '@/lib/db';
import { isLoggableMaintenanceType } from '@/lib/maintenance';
import { isRecordBody, MaintenanceMutationError } from '@/lib/maintenance-mutation';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { isAcceptedMaintenanceDate } from '@/lib/twin-route-contracts';

const PRODUCTION_GARAGE_TOOLS = new Set([
  'update_mileage', 'log_maintenance', 'get_vehicle_info', 'list_vehicles', 'get_maintenance_status',
]);

export type GarageAssistantToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

type PreparedToolCall = GarageAssistantToolCall & { args: Record<string, unknown> };
const PRISMA_INT_MAX = 2_147_483_647;
const vehicleId = z.string().trim().min(1);
const TOOL_ARGUMENT_SCHEMAS = {
  update_mileage: z.object({
    vehicleId,
    mileage: z.number().finite().int().min(0).max(PRISMA_INT_MAX),
  }).strict(),
  log_maintenance: z.object({
    vehicleId,
    type: z.string().trim().refine(isLoggableMaintenanceType),
    mileage: z.number().finite().int().min(0).max(PRISMA_INT_MAX),
    date: z.string().refine(isAcceptedMaintenanceDate),
    cost: z.number().finite().min(0).optional(),
    notes: z.string().max(2000).optional(),
  }).strict(),
  get_vehicle_info: z.object({ vehicleId }).strict(),
  list_vehicles: z.object({}).strict(),
  get_maintenance_status: z.object({ vehicleId }).strict(),
} as const;

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function prepareToolCalls(toolCalls: unknown): PreparedToolCall[] {
  if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
    throw new MaintenanceMutationError('Invalid assistant tool calls', 400);
  }
  return toolCalls.map((unknownCall) => {
    if (!isRecordBody(unknownCall) || !hasOnlyKeys(unknownCall, ['id', 'type', 'function'])) {
      throw new MaintenanceMutationError('Invalid assistant tool call', 400);
    }
    if (unknownCall.type !== 'function') {
      throw new MaintenanceMutationError('Invalid assistant tool call', 400);
    }
    const id = typeof unknownCall.id === 'string' ? unknownCall.id.trim() : '';
    const unknownFunction = unknownCall.function;
    if (!id || !isRecordBody(unknownFunction) || !hasOnlyKeys(unknownFunction, ['name', 'arguments'])) {
      throw new MaintenanceMutationError('Invalid assistant tool call', 400);
    }
    const name = typeof unknownFunction.name === 'string' ? unknownFunction.name.trim() : '';
    const rawArguments = unknownFunction.arguments;
    if (!name || typeof rawArguments !== 'string' || !PRODUCTION_GARAGE_TOOLS.has(name)) {
      throw new MaintenanceMutationError(name ? `Unknown assistant tool: ${name}` : 'Invalid assistant tool call', 400);
    }
    let args: unknown;
    try {
      args = JSON.parse(rawArguments);
    } catch {
      throw new MaintenanceMutationError('Invalid assistant tool arguments', 400);
    }
    if (!isRecordBody(args)) throw new MaintenanceMutationError('Invalid assistant tool arguments', 400);
    const schema = TOOL_ARGUMENT_SCHEMAS[name as keyof typeof TOOL_ARGUMENT_SCHEMAS];
    const parsedArgs = schema.safeParse(args);
    if (!parsedArgs.success) throw new MaintenanceMutationError('Invalid assistant tool arguments', 400);
    return { id, function: { name, arguments: rawArguments }, args: parsedArgs.data };
  });
}

export function createGarageAssistantToolBatchExecutor(deps: {
  prisma: typeof prismaClient;
  now?: () => Date;
  executeTool: (
    toolName: string,
    args: Record<string, unknown>,
    userId: string,
    tx: Prisma.TransactionClient,
    operationTime: Date,
  ) => Promise<string>;
}) {
  return async function executeGarageAssistantToolBatch(
    toolCalls: unknown,
    userId: string,
  ) {
    const preparedCalls = prepareToolCalls(toolCalls);
    const operationTime = deps.now?.() ?? new Date();
    try {
      return await deps.prisma.$transaction(async (tx) => {
        const toolResults: Array<{ tool_call_id: string; output: string }> = [];
        const actions: Array<{ tool: string; result: string }> = [];
        for (const toolCall of preparedCalls) {
          const result = await deps.executeTool(toolCall.function.name, toolCall.args, userId, tx, operationTime);
          toolResults.push({ tool_call_id: toolCall.id, output: result });
          actions.push({ tool: toolCall.function.name, result });
        }
        return { toolResults, actions };
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (isPrismaWriteConflict(error)) {
        throw new MaintenanceMutationError('The garage changed while assistant actions were saving. Refresh and try again.', 409);
      }
      throw error;
    }
  };
}
