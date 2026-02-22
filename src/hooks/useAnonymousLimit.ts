'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  checkAnonymousLimit,
  incrementAnonymousCount,
  getAnonymousId,
} from '@/lib/rateLimit';

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
  const [remaining, setRemaining] = useState(5);
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  const isAuthenticated = !!session?.user;
  const loading = status === 'loading';

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set anonymous ID
    if (!isAuthenticated) {
      setAnonymousId(getAnonymousId());
    }

    // Check current limit
    const limit = checkAnonymousLimit();
    setRemaining(limit.remaining);
    setResetDate(limit.resetDate);
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

  // Authenticated users have unlimited access
  if (isAuthenticated) {
    return {
      isAuthenticated: true,
      canChat: true,
      remaining: Infinity,
      resetDate: null,
      consumeChat,
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
    anonymousId,
    loading,
  };
}
