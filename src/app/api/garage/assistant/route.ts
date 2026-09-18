import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { prisma } from '@/lib/db';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';
import { logApiCost, isBudgetExceeded } from '@/lib/costs';
import {
  isMaintenanceMutationError,
  MaintenanceMutationError,
  isRecordBody,
} from '@/lib/maintenance-mutation';
import { createGarageAssistantToolBatchExecutor } from '@/lib/garage-assistant-tool-batch';
import { executeGarageAssistantProductionTool } from '@/lib/garage-assistant-production-tool';
import { runGarageAssistantConversation } from '@/lib/garage-assistant-conversation';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Tools the assistant can use
const tools = [
  {
    type: 'function',
    function: {
      name: 'update_mileage',
      description: 'Update the current mileage for a vehicle',
      parameters: {
        type: 'object',
        properties: {
          vehicleId: { type: 'string', description: 'The vehicle ID to update' },
          mileage: { type: 'integer', minimum: 0, maximum: 2147483647, description: 'The new mileage reading' },
        },
        required: ['vehicleId', 'mileage'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_maintenance',
      description: 'Log a maintenance record for a vehicle',
      parameters: {
        type: 'object',
        properties: {
          vehicleId: { type: 'string', description: 'The vehicle ID' },
          type: {
            type: 'string',
            enum: Object.keys(MAINTENANCE_SCHEDULES),
            description: 'Type of maintenance performed',
          },
          mileage: { type: 'integer', minimum: 0, maximum: 2147483647, description: 'Mileage at time of service' },
          date: { type: 'string', description: 'Exact YYYY-MM-DD date, or ISO datetime with an explicit UTC offset' },
          cost: { type: 'number', description: 'Cost of service (optional)' },
          notes: { type: 'string', description: 'Additional notes (optional)' },
          shopName: { type: 'string', description: 'Shop or provider name, only when the user supplied it (optional)' },
        },
        required: ['vehicleId', 'type', 'mileage', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_vehicle_info',
      description: 'Get information about a vehicle including maintenance history',
      parameters: {
        type: 'object',
        properties: {
          vehicleId: { type: 'string', description: 'The vehicle ID to look up' },
        },
        required: ['vehicleId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_vehicles',
      description: 'List all vehicles in the user\'s garage',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_maintenance_status',
      description: 'Get the maintenance status and what\'s due for a vehicle',
      parameters: {
        type: 'object',
        properties: {
          vehicleId: { type: 'string', description: 'The vehicle ID' },
        },
        required: ['vehicleId'],
      },
    },
  },
];

// Production tool execution lives in an importable seam so route behavior is executable in tests.

const executeGarageAssistantToolBatch = createGarageAssistantToolBatchExecutor({
  prisma,
  executeTool: executeGarageAssistantProductionTool,
});

interface VehicleContext {
  vehicleId: string;
  vehicleName?: string;
  timeZone?: string;
  selectedMaintenanceType?: string;
  overdueItems?: Array<{ type: string; name: string }>;
  dueSoonItems?: Array<{ type: string; name: string }>;
}

function getSystemPrompt(
  vehicles: Array<{ id: string; name: string; mileage: number | null }>,
  vehicleContext?: VehicleContext
) {
  let calendarDate = new Date().toISOString().slice(0, 10);
  if (vehicleContext?.timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: vehicleContext.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date());
      const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      calendarDate = `${value.year}-${value.month}-${value.day}`;
    } catch {
      // Invalid client zones fall back to the server's UTC calendar date.
    }
  }
  const vehicleList = vehicles.length > 0
    ? vehicles.map((v) => `- ${v.name} (ID: ${v.id}, Mileage: ${v.mileage?.toLocaleString() || 'unknown'})`).join('\n')
    : 'No vehicles in garage yet.';

  const maintenanceTypes = Object.entries(MAINTENANCE_SCHEDULES)
    .map(([id, s]) => `- ${id}: ${s.name}`)
    .join('\n');

  let contextInfo = '';
  if (vehicleContext) {
    contextInfo = `\n\nCURRENT CONTEXT:
The user is viewing: ${vehicleContext.vehicleName || 'a vehicle'} (ID: ${vehicleContext.vehicleId})
When the user says "this vehicle", "my car", or similar, they mean this vehicle.
Always use this vehicle ID unless the user explicitly mentions a different vehicle.`;

    if (vehicleContext.overdueItems && vehicleContext.overdueItems.length > 0) {
      contextInfo += `\n\nOVERDUE MAINTENANCE for this vehicle:
${vehicleContext.overdueItems.map(i => `- ${i.name} (type: ${i.type})`).join('\n')}
If the user wants to log one of these, use the type ID shown in parentheses.`;
    }

    if (vehicleContext.dueSoonItems && vehicleContext.dueSoonItems.length > 0) {
      contextInfo += `\n\nDUE SOON for this vehicle:
${vehicleContext.dueSoonItems.map(i => `- ${i.name} (type: ${i.type})`).join('\n')}`;
    }

    const selectedMaintenance = vehicleContext.selectedMaintenanceType
      ? MAINTENANCE_SCHEDULES[vehicleContext.selectedMaintenanceType]
      : null;
    if (selectedMaintenance) {
      contextInfo += `\n\nSELECTED TECH-TREE SERVICE:
- ${selectedMaintenance.name} (type: ${vehicleContext.selectedMaintenanceType})
If the user asks to log "this" or "it", use this reviewed type. Still ask for any required mileage or completion date that is missing.`;
    }
  }

  return `You are a helpful garage assistant for AutoCare Companion. You help users manage their vehicles and maintenance records.

Today's calendar date for the owner is ${calendarDate}. Resolve words such as "today" to that exact YYYY-MM-DD value before calling a write tool.

Current user's vehicles:
${vehicleList}

Available maintenance types:
${maintenanceTypes}${contextInfo}

When the user mentions a vehicle by name, use the matching vehicle ID from the list above.
When logging maintenance, ask for the completion date and service mileage if either is missing. Do not infer the service mileage from the vehicle's current mileage, or assume the service happened today.
Plan all explicitly requested services before writing. You may read vehicle information first; then include every ready maintenance log and any requested mileage update in a single tool-call batch. Updating mileage alone does not log a completed service. For example, an oil and filter change plus spark plugs requires both oil_change and spark_plugs records. Do not silently omit a requested service.
Do not invent related work: front-only brakes do not mean rear or all-axle brakes. If the available maintenance type cannot represent the stated scope accurately, ask a focused clarification before logging that service. Preserve user-supplied service scope in notes.
Be conversational and helpful. Confirm actions only after the corresponding tool call completed successfully. If details are missing, ask one focused follow-up and do not imply anything was saved.
If the user says "yes" or confirms logging an overdue/due soon item, use the correct vehicle ID and maintenance type.
If the user asks about something outside of vehicle/maintenance management, politely explain you can only help with garage-related tasks.

IMPORTANT: Do not use markdown formatting in your responses. Use plain text only - no asterisks, no bold, no italics. Keep responses concise and friendly.`;
}

export async function POST(request: Request) {
  try {
    // Story 7.3: Check budget before making API call
    if (isBudgetExceeded()) {
      return NextResponse.json(
        {
          error: 'Monthly API budget exceeded. Garage assistant is temporarily limited.',
          budgetExceeded: true,
        },
        { status: 429 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!isRecordBody(requestBody)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const message = requestBody.message;
    const conversationHistory = requestBody.conversationHistory ?? [];
    const vehicleContext = requestBody.vehicleContext as VehicleContext | undefined;
    const betaVehicleId = !session.user.capabilities?.personalAi && typeof vehicleContext?.vehicleId === 'string'
      && await canUsePersonalVehicle(session.user.id, vehicleContext.vehicleId) ? vehicleContext.vehicleId : null;
    if (!session.user.capabilities?.personalAi && !betaVehicleId) return NextResponse.json({ error: 'hub_required' }, { status: 403 });

    if (!message || typeof message !== 'string' || message.length > 8_000) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Bound the client-supplied history before it reaches OpenAI — it was
    // forwarded unvalidated and unbounded (2026-06-11 review finding).
    const boundedHistory = (Array.isArray(conversationHistory) ? conversationHistory : [])
      .filter((m: { role?: string; content?: string }) =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content.slice(0, 8_000) }));

    // Get user's vehicles for context
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: session.user.id, ...(betaVehicleId ? { id: betaVehicleId } : {}) },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        nickname: true,
        currentMileage: true,
      },
    });

    const vehicleList = vehicles.map((v) => ({
      id: v.id,
      name: v.nickname || `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
      mileage: v.currentMileage,
    }));

    // If no API key, return mock response
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        message: "I'm your garage assistant! I can help you log maintenance, update mileage, and check what's due. What would you like to do?",
        action: null,
      });
    }

    const messages = [
      { role: 'developer', content: getSystemPrompt(vehicleList, vehicleContext) },
      ...boundedHistory,
      { role: 'user', content: message },
    ];

    const result = await runGarageAssistantConversation({
      messages,
      executeBatch: (calls) => (betaVehicleId ? createGarageAssistantToolBatchExecutor({ prisma, executeTool: async (name, args, userId, tx, now) => {
        if (name === 'list_vehicles') return JSON.stringify(vehicleList);
        if (args.vehicleId !== betaVehicleId) throw new MaintenanceMutationError('This trial covers only its claimed vehicle.', 403);
        return executeGarageAssistantProductionTool(name, args, userId, tx, now);
      } }) : executeGarageAssistantToolBatch)(calls, session.user.id),
      complete: async (roundMessages, allowTools, timeoutMs) => {
        if (isBudgetExceeded()) throw new Error('Garage assistant API budget exceeded');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-5.6-sol',
            messages: roundMessages,
            ...(allowTools ? { tools, tool_choice: 'auto' } : {}),
            max_completion_tokens: 500,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
          console.error('OpenAI garage assistant error:', response.status);
          throw new Error('Failed to process garage assistant request');
        }
        const data = await response.json();
        if (data.usage) {
          logApiCost('garage_assistant', data.usage.prompt_tokens || 0,
            data.usage.completion_tokens || 0, 'gpt-5.6-sol');
        }
        return data;
      },
    });
    return NextResponse.json(result);

  } catch (error) {
    if (isMaintenanceMutationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Garage assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
