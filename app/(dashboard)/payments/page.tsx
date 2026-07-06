'use client';

import { useState } from 'react';
import {
  CreditCard, CheckCircle2, XCircle, RefreshCw, Download, Plus,
  Phone, Building2, FileText,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import {
  useCurrentSubscription, usePlans, useBillingHistory, usePaymentMethods,
  useChangePlan, useCancelSubscription, useInvoiceDownload,
  type Plan, type BillingHistory as BillingEntry,
} from '@/hooks/use-payments';

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  'Tableau de bord de base',
  '5 alertes par mois',
  'Données météo 7 jours',
  'Accès communauté',
];

const PRO_FEATURES = [
  'Tout du plan Gratuit',
  'Alertes illimitées',
  'Données météo 14 jours',
  'Indicateurs avancés',
  'Export CSV/Excel',
  'Comparateur de marchés',
  'Calendrier agricole',
  'Support prioritaire',
];

const ENTERPRISE_FEATURES = [
  'Tout du plan Pro',
  'API dédiée',
  'rapports personnalisés',
  'Données historiques complètes',
  'Intégration Flutterwave/Paystack',
  'Utilisateurs illimités',
  'SLA garanti 99.9%',
  'Account manager dédié',
];

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, isCurrent, isAnnual, onSelect }: {
  plan: Plan;
  isCurrent: boolean;
  isAnnual: boolean;
  onSelect: () => void;
}) {
  const price = isAnnual ? plan.annual_price : plan.monthly_price;
  const features = plan.code === 'free' ? FREE_FEATURES :
    plan.code === 'pro' ? PRO_FEATURES : ENTERPRISE_FEATURES;

  return (
    <Card className={cn(
      'relative flex flex-col border-2 transition-all',
      plan.popular ? 'border-primary/50 shadow-glow-green' : 'border-border/40',
      isCurrent ? 'ring-2 ring-primary/30' : '',
    )}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default" className="text-[10px] px-3 py-1">Populaire</Badge>
        </div>
      )}
      {plan.highlighted && !plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="secondary" className="text-[10px] px-3 py-1">Recommandé</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold font-mono">
            {price === 0 ? 'Gratuit' : formatCurrency(price, (plan.currency || 'XOF') as never)}
          </span>
          {price > 0 && (
            <span className="text-sm text-muted-foreground ml-1">
              /{isAnnual ? 'an' : 'mois'}
            </span>
          )}
        </div>
        {isAnnual && price > 0 && (
          <p className="text-xs text-green-500 mt-1">
            Économisez {formatCurrency((plan.monthly_price * 12) - plan.annual_price, (plan.currency || 'XOF') as never)}/an
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2.5">
          {features.map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feat}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={isCurrent}
        >
          {isCurrent ? 'Plan actuel' : plan.code === 'free' ? 'Passer au Gratuit' : 'Choisir'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Payment Method Badge ─────────────────────────────────────────────────────

function PaymentMethodIcon({ type }: { type: string }) {
  switch (type) {
    case 'card': return <CreditCard className="h-4 w-4" />;
    case 'mobile_money': return <Phone className="h-4 w-4" />;
    case 'bank_transfer': return <Building2 className="h-4 w-4" />;
    default: return <CreditCard className="h-4 w-4" />;
  }
}

function PaymentMethodLabel({ type }: { type: string }) {
  switch (type) {
    case 'card': return 'Carte bancaire';
    case 'mobile_money': return 'Mobile Money';
    case 'bank_transfer': return 'Virement bancaire';
    default: return type;
  }
}

// ─── Billing Row ──────────────────────────────────────────────────────────────

function BillingRow({ entry, onDownload }: {
  entry: BillingEntry;
  onDownload: (e: BillingEntry) => void;
}) {
  return (
    <tr className="hover:bg-muted/10 transition-colors">
      <td className="px-4 py-3">
        <span className="text-xs font-medium">{entry.invoice_number}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {formatDate(entry.period_start, 'dd/MM/yyyy')} — {formatDate(entry.period_end, 'dd/MM/yyyy')}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
        {entry.description}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
        {formatCurrency(entry.amount, (entry.currency || 'XOF') as never)}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge variant={
          entry.status === 'paid' ? 'success' :
          entry.status === 'pending' ? 'warning' :
          entry.status === 'failed' ? 'danger' : 'outline'
        } className="text-[10px]">
          {entry.status === 'paid' ? 'Payée' :
           entry.status === 'pending' ? 'En attente' :
           entry.status === 'failed' ? 'Échouée' : 'Remboursée'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-center">
        {entry.invoice_url && (
          <Button variant="ghost" size="icon-sm" onClick={() => onDownload(entry)}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const qc = useQueryClient();

  const { data: subscription, isLoading: subLoading, isError: subError, refetch: subRefetch } = useCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: billing, isLoading: billingLoading } = useBillingHistory();
  const { data: paymentMethods } = usePaymentMethods();
  const changePlan = useChangePlan();
  const cancelSub = useCancelSubscription();
  const downloadInvoice = useInvoiceDownload();

  const currentPlanId = subscription?.plan_id;
  const billingList = Array.isArray(billing) ? billing : [];
  const methodsList = Array.isArray(paymentMethods) ? paymentMethods : [];

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Abonnement & Paiements</span>
              {subscription && (
                <Badge variant={
                  subscription.status === 'active' ? 'success' :
                  subscription.status === 'past_due' ? 'warning' : 'outline'
                } className="text-[10px] h-5 px-1.5">
                  {subscription.status === 'active' ? 'Actif' :
                   subscription.status === 'canceled' ? 'Annulé' :
                   subscription.status === 'past_due' ? 'En retard' : 'Incomplet'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gérez votre abonnement et vos moyens de paiement
            </p>
          </div>
        </div>
      }
      actions={
        <Button variant="outline" size="sm" className="h-8 gap-1.5"
          onClick={() => qc.invalidateQueries({ queryKey: ['payments'] })}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Actualiser</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Current Plan */}
        {subLoading ? (
          <Card className="border-border/40">
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-16 w-full" /></CardContent>
          </Card>
        ) : subError ? (
          <EmptyState
            icon="💳"
            title="Erreur de chargement"
            description="Impossible de charger les informations d'abonnement."
            action={{ label: 'Réessayer', onClick: () => subRefetch() }}
          />
        ) : subscription ? (
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Plan actuel</CardTitle>
                <Badge variant={
                  subscription.status === 'active' ? 'success' :
                  subscription.status === 'past_due' ? 'warning' : 'outline'
                } className="gap-1">
                  {subscription.status === 'active' ? 'Actif' :
                   subscription.status === 'canceled' ? 'Annulé' :
                   subscription.status === 'past_due' ? 'En retard' : 'Incomplet'}
                </Badge>
              </div>
              <CardDescription>
                {subscription.plan.name} — Abonnement {subscription.billing_cycle === 'annual' ? 'annuel' : 'mensuel'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Période en cours</p>
                  <p className="text-sm font-medium mt-0.5">
                    {formatDate(subscription.current_period_start, 'dd/MM/yyyy')} — {formatDate(subscription.current_period_end, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Prochain paiement</p>
                  <p className="text-sm font-medium mt-0.5">
                    {subscription.cancel_at_period_end ? 'Aucun (annulation)' : formatDate(subscription.current_period_end, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Moyen de paiement</p>
                  <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                    {subscription.payment_method ? (
                      <>
                        <PaymentMethodIcon type={subscription.payment_method.type} />
                        {subscription.payment_method.last_four && (
                          <>•••• {subscription.payment_method.last_four}</>
                        )}
                        <span className="text-muted-foreground">({PaymentMethodLabel({ type: subscription.payment_method.type })})</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Non défini</span>
                    )}
                  </p>
                </div>
                <div className="flex items-end justify-end gap-2">
                  {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                    <Button variant="outline" size="sm" onClick={() => cancelSub.mutate()}>
                      <XCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline text-xs">Annuler</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon="💳"
            title="Aucun abonnement"
            description="Vous n'avez pas encore d'abonnement actif."
          />
        )}

        {/* Plan Comparison */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Comparer les plans</h2>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  !isAnnual ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground',
                )}
              >
                Mensuel
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  isAnnual ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground',
                )}
              >
                Annuel
              </button>
            </div>
          </div>

          {plansLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Array.isArray(plans) ? plans : []).map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={plan.id === currentPlanId}
                  isAnnual={isAnnual}
                  onSelect={() => {
                    if (plan.id !== currentPlanId) {
                      changePlan.mutate({
                        plan_id: plan.id,
                        billing_cycle: isAnnual ? 'annual' : 'monthly',
                      });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods & Billing */}
        <Tabs defaultValue="billing">
          <TabsList>
            <TabsTrigger value="billing" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Facturation
            </TabsTrigger>
            <TabsTrigger value="methods" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Moyens de paiement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="mt-4">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-sm">Historique de facturation</CardTitle>
              </CardHeader>
              {billingLoading ? (
                <CardContent>
                  <Skeleton className="h-48 w-full rounded-lg" />
                </CardContent>
              ) : billingList.length === 0 ? (
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune facture disponible.</p>
                </CardContent>
              ) : (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/20">
                          <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Facture</th>
                          <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Période</th>
                          <th className="text-left px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Description</th>
                          <th className="text-right px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Montant</th>
                          <th className="text-center px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Statut</th>
                          <th className="text-center px-4 py-3 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Facture</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {billingList.map((entry) => (
                          <BillingRow key={entry.id} entry={entry} onDownload={(e) => downloadInvoice.mutate(e)} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="mt-4">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-sm">Moyens de paiement</CardTitle>
                <CardDescription>
                  Intégration Flutterwave & Paystack — Cartes, Mobile Money, Virement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {methodsList.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto opacity-40" />
                    <p className="text-sm text-muted-foreground">
                      Aucun moyen de paiement enregistré.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Ajouter une carte
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Mobile Money
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Paiement sécurisé via Flutterwave et Paystack
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {methodsList.map((method) => (
                      <div key={method.id} className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                            <PaymentMethodIcon type={method.type} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {method.brand && `${method.brand} `}
                              {method.last_four && `•••• ${method.last_four}`}
                              <span className="text-muted-foreground font-normal ml-1">
                                ({PaymentMethodLabel({ type: method.type })})
                              </span>
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {method.provider === 'flutterwave' ? 'Flutterwave' :
                               method.provider === 'paystack' ? 'Paystack' : 'Stripe'}
                              {method.is_default && ' · Défaut'}
                            </p>
                          </div>
                        </div>
                        {method.is_default && (
                          <Badge variant="outline" className="text-[10px]">Défaut</Badge>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-2 gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter un moyen de paiement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}


