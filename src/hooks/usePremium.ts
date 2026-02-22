'use client';

import { useSession } from 'next-auth/react';

export function usePremium() {
  const { data: session, status } = useSession();

  return {
    isPremium: session?.user?.isPremium ?? false,
    subscriptionStatus: session?.user?.subscriptionStatus ?? null,
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
  };
}
