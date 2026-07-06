'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ensureArray } from '@/lib/utils';
import { toast } from 'sonner';

export interface Plan {
  id: string;
  name: string;
  code: 'free' | 'pro' | 'enterprise';
  description: string;
  monthly_price: number;
  annual_price: number;
  currency: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  plan_id: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  billing_cycle: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  last_four?: string;
  brand?: string;
  is_default: boolean;
  provider: 'flutterwave' | 'paystack' | 'stripe';
}

export interface BillingHistory {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  period_start: string;
  period_end: string;
  paid_at?: string;
  invoice_url?: string;
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['payments', 'subscription'],
    queryFn: () => apiClient.get<Subscription>('/payments/subscription'),
    staleTime: 60_000,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['payments', 'plans'],
    queryFn: () => apiClient.get<unknown>('/payments/plans').then((r) => ensureArray<Plan>(r, 'plans')),
    staleTime: 5 * 60_000,
  });
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ['payments', 'billing'],
    queryFn: () => apiClient.get<unknown>('/payments/billing').then((r) => ensureArray<BillingHistory>(r, 'billing')),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payments', 'methods'],
    queryFn: () => apiClient.get<unknown>('/payments/methods').then((r) => ensureArray<PaymentMethod>(r, 'methods')),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plan_id, billing_cycle }: { plan_id: string; billing_cycle: 'monthly' | 'annual' }) =>
      apiClient.post<Subscription>('/payments/change-plan', { plan_id, billing_cycle }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Plan mis à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/payments/cancel'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', 'subscription'] });
      toast.success('Abonnement annulé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAddPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; authorization: Record<string, string> }) =>
      apiClient.post<PaymentMethod>('/payments/methods', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', 'methods'] });
      toast.success('Moyen de paiement ajouté');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useInvoiceDownload() {
  return useMutation({
    mutationFn: async (invoice: BillingHistory) => {
      if (!invoice.invoice_url) throw new Error('Facture non disponible');
      const response = await fetch(invoice.invoice_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  enterprise: 'Entreprise',
};
