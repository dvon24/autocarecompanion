'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  checkAnonymousLimit,
  incrementAnonymousCount,
  refundAnonymousCount,
  setAnonymousRemaining,
  getAnonymousId,
} from '@/lib/rateLimit';
import { ANONYMOUS_HUB_MESSAGE_LIMIT } from '@/lib/hub-message-limits';

interface UseAnonymousLimitReturn {
  /**
   * Whether the user is authenticated (subscriber)
   */
  isAuthenticated: boolean;

  /**
   * Whether the anonymous user can send more chats
   */
  canChat: boolean;

  /**
   * Number of chats remaining this week (anonymous only)
   */
  remaining: number;

  /**
   * Date when the limit resets
   */
  resetDate: Date | null;

  /**
   * Consume one chat from the allowance
   * @returns Whether the chat was allowed
   */
  consumeChat: () => boolean;

  /** Restore a locally reserved turn when no usable reply was delivered. */
  refundChat: () => void;

  /** Persist the server's authoritative remaining count. */
  syncRemaining: (remaining: number) => void;

  /**
   * Anonymous ID for tracking
   */
  anonymousId: string | null;

  /**
   * Loading state
   */
  loading: boolean;
}

/**
 * Hook for managing anonymous user rate limits
 *
 * Epic 5, Story 5.9: Rate Limiting
 * Tracks remaining chats for anonymous users and provides
 * functions to check and consume the allowance.
 */
export function useAnonymousLimit(): UseAnonymousLimitReturn {
  const { data: session, status } = useSession();
  const [remaining, setRemaining] = useState(ANONYMOUS_HUB_MESSAGE_LIMIT);
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  const isAuthenticated = !!session?.user;
  const loading = status === 'loading';

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Defer browser-storage synchronization until after the effect turn so
    // it does not create a synchronous render cascade during hydration.
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        setAnonymousId(getAnonymousId());
      }

      const limit = checkAnonymousLimit();
      setRemaining(limit.remaining);
      setResetDate(limit.resetDate);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  // Reconcile with the SERVER's authoritative per-identity weekly quota.
  // The localStorage counter (checkAnonymousLimit) drifts from the server
  // — shared IP, cleared storage, or the credit spent on another surface —
  // and was promising chats the server rejects: the user clicks a CTA and
  // gets "no chats left" with no answer. We peek the server (no consume)
  // and trust it when it's STRICTER. Never raise the count from the peek
  // (so it can't be used to game the local limit). setState lives only in
  // the fetch callback, never synchronously in the effect body.
  useEffect(() => {
    if (isAuthenticated || typeof window === 'undefined') return;
    let cancelled = false;
    fetch('/api/hub-chat', { method: 'GET' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.remaining !== 'number') return;
        // Mirror the server's authoritative count EXACTLY (both up and
        // down). An earlier Math.min(prev, server) only ever lowered the
        // value, so a stale localStorage 0 (from prior testing) kept the
        // user locked out of a chat the server would actually allow. The
        // server enforces the limit on every send regardless, so there's
        // nothing to "game" by trusting it for the display.
        setRemaining(setAnonymousRemaining(data.remaining));
        if (data.resetAt) setResetDate(new Date(data.resetAt));
      })
      .catch(() => {
        /* keep the local value on failure */
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Refresh limit check periodically (every minute)
  useEffect(() => {
    if (isAuthenticated || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const limit = checkAnonymousLimit();
      setRemaining(limit.remaining);
      setResetDate(limit.resetDate);
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Consume one chat from the allowance
   */
  const consumeChat = useCallback((): boolean => {
    // Authenticated users have unlimited chats
    if (isAuthenticated) return true;

    const result = incrementAnonymousCount();
    setRemaining(result.remaining);

    return result.success;
  }, [isAuthenticated]);

  const refundChat = useCallback(() => {
    if (isAuthenticated) return;
    setRemaining(refundAnonymousCount().remaining);
  }, [isAuthenticated]);

  const syncRemaining = useCallback((value: number) => {
    if (isAuthenticated) return;
    setRemaining(setAnonymousRemaining(value));
  }, [isAuthenticated]);

  // Authenticated users have unlimited access
  if (isAuthenticated) {
    return {
      isAuthenticated: true,
      canChat: true,
      remaining: Infinity,
      resetDate: null,
      consumeChat,
      refundChat,
      syncRemaining,
      anonymousId: null,
      loading,
    };
  }

  return {
    isAuthenticated: false,
    canChat: remaining > 0,
    remaining,
    resetDate,
    consumeChat,
    refundChat,
    syncRemaining,
    anonymousId,
    loading,
  };
}
