import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';
import { logApiCost, isBudgetExceeded } from '@/lib/costs';
import {
  isMaintenanceMutationError,
  isRecordBody,
} from '@/lib/maintenance-mutation';
import { createGarageAssistantToolBatchExecutor } from '@/lib/garage-assistant-tool-batch';
import { executeGarageAssistantProductionTool } from '@/lib/garage-assistant-production-tool';
import { committedGarageActionFallback, resolveCommittedGarageActionMessage } from '@/lib/garage-assistant-response';

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
    .map(([id, s]) => `- ${id}: ${s.name} (every ${s.defaultIntervalMiles.toLocaleString()} mi)`)
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
When logging maintenance, always ask for the mileage if not provided.
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
      where: { userId: session.user.id },
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

    // Call OpenAI with tools
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.6-sol',
        messages,
        tools,
        tool_choice: 'auto',
        max_completion_tokens: 500,
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to process request' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Story 7.1: Log API cost for initial call
    if (data.usage) {
      logApiCost(
        'garage_assistant',
        data.usage.prompt_tokens || 0,
        data.usage.completion_tokens || 0,
        'gpt-5.6-sol'
      );
    }

    // Check if there are tool calls to execute
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const { toolResults, actions } = await executeGarageAssistantToolBatch(
        assistantMessage.tool_calls,
        session.user.id,
      );

      // Get final response after tool execution
      const followUpMessages = [
        ...messages,
        assistantMessage,
        ...toolResults.map(tr => ({
          role: 'tool' as const,
          tool_call_id: tr.tool_call_id,
          content: tr.output,
        })),
      ];

      let followUpResponse: Response;
      try {
        followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-5.6-sol',
            messages: followUpMessages,
            max_completion_tokens: 500,
          }),
          signal: AbortSignal.timeout(25_000),
        });
      } catch {
        return NextResponse.json({ message: committedGarageActionFallback(actions), actions });
      }

      if (!followUpResponse.ok) {
        // Return tool results directly if follow-up fails
        return NextResponse.json({
          message: committedGarageActionFallback(actions),
          actions,
        });
      }

      const followUpData = await followUpResponse.json().catch(() => null);

      // Story 7.1: Log API cost for follow-up call
      if (followUpData?.usage) {
        logApiCost(
          'garage_assistant',
          followUpData.usage.prompt_tokens || 0,
          followUpData.usage.completion_tokens || 0,
          'gpt-5.6-sol'
        );
      }

      return NextResponse.json({
        message: resolveCommittedGarageActionMessage(followUpData, actions),
        actions,
      });
    }

    // No tool calls - just return the message
    return NextResponse.json({
      message: assistantMessage.content,
      actions: null,
    });

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
