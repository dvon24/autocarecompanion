'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useOnlineStatus - Hook for detecting online/offline network state
 *
 * Story 2.3: Offline State Detection & Indication
 * Provides real-time network status with seamless transitions.
 *
 * Features:
 * - Detects initial online/offline state
 * - Listens for network status changes
 * - Provides isOnline and isOffline booleans
 * - Fires callbacks on status change
 */

type UseOnlineStatusOptions = {
  onOnline?: () => void;
  onOffline?: () => void;
};

type UseOnlineStatusReturn = {
  isOnline: boolean;
  isOffline: boolean;
  checkConnection: () => Promise<boolean>;
};

export function useOnlineStatus(options: UseOnlineStatusOptions = {}): UseOnlineStatusReturn {
  const { onOnline, onOffline } = options;

  // Initialize with navigator.onLine if available (SSR-safe)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Assume online during SSR
  });

  // Handle going online
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    onOnline?.();
  }, [onOnline]);

  // Handle going offline
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    onOffline?.();
  }, [onOffline]);

  // Check actual connectivity (not just network interface)
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-store',
      });
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set initial state on mount
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    checkConnection,
  };
}
