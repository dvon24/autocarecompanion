import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';
import { logApiCost, isBudgetExceeded } from '@/lib/costs';

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
          mileage: { type: 'number', description: 'The new mileage reading' },
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
          mileage: { type: 'number', description: 'Mileage at time of service' },
          date: { type: 'string', description: 'Date of service (ISO format or natural language like "today", "yesterday")' },
          cost: { type: 'number', description: 'Cost of service (optional)' },
          notes: { type: 'string', description: 'Additional notes (optional)' },
        },
        required: ['vehicleId', 'type', 'mileage'],
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

// Execute tool calls
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<string> {
  switch (toolName) {
    case 'list_vehicles': {
      const vehicles = await prisma.vehicle.findMany({
        where: { userId },
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          nickname: true,
          currentMileage: true,
          isPrimary: true,
        },
      });

      if (vehicles.length === 0) {
        return 'No vehicles found in your garage.';
      }

      return JSON.stringify(vehicles.map((v: any) => ({
        id: v.id,
        name: v.nickname || `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
        mileage: v.currentMileage,
        isPrimary: v.isPrimary,
      })));
    }

    case 'get_vehicle_info': {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: args.vehicleId as string, userId },
        include: {
          maintenanceRecords: {
            orderBy: { date: 'desc' },
            take: 10,
          },
        },
      });

      if (!vehicle) {
        return 'Vehicle not found.';
      }

      return JSON.stringify({
        id: vehicle.id,
        name: vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        vin: vehicle.vin,
        currentMileage: vehicle.currentMileage,
        recentMaintenance: vehicle.maintenanceRecords.map(r => ({
          type: r.type,
          typeName: MAINTENANCE_SCHEDULES[r.type]?.name || r.type,
          date: r.date.toISOString().split('T')[0],
          mileage: r.mileage,
          cost: r.cost,
        })),
      });
    }

    case 'update_mileage': {
      const mileage = args.mileage as number;
      const vehicleId = args.vehicleId as string;

      // Verify vehicle belongs to user
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId },
      });

      if (!vehicle) {
        return 'Vehicle not found or access denied.';
      }

      // Update mileage
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          currentMileage: mileage,
          lastMileageUpdate: new Date(),
        },
      });

      // Log to mileage history
      await prisma.mileageLog.create({
        data: {
          vehicleId,
          mileage,
        },
      });

      return `Updated mileage to ${mileage.toLocaleString()} miles for ${vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}.`;
    }

    case 'log_maintenance': {
      const vehicleId = args.vehicleId as string;
      const type = args.type as string;
      const mileage = args.mileage as number;
      const cost = args.cost as number | undefined;
      const notes = args.notes as string | undefined;

      // Parse date
      let date = new Date();
      if (args.date) {
        const dateStr = (args.date as string).toLowerCase();
        if (dateStr === 'today') {
          date = new Date();
        } else if (dateStr === 'yesterday') {
          date = new Date();
          date.setDate(date.getDate() - 1);
        } else {
          date = new Date(args.date as string);
        }
      }

      // Verify vehicle belongs to user
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId },
      });

      if (!vehicle) {
        return 'Vehicle not found or access denied.';
      }

      const schedule = MAINTENANCE_SCHEDULES[type];
      if (!schedule) {
        return `Unknown maintenance type: ${type}`;
      }

      // Calculate next due mileage
      const nextDueMileage = mileage + schedule.defaultIntervalMiles;
      const nextDueDate = new Date(date);
      nextDueDate.setMonth(nextDueDate.getMonth() + schedule.defaultIntervalMonths);

      // Create maintenance record
      await prisma.maintenanceRecord.create({
        data: {
          vehicleId,
          type,
          mileage,
          date,
          cost,
          notes,
          nextDueMileage,
          nextDueDate,
        },
      });

      // Also update current mileage if this is higher
      if (!vehicle.currentMileage || mileage > vehicle.currentMileage) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            currentMileage: mileage,
            lastMileageUpdate: new Date(),
          },
        });
      }

      return `Logged ${schedule.name} at ${mileage.toLocaleString()} miles${cost ? ` ($${cost.toFixed(2)})` : ''}. Next due at ${nextDueMileage.toLocaleString()} miles.`;
    }

    case 'get_maintenance_status': {
      const vehicleId = args.vehicleId as string;

      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId },
        include: {
          maintenanceRecords: true,
        },
      });

      if (!vehicle) {
        return 'Vehicle not found.';
      }

      if (!vehicle.currentMileage) {
        return 'Please update your current mileage first to see maintenance status.';
      }

      const statuses: Array<{ type: string; status: string; message: string }> = [];

      for (const [typeId, schedule] of Object.entries(MAINTENANCE_SCHEDULES)) {
        const records = vehicle.maintenanceRecords
          .filter(r => r.type === typeId)
          .sort((a, b) => b.mileage - a.mileage);

        const lastRecord = records[0];

        if (!lastRecord) {
          // No history - assume due at first interval
          const dueAt = schedule.defaultIntervalMiles;
          if (vehicle.currentMileage >= dueAt) {
            statuses.push({
              type: schedule.name,
              status: 'overdue',
              message: `Overdue - no service history recorded`,
            });
          } else {
            statuses.push({
              type: schedule.name,
              status: 'unknown',
              message: `No history - due at ${dueAt.toLocaleString()} mi`,
            });
          }
        } else {
          const dueAtMileage = lastRecord.nextDueMileage || lastRecord.mileage + schedule.defaultIntervalMiles;
          const milesUntilDue = dueAtMileage - vehicle.currentMileage;

          if (milesUntilDue <= 0) {
            statuses.push({
              type: schedule.name,
              status: 'overdue',
              message: `Overdue by ${Math.abs(milesUntilDue).toLocaleString()} miles`,
            });
          } else if (milesUntilDue < 500) {
            statuses.push({
              type: schedule.name,
              status: 'due_soon',
              message: `Due in ${milesUntilDue.toLocaleString()} miles`,
            });
          } else {
            statuses.push({
              type: schedule.name,
              status: 'ok',
              message: `Due at ${dueAtMileage.toLocaleString()} mi (${milesUntilDue.toLocaleString()} mi remaining)`,
            });
          }
        }
      }

      // Sort by urgency
      const sorted = statuses.sort((a, b) => {
        const order = { overdue: 0, due_soon: 1, unknown: 2, ok: 3 };
        return (order[a.status as keyof typeof order] ?? 4) - (order[b.status as keyof typeof order] ?? 4);
      });

      return JSON.stringify(sorted);
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

interface VehicleContext {
  vehicleId: string;
  vehicleName?: string;
  overdueItems?: Array<{ type: string; name: string }>;
  dueSoonItems?: Array<{ type: string; name: string }>;
}

function getSystemPrompt(
  vehicles: Array<{ id: string; name: string; mileage: number | null }>,
  vehicleContext?: VehicleContext
) {
  const vehicleList = vehicles.length > 0
    ? vehicles.map((v: any) => `- ${v.name} (ID: ${v.id}, Mileage: ${v.mileage?.toLocaleString() || 'unknown'})`).join('\n')
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
  }

  return `You are a helpful garage assistant for AutoCare Companion. You help users manage their vehicles and maintenance records.

Current user's vehicles:
${vehicleList}

Available maintenance types:
${maintenanceTypes}${contextInfo}

When the user mentions a vehicle by name, use the matching vehicle ID from the list above.
When logging maintenance, always ask for the mileage if not provided.
Be conversational and helpful. Confirm actions after completing them.
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

    const { message, conversationHistory = [], vehicleContext } = await request.json();

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

    const vehicleList = vehicles.map((v: any) => ({
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
      const toolResults: Array<{ tool_call_id: string; output: string }> = [];
      const actions: Array<{ tool: string; result: string }> = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(
          toolCall.function.name,
          args,
          session.user.id
        );
        toolResults.push({
          tool_call_id: toolCall.id,
          output: result,
        });
        actions.push({
          tool: toolCall.function.name,
          result,
        });
      }

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

      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

      if (!followUpResponse.ok) {
        // Return tool results directly if follow-up fails
        return NextResponse.json({
          message: actions.map(a => a.result).join('\n'),
          actions,
        });
      }

      const followUpData = await followUpResponse.json();

      // Story 7.1: Log API cost for follow-up call
      if (followUpData.usage) {
        logApiCost(
          'garage_assistant',
          followUpData.usage.prompt_tokens || 0,
          followUpData.usage.completion_tokens || 0,
          'gpt-5.6-sol'
        );
      }

      return NextResponse.json({
        message: followUpData.choices[0].message.content,
        actions,
      });
    }

    // No tool calls - just return the message
    return NextResponse.json({
      message: assistantMessage.content,
      actions: null,
    });

  } catch (error) {
    console.error('Garage assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
