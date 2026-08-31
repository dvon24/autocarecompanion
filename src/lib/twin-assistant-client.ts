export type TwinAssistantVehicle = {
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  currentMileage?: number;
};

export type TwinAssistantNodeContext = {
  id?: string;
  label: string;
  where?: string;
  spec?: string;
  life?: string;
  brand?: string;
  partNo?: string;
  price?: string;
  dueNote?: string;
  sourceLabel?: string;
  knownIssueTitle?: string;
  maintenanceType?: string;
};

export type TwinAssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type StreamArgs = {
  vehicle: TwinAssistantVehicle;
  messages: TwinAssistantMessage[];
  sessionId?: string | null;
  knownIssueTitles?: Array<{ id: string; title: string }>;
  selectedNode?: TwinAssistantNodeContext | null;
  onToken?: (text: string) => void;
  onSession?: (sessionId: string) => void;
  fetcher?: typeof fetch;
};

export type TwinAssistantCommittedAction = {
  tool: 'update_mileage' | 'log_maintenance';
  result: string;
};

export type TwinAssistantResult = {
  text: string;
  sessionId: string | null;
  route: 'information' | 'mutation';
  committedActions: TwinAssistantCommittedAction[];
  awaitingMutationDetails: boolean;
};

const MUTATION_SUBJECT = '(?:mileage|odometer|oil(?:\\s+change)?|maintenance|service|fluid|filter|brakes?|rotors?|tires?|coolant|spark\\s+plugs?|belt|wipers?)';
const MUTATION_VERB = '(?:update|set|change|log|record|add|save|mark)';

/** Keep response-only mechanic chat for questions, and reserve the authenticated
 * garage tools for clear owner write requests. Demo mode never supplies an
 * ownerVehicleId, so it cannot cross this boundary. */
export function isTwinMutationIntent(message: string, hasSelectedMaintenance = false): boolean {
  const value = message.trim();
  if (!value) return false;
  const explicitWrite = new RegExp(`\\b${MUTATION_VERB}\\b[\\s\\S]{0,80}\\b${MUTATION_SUBJECT}\\b`, 'i');
  const mileageStatement = /\b(?:my\s+)?(?:mileage|odometer)\s+(?:is|reads?|shows?)\s+[\d,.]+\b/i;
  const completedService = /\b(?:i|we)\s+(?:just\s+)?(?:changed|replaced|serviced|did|completed|had|got)\b[\s\S]{0,80}\b(?:oil|fluid|filter|brakes?|rotors?|tires?|coolant|spark\s+plugs?|belt|wipers?|service|maintenance)\b/i;
  const contextualWrite = hasSelectedMaintenance && (
    /\b(?:log|record|save|mark)\b[\s\S]{0,50}\b(?:this|it)\b/i.test(value)
    || /\b(?:i|we)\s+(?:just\s+)?(?:changed|replaced|serviced|did|completed)\s+(?:this|it)\b/i.test(value)
  );
  const asksForInformation = /^(?:when|how(?:\s+often|\s+do|\s+can|\s+should)?|what|why|should\s+i|do\s+i\s+need)\b/i.test(value);
  const directWriteQuestion = explicitWrite.test(value) && /\d/.test(value);
  if (asksForInformation && !directWriteQuestion) return false;
  return explicitWrite.test(value) || mileageStatement.test(value) || completedService.test(value) || contextualWrite;
}

function committedActions(value: unknown): TwinAssistantCommittedAction[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((action) => {
    if (!action || typeof action !== 'object') return [];
    const candidate = action as { tool?: unknown; result?: unknown };
    if (candidate.tool !== 'update_mileage' && candidate.tool !== 'log_maintenance') return [];
    return [{
      tool: candidate.tool,
      result: typeof candidate.result === 'string' ? candidate.result : '',
    }];
  });
}

export function guardUncommittedMutationMessage(message: string, actions: TwinAssistantCommittedAction[]): string {
  if (actions.length > 0) return message;
  const subject = /\b(?:garage|history|mileage|odometer|maintenance|service|record|oil)\b/i;
  const writeClaim = /\b(?:updated|logged|recorded|saved|changed|added|all set|successfully|now shows|now reflects|has been|is now in)\b/i;
  if (subject.test(message) && writeClaim.test(message)) {
    return "I haven't changed your garage yet. Please confirm the missing service details, then I can save it.";
  }
  return message;
}

export function isMutationFollowUpMessage(message: string): boolean {
  return /\?|\b(?:need|missing|provide|confirm|what|which|when|mileage|odometer|completion date)\b/i.test(message);
}

