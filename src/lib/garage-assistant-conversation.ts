import { isRecordBody } from '@/lib/maintenance-mutation';
import { isGarageAssistantWriteTool } from '@/lib/garage-assistant-tool-batch';
import {
  committedGarageActionFallback,
  resolveCommittedGarageActionMessage,
  type CommittedGarageAction,
} from '@/lib/garage-assistant-response';

export const GARAGE_ASSISTANT_MAX_PLANNING_ROUNDS = 3;
export const GARAGE_ASSISTANT_PROVIDER_BUDGET_MS = 45_000;

type Message = Record<string, unknown>;
type BatchResult = {
  toolResults: Array<{ tool_call_id: string; output: string }>;
  actions: CommittedGarageAction[];
};

// Reads can inform the write plan. Once a write batch has run, no further
// tool-capable request is made, including when the summary provider fails.
export async function runGarageAssistantConversation(deps: {
  messages: Message[];
  complete: (messages: Message[], allowTools: boolean, timeoutMs: number) => Promise<unknown>;
  executeBatch: (calls: unknown) => Promise<BatchResult>;
  now?: () => number;
}) {
  const now = deps.now ?? Date.now;
  const deadline = now() + GARAGE_ASSISTANT_PROVIDER_BUDGET_MS;
  const messages = [...deps.messages];
  const actions: CommittedGarageAction[] = [];
  let lastToolResults: BatchResult['toolResults'] = [];
  const complete = (allowTools: boolean) => {
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error('Garage assistant response deadline exceeded');
    return deps.complete(messages, allowTools, Math.min(25_000, remaining));
  };
  const fallback = () => ({
    message: actions.length
      ? committedGarageActionFallback(actions)
      : [committedGarageActionFallback(actions), ...lastToolResults.map((result) => result.output)].join('\n'),
    actions,
  });

  for (let round = 0; round < GARAGE_ASSISTANT_MAX_PLANNING_ROUNDS; round += 1) {
    let data: unknown;
    try {
      data = await complete(true);
    } catch (error) {
      if (lastToolResults.length) return fallback();
      throw error;
    }
    const choice = isRecordBody(data) && Array.isArray(data.choices) ? data.choices[0] : null;
    const assistant = isRecordBody(choice) && isRecordBody(choice.message) ? choice.message : null;
    if (!assistant) return fallback();
    if (!Array.isArray(assistant.tool_calls) || !assistant.tool_calls.length) {
      return { message: resolveCommittedGarageActionMessage(data, actions), actions };
    }

    const calls = assistant.tool_calls;
    const containsWrite = calls.some((call) => isRecordBody(call)
      && isRecordBody(call.function) && typeof call.function.name === 'string'
      && isGarageAssistantWriteTool(call.function.name));
    // The batch executor validates every call before its atomic transaction.
    const result = await deps.executeBatch(calls);
    actions.push(...result.actions);
    lastToolResults = result.toolResults;
    messages.push(assistant, ...result.toolResults.map((tool) => ({
      role: 'tool', tool_call_id: tool.tool_call_id, content: tool.output,
    })));

    if (containsWrite || actions.length) {
      messages.push({
        role: 'developer',
        content: `Tool execution is finished. Committed changes: ${JSON.stringify(actions)}. Confirm only these changes. Read results and unchanged mileage are not saved changes. If any requested service is still unlogged, say so and ask for its missing date or mileage. Do not request more tools.`,
      });
      try {
        const summary = await complete(false);
        return { message: resolveCommittedGarageActionMessage(summary, actions), actions };
      } catch {
        return fallback();
      }
    }
  }
  return fallback();
}
