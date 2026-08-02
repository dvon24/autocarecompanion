/**
 * Simple in-memory rate limiter for API routes.
 *
 * Uses a Map keyed by IP address. Each entry stores the request timestamps
 * within the current window. Expired entries are cleaned up every 60 seconds.
 *
 * Note: On Vercel serverless, in-memory state resets on cold starts.
 * This is acceptable — it provides best-effort protection without external deps.
 */

import { ANONYMOUS_HUB_MESSAGE_LIMIT } from '@/lib/hub-message-limits';

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // seconds until the window resets
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private interval: number; // window size in ms
  private limit: number; // max requests per window
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(interval: number, limit: number) {
    this.interval = interval;
    this.limit = limit;

    // Auto-clean expired entries every 60 seconds
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
    // Ensure the timer doesn't prevent Node from exiting
    if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Check whether a request from the given IP should be allowed.
   */
  check(ip: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.interval;

    let entry = this.store.get(ip);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(ip, entry);
    }

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    if (entry.timestamps.length >= this.limit) {
      // Rate limited — find when the oldest request in the window expires
      const oldestInWindow = entry.timestamps[0];
      const resetMs = oldestInWindow + this.interval - now;
      const resetSeconds = Math.ceil(resetMs / 1000);

      return {
        success: false,
        remaining: 0,
        reset: resetSeconds,
      };
    }

    // Allow the request
    entry.timestamps.push(now);

    return {
      success: true,
      remaining: this.limit - entry.timestamps.length,
      reset: Math.ceil(this.interval / 1000),
    };
  }

  /**
   * Release the most recently recorded hit for an IP. Chat routes reserve a
   * daily trial slot before calling the model, then release it when no usable
   * reply is delivered. Burst-limit hits intentionally are never refunded.
   */
  refund(ip: string): boolean {
    const entry = this.store.get(ip);
    if (!entry || entry.timestamps.length === 0) return false;
    entry.timestamps.pop();
    if (entry.timestamps.length === 0) this.store.delete(ip);
    return true;
  }

  /**
   * Check availability WITHOUT recording a hit. Lets a caller verify a credit
   * is available, do expensive work, then consume the credit only on success
   * (so e.g. a failed token-mint doesn't burn a user's one-and-only demo).
   */
  peek(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.interval;
    const entry = this.store.get(ip);
    if (!entry) return true;
    return entry.timestamps.filter((t) => t > windowStart).length < this.limit;
  }

  /**
   * Remove entries whose entire window has expired.
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.interval;

    for (const [ip, entry] of this.store) {
      // If the newest timestamp is older than the window, remove the entry
      if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] <= windowStart) {
        this.store.delete(ip);
      }
    }
  }
}

// Pre-configured limiters for each route tier
export const knownIssuesLimiter = new RateLimiter(60_000, 60);   // 60 req/min
export const guideLimiter = new RateLimiter(60_000, 10);          // 10 req/min
export const affiliateTrackLimiter = new RateLimiter(60_000, 30); // 30 req/min
export const reservationLimiter = new RateLimiter(60_000, 10);    // 10 reservations/min/IP

// /drive voice turns are expensive: each one fans out to Claude + Mapbox
// geocoding + Mapbox directions + (sometimes) a gas-station lookup.
// Two tiers so a burst of voice commands during active driving is fine
// but a runaway script can't rack up bills overnight.
export const driveTurnMinuteLimiter = new RateLimiter(60_000, 20);          // 20 req/min
export const driveTurnDayLimiter = new RateLimiter(24 * 60 * 60_000, 200);  // 200 req/day

// Hub chat — let an anonymous visitor use the full conversion trial in one
// sitting. The database-backed weekly identity quota remains authoritative;
// this per-IP window is an additional best-effort abuse guard.
export const hubChatAnonDayLimiter = new RateLimiter(
  24 * 60 * 60_000,
  ANONYMOUS_HUB_MESSAGE_LIMIT,
);
export const hubChatAuthedDayLimiter = new RateLimiter(24 * 60 * 60_000, 200); // 200 / day / IP authed
export const hubChatMinuteLimiter = new RateLimiter(60_000, 12);             // 12 / min — protects against client-loop bugs

// Live voice mechanic DEMO — non-paying callers (anonymous + signed-in free)
// get a short, hard-capped live taste, then upsell. Realtime audio is
// $-per-minute, so the cap is tight and the DEMO_SECONDS session length is the
// real cost ceiling. Best-effort/in-memory (resets on cold start) — same
// tolerance as the anon hub-chat cap above. Anon keyed by IP, free by userId.
const THIRTY_DAYS = 30 * 24 * 60 * 60_000;
export const voiceDemoAnonLimiter = new RateLimiter(THIRTY_DAYS, 1);  // 1 demo / IP / 30 days
export const voiceDemoFreeLimiter = new RateLimiter(THIRTY_DAYS, 2);  // 2 demos / signed-in free user / 30 days

/**
 * Extract client IP from a request. Vercel sets x-forwarded-for automatically.
 * Falls back to 'unknown' if no IP can be determined.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be comma-separated; take the first (client) IP
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Build a standard 429 JSON response with Retry-After header.
 */
export function rateLimitResponse(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter: retryAfterSeconds }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}