export async function requestTwinMutation(input: {
  ownerVehicleId: string;
  vehicle: TwinAssistantVehicle;
  messages: TwinAssistantMessage[];
  selectedNode?: TwinAssistantNodeContext | null;
  fetcher?: typeof fetch;
}): Promise<TwinAssistantResult> {
  const fetcher = input.fetcher ?? fetch;
  const current = input.messages.at(-1);
  if (!current || current.role !== 'user' || !current.content.trim()) throw new Error('Message required.');
  const response = await fetcher('/api/garage/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: current.content,
      conversationHistory: input.messages.slice(0, -1),
      vehicleContext: {
        vehicleId: input.ownerVehicleId,
        vehicleName: `${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model}${input.vehicle.trim ? ` ${input.vehicle.trim}` : ''}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        ...(input.selectedNode?.maintenanceType ? {
          selectedMaintenanceType: input.selectedNode.maintenanceType,
        } : {}),
      },
    }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string; message?: string; actions?: unknown };
  if (!response.ok) throw new Error(payload.error || 'Au7o could not update your garage. Nothing was changed.');
  const actions = committedActions(payload.actions);
  const responseText = typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim()
      : actions.length
        ? 'Your garage was updated.'
        : 'I need a little more detail before I can change your garage.';
  const text = actions.length
    ? actions.map((action) => action.result).filter(Boolean).join(' ') || 'Your garage was updated.'
    : guardUncommittedMutationMessage(responseText, actions);
  return {
    text,
    sessionId: null,
    route: 'mutation',
    committedActions: actions,
    awaitingMutationDetails: actions.length === 0 && isMutationFollowUpMessage(text),
  };
}

export async function sendTwinAssistantMessage(
  input: StreamArgs & { ownerVehicleId?: string | null; continueMutation?: boolean },
): Promise<TwinAssistantResult> {
  const current = input.messages.at(-1);
  if (input.ownerVehicleId && current?.role === 'user' && (
    input.continueMutation || isTwinMutationIntent(current.content, Boolean(input.selectedNode?.maintenanceType))
  )) {
    return requestTwinMutation({
      ownerVehicleId: input.ownerVehicleId,
      vehicle: input.vehicle,
      messages: input.messages,
      selectedNode: input.selectedNode,
      fetcher: input.fetcher,
    });
  }
  const result = await streamTwinAssistant(input);
  return { ...result, route: 'information', committedActions: [], awaitingMutationDetails: false };
}

export function buildTwinAssistantVehicle({
  vehicle,
  catalogIdentity,
  transmission,
  mileage,
}: {
  vehicle?: Record<string, unknown> | null;
  catalogIdentity?: Record<string, unknown> | null;
  transmission?: string | null;
  mileage?: number | null;
}): TwinAssistantVehicle | null {
  const source = { ...(catalogIdentity || {}), ...(vehicle || {}) };
  const year = Number(source.year);
  const make = String(source.make || '').trim();
  const model = String(source.model || '').trim();
  if (!Number.isInteger(year) || !make || !model) return null;
  const optional = (value: unknown) => {
    const text = String(value || '').trim();
    return text || undefined;
  };
  return {
    year,
    make,
    model,
    trim: optional(source.trim),
    engine: optional(source.engine),
    transmission: optional(transmission || source.transmission),
    drivetrain: optional(source.drivetrain),
    currentMileage: Number.isFinite(mileage) ? Number(mileage) : undefined,
  };
}

export function normalizeTwinNodeContext(node: Record<string, unknown> | null | undefined): TwinAssistantNodeContext | null {
  if (!node) return null;
  const value = (key: string) => {
    const text = String(node[key] || '').trim();
    return text && text !== '—' ? text.slice(0, 500) : undefined;
  };
  const label = value('label');
  if (!label) return null;
  const knownIssue = node.knownIssue && typeof node.knownIssue === 'object'
    ? node.knownIssue as Record<string, unknown>
    : null;
  return {
    id: value('id'),
    label,
    where: value('where'),
    spec: value('spec'),
    life: value('life'),
    brand: value('brand'),
    partNo: value('partNo'),
    price: value('price'),
    dueNote: value('dueNote'),
    sourceLabel: value('sourceLabel'),
    knownIssueTitle: knownIssue ? String(knownIssue.title || knownIssue.label || '').trim().slice(0, 500) || undefined : undefined,
    maintenanceType: value('maintenanceType'),
  };
}

export async function streamTwinAssistant({
  vehicle,
  messages,
  sessionId,
  knownIssueTitles = [],
  selectedNode,
  onToken,
  onSession,
  fetcher = fetch,
}: StreamArgs): Promise<{ text: string; sessionId: string | null }> {
  const response = await fetcher('/api/hub-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicle, messages, sessionId, knownIssueTitles, selectedNode }),
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({})) as { message?: string; error?: string };
    throw new Error(payload.message || payload.error || 'Au7o could not answer just now. Please try again.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  let resolvedSessionId = sessionId || null;
  let streamError: string | null = null;

  const consume = (rawEvent: string) => {
    const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data:'));
    if (!dataLine) return;
    const payload = dataLine.slice(5).trim();
    if (!payload || payload === '[DONE]') return;
    try {
      const event = JSON.parse(payload) as { type?: string; text?: string; sessionId?: string; message?: string };
      if (event.type === 'token' && event.text) {
        answer += event.text;
        onToken?.(event.text);
      } else if (event.type === 'session' && event.sessionId) {
        resolvedSessionId = event.sessionId;
        onSession?.(event.sessionId);
      } else if (event.type === 'error') {
        streamError = event.message || 'Au7o could not answer just now. Please try again.';
      }
    } catch {
      // Ignore malformed keep-alive chunks without discarding valid streamed text.
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      consume(buffer.slice(0, boundary).trim());
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
  }
  buffer += decoder.decode();
  if (buffer.trim()) consume(buffer.trim());
  if (streamError) throw new Error(streamError);
  if (!answer.trim()) throw new Error('Au7o did not return an answer. Please try again.');
  return { text: answer, sessionId: resolvedSessionId };
}
