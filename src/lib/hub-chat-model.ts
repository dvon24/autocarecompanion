export const DEFAULT_HUB_MODEL = 'gpt-5.6-sol';
export const DEFAULT_HUB_FALLBACK_MODEL = 'gpt-5.5';

type HubModelEnv = {
  [key: string]: string | undefined;
  OPENAI_HUB_MODEL?: string;
  OPENAI_HUB_FALLBACK_MODEL?: string;
};

export function getHubModelConfig(env: HubModelEnv = process.env): {
  primary: string;
  fallback: string | null;
} {
  const primary = env.OPENAI_HUB_MODEL?.trim() || DEFAULT_HUB_MODEL;
  const fallbackCandidate =
    env.OPENAI_HUB_FALLBACK_MODEL?.trim() || DEFAULT_HUB_FALLBACK_MODEL;
  return {
    primary,
    fallback: fallbackCandidate === primary ? null : fallbackCandidate,
  };
}

/**
 * Retry only when the response can plausibly be model-access related.
 * Validation, quota, rate-limit, and generic server failures should not
 * duplicate a request against another model.
 */
export function shouldRetryHubModel(status: number, responseText = ''): boolean {
  if (status === 401 || status === 403 || status === 404 || status === 410) {
    return true;
  }
  if (status !== 400) return false;
  return /model|permission|access|forbidden|not found|does not exist|unsupported|unavailable/i.test(
    responseText,
  );
}

export function safeHubChatErrorMessage(hasPartialReply: boolean): string {
  return hasPartialReply
    ? 'That reply was interrupted. Please try again.'
    : 'Au7o could not answer just now. Your chat was not counted, so please try again.';
}

export async function requestHubModelWithTransportFallback<T>(
  models: { primary: string; fallback: string | null },
  request: (model: string) => Promise<T>,
  onFallback?: (primary: string, fallback: string) => void,
): Promise<{ model: string; response: T }> {
  try {
    return { model: models.primary, response: await request(models.primary) };
  } catch (error) {
    if (!models.fallback) throw error;
    onFallback?.(models.primary, models.fallback);
    return {
      model: models.fallback,
      response: await request(models.fallback),
    };
  }
}

export function isUsableHubReply(text: string, completed: boolean): boolean {
  return completed && text.trim().length > 0;
}
