"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { persistAuthSession, clearAuthSession } from '@/lib/auth-session';
import { mapBackendUser } from '@/lib/user-mapper';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginCredentials, RegisterData, User } from '@/types/auth';
import { toast } from 'sonner';

interface BackendLoginResponse {
  user: Record<string, unknown>;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isLoading: isFetching } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const raw = await apiClient.get<Record<string, unknown>>('/auth/me');
        const mapped = mapBackendUser(raw);
        setUser(mapped);
        return mapped;
      } catch (error: unknown) {
        const apiError = error as { status?: number };
        // 401 = session expirée côté serveur → déconnecter proprement
        if (apiError?.status === 401) {
          clearAuthSession();
          storeLogout();
          queryClient.clear();
          return null;
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const identifier = (credentials as any).identifier ?? (credentials as any).email;
      if (!identifier?.trim() || !credentials.password?.trim()) {
        throw new Error('Identifiant et mot de passe requis');
      }
      const response = await apiClient.post<BackendLoginResponse>('/auth/login', {
        username: identifier,
        password: credentials.password,
        remember_me: credentials.remember_me ?? false,
      });
      return response;
    },
    onSuccess: (data) => {
      persistAuthSession(data.access_token, data.refresh_token, data.expires_in);
      setUser(mapBackendUser(data.user));
      toast.success('Connexion réussie ! Redirection vers le tableau de bord...');
      router.push('/dashboard');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || 'Identifiants incorrects');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => {
      const rawUsername = (data.email ? String(data.email).split('@')[0] : data.name) ?? '';
      const username = rawUsername
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 30);

      const payload: Record<string, unknown> = {
        username,
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        country: data.country,
        sector: data.sector,
        organisation: data.organisation,
        role: data.role,
        language: data.language ?? 'fr',
        timezone: data.timezone ?? 'Africa/Dakar',
        accept_terms: data.accept_terms,
        accept_privacy: data.accept_privacy,
        newsletter: data.newsletter ?? false,
        referral_code: data.referral_code,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
      };

      return apiClient.post('/auth/register', payload);
    },
    onSuccess: () => {
      toast.success('Compte créé ! Vérifiez votre email.');
      router.push('/verify-email');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de l'inscription");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSettled: () => {
      clearAuthSession();
      storeLogout();
      queryClient.clear();
      router.push('/login');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    onSuccess: () => toast.success('Lien de réinitialisation envoyé !'),
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      apiClient.post('/auth/reset-password', data),
    onSuccess: () => {
      toast.success('Mot de passe réinitialisé !');
      router.push('/login');
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/resend-verification'),
    onSuccess: () => {
      toast.success('Email de vérification renvoyé !');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de l'envoi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => apiClient.post('/auth/verify-email', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Email vérifié avec succès !');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || 'Échec de la vérification');
    },
  });

  const emailVerified = user?.email_verified ?? false;

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isFetching,
    emailVerified,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    isForgotLoading: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResetLoading: resetPasswordMutation.isPending,
    resendVerification: resendVerificationMutation.mutate,
    isResending: resendVerificationMutation.isPending,
    verifyEmail: verifyEmailMutation.mutate,
    isVerifying: verifyEmailMutation.isPending,
  };
}

export function useResendVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/resend-verification'),
    onSuccess: () => {
      toast.success('Email de vérification renvoyé !');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de l'envoi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => apiClient.post('/auth/verify-email', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Email vérifié avec succès !');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || 'Échec de la vérification');
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: Partial<{
      full_name: string;
      phone_number: string;
      organization: string;
      country: string;
      bio: string;
      language: string;
      timezone: string;
      theme: string;
    }>) => apiClient.put<Record<string, unknown>>('/auth/me', data),
    onSuccess: (raw) => {
      const mapped = mapBackendUser(raw);
      setUser(mapped);
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Profil mis à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
