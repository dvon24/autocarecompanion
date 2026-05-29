/**
 * Rate limiting utilities for anonymous users
 *
 * Anonymous users get 1 chat per week (the "free taste") then hit the
 * login gate. Server-side limit in chat-quota.ts is the authoritative
 * one; this client-side counter just keeps the UI honest about how
 * many chats remain so the signup CTA appears at the right moment.
 */

const ANONYMOUS_LIMIT = 1;
const STORAGE_KEY = 'acc_anon_chats';

interface AnonymousChatData {
  count: number;
  weekStart: string; // ISO date string
}

/**
 * Get the start of the current week (Sunday midnight UTC)
 */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diff = now.getUTCDate() - day;
  const weekStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    diff,
    0, 0, 0, 0
  ));
  return weekStart;
}

/**
 * Check if a week start date is from a previous week
 */
function isPreviousWeek(weekStartStr: string): boolean {
  const stored = new Date(weekStartStr);
  const current = getWeekStart();
  return stored.getTime() < current.getTime();
}

/**
 * Get stored anonymous chat data
 */
function getStoredData(): AnonymousChatData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save anonymous chat data
 */
function saveData(data: AnonymousChatData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Check anonymous user's rate limit
 * @returns { allowed: boolean, remaining: number, resetDate: Date }
 */
export function checkAnonymousLimit(): {
  allowed: boolean;
  remaining: number;
  resetDate: Date;
} {
  const stored = getStoredData();
  const weekStart = getWeekStart();

  // No data or previous week - full allowance
  if (!stored || isPreviousWeek(stored.weekStart)) {
    return {
      allowed: true,
      remaining: ANONYMOUS_LIMIT,
      resetDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  const remaining = Math.max(0, ANONYMOUS_LIMIT - stored.count);

  return {
    allowed: remaining > 0,
    remaining,
    resetDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Increment anonymous user's chat count
 * @returns { success: boolean, remaining: number }
 */
export function incrementAnonymousCount(): {
  success: boolean;
  remaining: number;
} {
  const weekStart = getWeekStart();
  const stored = getStoredData();

  // Reset if new week or no data
  if (!stored || isPreviousWeek(stored.weekStart)) {
    saveData({
      count: 1,
      weekStart: weekStart.toISOString(),
    });
    return { success: true, remaining: ANONYMOUS_LIMIT - 1 };
  }

  // Check limit
  if (stored.count >= ANONYMOUS_LIMIT) {
    return { success: false, remaining: 0 };
  }

  // Increment
  const newCount = stored.count + 1;
  saveData({
    ...stored,
    count: newCount,
  });

  return { success: true, remaining: ANONYMOUS_LIMIT - newCount };
}

/**
 * Get anonymous ID for tracking (creates one if doesn't exist)
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';

  const ANON_ID_KEY = 'acc_anon_id';
  let id = localStorage.getItem(ANON_ID_KEY);

  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(ANON_ID_KEY, id);
  }

  return id;
}

/**
 * Server-side rate limit check using anonymous ID
 * Used for API routes to validate rate limits
 */
export async function checkServerRateLimit(
  anonymousId: string
): Promise<{ allowed: boolean; remaining: number }> {
  // For now, we trust client-side tracking
  // In production, you would store this in Redis or the database
  // and verify against server-side records

  // This is a placeholder for server-side validation
  // The actual implementation would query a database or cache
  return { allowed: true, remaining: 5 };
}
