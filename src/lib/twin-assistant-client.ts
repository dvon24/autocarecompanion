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
