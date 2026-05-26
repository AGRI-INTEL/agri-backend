'use client';

import { useEffect } from 'react';
import { getStoredAccessToken, persistAuthSession } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth-store';

/** Synchronise le cookie middleware avec le token localStorage au chargement */
export function AuthHydrator() {
  const { isAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    const token = getStoredAccessToken();
    if (token && isAuthenticated) {
      persistAuthSession(token, undefined, 3600);
    }
    setLoading(false);
  }, [isAuthenticated, setLoading]);

  return null;
}
