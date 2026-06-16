'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface ActiveSession {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  browser_version?: string;
  os: string;
  os_version?: string;
  ip: string;
  location?: string;
  created_at: string;
  last_active: string;
  is_current: boolean;
}

export interface LoginActivity {
  id: string;
  type: 'success' | 'failed';
  device_name: string;
  device_type: string;
  ip: string;
  location?: string;
  timestamp: string;
}

export interface TwoFactorSetupResponse {
  method: 'sms' | 'email' | 'app';
  qr_code?: string;
  secret?: string;
  backup_codes: string[];
}

// ============================================================================
// SECURITY — PASSWORD
// ============================================================================

export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      logout_other_sessions?: boolean;
    }) => apiClient.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès');
      qc.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
    onError: (e: { message: string }) => toast.error(e.message || 'Erreur lors de la modification du mot de passe'),
  });
}

// ============================================================================
// SECURITY — TWO-FACTOR AUTHENTICATION (2FA)
// ============================================================================

export function useGet2FAStatus() {
  return useQuery({
    queryKey: ['auth', '2fa', 'status'],
    queryFn: () => apiClient.get<{ enabled: boolean; method?: string }>('/auth/2fa/status'),
    retry: false,
    throwOnError: false,
  });
}

export function useEnable2FA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (method: 'sms' | 'email' | 'app') =>
      apiClient.post<TwoFactorSetupResponse>('/auth/2fa/enable', { method }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', '2fa'] });
      toast.success('Authentification 2FA activée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDisable2FA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) =>
      apiClient.post('/auth/2fa/disable', { password }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', '2fa'] });
      toast.success('Authentification 2FA désactivée');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useVerify2FA() {
  return useMutation({
    mutationFn: (data: { code: string }) =>
      apiClient.post('/auth/2fa/verify', data),
    onSuccess: () => toast.success('Code vérifié'),
    onError: (e: { message: string }) => toast.error(e.message || 'Code invalide'),
  });
}

// ============================================================================
// SECURITY — ACTIVE SESSIONS
// ============================================================================

export function useActiveSessions() {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => apiClient.get<ActiveSession[]>('/auth/sessions'),
    staleTime: 30_000,
    throwOnError: false,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.delete(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'sessions'] });
      toast.success('Session révoquée');
    },
    onError: (e: { message: string}) => toast.error(e.message),
  });
}

export function useRevokeAllOtherSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/auth/sessions/revoke-all-others'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'sessions'] });
      toast.success('Toutes les autres sessions ont été révoquées');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

// ============================================================================
// SECURITY — LOGIN ACTIVITY
// ============================================================================

export function useLoginActivity(params: { page?: number; limit?: number } = {}) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['auth', 'activity', page ?? 1, limit ?? 10],
    queryFn: async () => {
      try {
        return await apiClient.get<{
          data: LoginActivity[];
          total: number;
          page: number;
          limit: number;
        }>('/auth/activity', { params: { page, limit } });
      } catch (e: any) {
        // Return empty data on auth errors to avoid breaking UI
        if (e?.status === 401 || e?.status === 403) {
          return { data: [], total: 0, page: page ?? 1, limit: limit ?? 10 };
        }
        throw e;
      }
    },
    staleTime: 30_000,
  });
}

// ============================================================================
// PROFILE — AVATAR & COVER UPLOAD
// ============================================================================

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return apiClient.upload<{ avatar_url: string }>('/auth/avatar', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Photo de profil mise à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useUploadCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('cover', file);
      return apiClient.upload<{ cover_url: string }>('/auth/cover', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Photo de couverture mise à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

// ============================================================================
// PREFERENCES — BULK UPDATE
// ============================================================================

export interface PreferencesData {
  // General
  language?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  default_view?: string;
  enable_shortcuts?: boolean;

  // Notifications
  notifications?: {
    email_alerts?: boolean;
    push_notifications?: boolean;
    weekly_digest?: boolean;
    weather_alerts?: boolean;
    prediction_alerts?: boolean;
    community_updates?: boolean;
    market_price_changes?: boolean;
    system_notifications?: boolean;
    newsletter?: boolean;
  };

  // Privacy
  privacy?: {
    profile_public?: boolean;
    show_online_status?: boolean;
    allow_messages?: boolean;
    share_activity?: boolean;
    show_email?: boolean;
    show_phone?: boolean;
  };
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PreferencesData) =>
      apiClient.put('/auth/preferences', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      qc.invalidateQueries({ queryKey: ['auth', 'preferences'] });
      toast.success('Préférences enregistrées');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useGetPreferences() {
  return useQuery({
    queryKey: ['auth', 'preferences'],
    queryFn: () => apiClient.get<PreferencesData>('/auth/preferences'),
    staleTime: 60_000,
  });
}

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) =>
      apiClient.post('/auth/delete-account', { password }),
    onSuccess: () => {
      toast.success('Compte supprimé');
      // Redirect handled by parent
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
