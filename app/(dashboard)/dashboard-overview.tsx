'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from '@/lib/motion';
import {
  Sprout, Fish, TreePine, Beef,
  BarChart3, Bell, RefreshCw, Plus,
  TrendingUp, Map, ArrowRight, Users, MessageSquare, ThumbsUp,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeDate, ensureArray } from '@/lib/utils';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ProductionChart } from '@/components/dashboard/production-chart';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { AlertsTicker } from '@/components/dashboard/alerts-ticker';
import { InteractiveMap } from '@/components/map/interactive-map';
import { cn } from '@/lib/utils';
import type { KPIStats, ProductionDataPoint } from '@/types/api';
import type { ActivityItem } from '@/types/community';

const SECTORS = [
  { key: 'vegetal', label: 'Végétal', icon: Sprout, href: '/production', iconColor: '#4ADE80', iconBg: 'rgba(74,222,128,0.12)' },
  { key: 'animal', label: 'Animal', icon: Beef, href: '/animal', iconColor: '#FB923C', iconBg: 'rgba(251,146,60,0.12)' },
  { key: 'halieutique', label: 'Halieutique', icon: Fish, href: '/halieutique', iconColor: '#22D3EE', iconBg: 'rgba(34,211,238,0.12)' },
  { key: 'forestier', label: 'Forestier', icon: TreePine, href: '/forestier', iconColor: '#86EFAC', iconBg: 'rgba(134,239,172,0.12)' },
] as const;

const FOOTER_LINKS = [
  { icon: BarChart3, label: 'Analyses disponibles', value: 'Indicateurs', href: '/indicators', iconColor: '#A78BFA', iconBg: 'rgba(167,139,250,0.12)' },
  { icon: TrendingUp, label: 'Modèles prédictifs', value: 'Prédictions IA', href: '/predictions', iconColor: '#60A5FA', iconBg: 'rgba(96,165,250,0.12)' },
  { icon: Bell, label: 'Gestion des alertes', value: 'Alertes', href: '/alerts', iconColor: '#F87171', iconBg: 'rgba(248,113,113,0.12)' },
] as const;

interface WeeklySummary {
  alerts_count: number;
  vegetal_change: number;
  mais_price_change: number;
  new_members?: number;
  posts_count?: number;
}

const ACTIVITY_ICONS: Record<string, typeof MessageSquare> = {
  post_created: MessageSquare,
  post_liked: ThumbsUp,
  post_commented: MessageSquare,
  post_shared: MessageSquare,
  member_joined: Users,
  member_promoted: Users,
  poll_voted: ThumbsUp,
  event_joined: Users,
  post_bookmarked: MessageSquare,
};

const ACTIVITY_COLORS: Record<string, string> = {
  post_created: '#60A5FA',
  post_liked: '#34D399',
  post_commented: '#F59E0B',
  post_shared: '#A78BFA',
  member_joined: '#34D399',
  member_promoted: '#A78BFA',
  poll_voted: '#F59E0B',
  event_joined: '#60A5FA',
  post_bookmarked: '#F87171',
};

/**
 * Le backend renvoie `{ activity: [...], total, limit, offset }` avec des items
 * au format `{ user, target, timestamp, action }` — on normalise vers ActivityItem
 * pour garantir un tableau (évite `activity.slice is not a function`).
 */
function normalizeActivity(raw: unknown): ActivityItem[] {
  const anyRaw = raw as Record<string, unknown> | unknown[] | null | undefined;
  const list = Array.isArray(anyRaw)
    ? anyRaw
    : ((anyRaw as Record<string, unknown>)?.activity ??
       (anyRaw as Record<string, unknown>)?.items ??
       (anyRaw as Record<string, unknown>)?.data ??
       []);
  if (!Array.isArray(list)) return [];
  return list.map((entry) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const it = entry as Record<string, any>;
    const type = it.type === 'comment_created' ? 'post_commented' : (it.type ?? 'post_created');
    const actor = it.actor ?? {
      id: String(it.user?.id ?? ''),
      name: it.user?.full_name || it.user?.username || 'Un membre',
      avatar: it.user?.avatar_url ?? undefined,
      role: '',
    };
    const postContent = it.post?.content ?? it.target?.title ?? it.target?.content_preview;
    const groupName = it.group?.name ?? it.target?.group_name;
    return {
      id: String(it.id ?? ''),
      type,
      actor,
      post: postContent ? { content: postContent } : undefined,
      group: groupName ? { name: groupName } : undefined,
      created_at: it.created_at ?? it.timestamp ?? '',
    } as unknown as ActivityItem;
  });
}

function useGreeting() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return { greeting: 'Bonjour', timeStr: '', dateStr: '' };

  const h = time.getHours();
  const greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return { greeting, timeStr, dateStr };
}

function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground/70">Aucune activité récente</p>
      <p className="text-xs text-muted-foreground/50 mt-1 max-w-[220px]">
        Les publications, commentaires et réactions de la communauté apparaîtront ici.
      </p>
      <Link
        href="/community"
        className="mt-3 text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
      >
        Rejoindre un groupe
      </Link>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="divide-y divide-border/10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-muted/10 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 rounded bg-muted/10 animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-muted/10 animate-pulse" />
          </div>
          <div className="h-3 w-10 rounded bg-muted/10 animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}

function WeeklySummarySkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/20">
      <div className="h-4 w-28 rounded bg-muted/10 animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-muted/10 animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { greeting, timeStr, dateStr } = useGreeting();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => apiClient.get<KPIStats>('/dashboard/kpis'),
    refetchInterval: 60_000,
  });

  const { data: production, isLoading: productionLoading } = useQuery({
    queryKey: ['dashboard', 'production'],
    queryFn: () => apiClient.get<unknown>('/dashboard/production').then((r) => ensureArray<ProductionDataPoint>(r, 'production')),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['community', 'activity'],
    queryFn: async () => normalizeActivity(await apiClient.get<unknown>('/community/activity')),
    refetchInterval: 30_000,
  });

  const { data: weeklySummary, isLoading: weeklyLoading } = useQuery({
    queryKey: ['dashboard', 'weekly-summary'],
    queryFn: () => apiClient.get<WeeklySummary>('/dashboard/weekly-summary'),
    refetchInterval: 60_000,
  });

  const displayName = mounted
    ? (user?.display_name || user?.name || user?.email?.split('@')[0] || 'Utilisateur')
    : 'Utilisateur';

  return (
    <div className="min-h-full bg-background">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <Image
            src="/fond-landscape.webp"
            alt=""
            fill
            priority
            className="object-cover"
            style={{ opacity: 0.20, objectPosition: 'center 40%' }}
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-br from-background/95 via-background/75 to-background/95"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_at_70%_80%,rgba(196,146,58,0.12)_0%,transparent_55%)]"
          aria-hidden
        />

        <div className="relative z-10 px-6 py-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm font-semibold mb-1 capitalize text-muted-foreground">
                {dateStr}{timeStr ? ` · ${timeStr}` : ''}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold italic text-foreground">
                {greeting},{' '}
                <span className="text-secondary capitalize">{displayName}</span>
              </h1>
              <p className="text-sm mt-1 text-muted-foreground">
                Voici un résumé de votre activité agricole aujourd&apos;hui.
              </p>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 shrink-0"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <button
                onClick={() => refetchKpis()}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Actualiser
              </button>
              <Link
                href="/alerts"
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-bold transition-all duration-200 bg-secondary text-secondary-foreground shadow-[0_4px_16px_rgba(196,146,58,0.28)] hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouvelle alerte
              </Link>
            </motion.div>
          </div>

          {/* Sector quick-nav */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {SECTORS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.key}
                  href={s.href}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 bg-card/80 backdrop-blur-sm border border-border/20 hover:border-border/40 hover:bg-card"
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: s.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground/70">Voir détails</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground/70" />
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── Page Content ──────────────────────────────────────────────────── */}
      <div className="p-6 space-y-5 bg-background">
        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <StatsCards data={kpis} isLoading={kpisLoading} />
        </motion.div>

        {/* Main row: chart + weather */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <div className="lg:col-span-2">
            <ProductionChart data={production} isLoading={productionLoading} />
          </div>
          <div>
            <WeatherWidget />
          </div>
        </motion.div>

        {/* Secondary row: alerts + map */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <AlertsTicker />
          <div
            className="rounded-xl overflow-hidden min-h-[300px] flex flex-col bg-card border border-border/20"
          >
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-border/10"
            >
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold text-foreground">Carte des Zones</span>
              </div>
              <Link
                href="/map"
                className="flex items-center gap-1 text-xs font-medium transition-colors text-muted-foreground hover:text-secondary"
              >
                Voir la carte
                <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <div className="flex-1 min-h-[260px]">
              <InteractiveMap className="h-full" />
            </div>
          </div>
        </motion.div>

        {/* ── Community activity widget ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.33 }}
        >
          <div
            className="rounded-xl overflow-hidden bg-card border border-border/20"
          >
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-border/10"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold text-foreground">Activité récente</span>
              </div>
              <Link
                href="/community"
                className="flex items-center gap-1 text-xs font-medium transition-colors text-muted-foreground hover:text-secondary"
              >
                Voir tout
                <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            {activityLoading ? (
              <ActivitySkeleton />
            ) : !activity || activity.length === 0 ? (
              <ActivityEmptyState />
            ) : (
              <div className="divide-y divide-border/10">
                {activity.slice(0, 6).map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type] || MessageSquare;
                  const color = ACTIVITY_COLORS[item.type] || '#60A5FA';
                  const actionLabel =
                    item.type === 'post_created' ? 'a publié dans' :
                    item.type === 'post_liked' ? 'a aimé' :
                    item.type === 'post_commented' ? 'a commenté' :
                    item.type === 'post_shared' ? 'a partagé' :
                    item.type === 'member_joined' ? 'a rejoint' :
                    item.type === 'member_promoted' ? 'a été promu dans' :
                    item.type === 'poll_voted' ? 'a voté dans' :
                    item.type === 'event_joined' ? 'participe à' :
                    item.type === 'post_bookmarked' ? 'a ajouté à ses favoris' :
                    'a interagi dans';
                  const targetName = item.post?.content
                    ? item.post.content.slice(0, 60)
                    : item.group?.name || '';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors border-border/10 hover:bg-muted/30"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${color}18` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{item.actor?.name || 'Un membre'}</span>
                          {' '}{actionLabel}
                          {targetName ? (
                            <span className="text-muted-foreground/80"> {targetName}</span>
                          ) : null}
                        </p>
                      </div>
                      <span className="text-xs shrink-0 text-muted-foreground/70">
                        {formatRelativeDate(item.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats summary footer row */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          {/* "Cette semaine" widget — data-driven */}
          {weeklyLoading ? (
            <WeeklySummarySkeleton />
          ) : (
            <div
              className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/20"
            >
              <p className="text-sm font-semibold text-foreground">Cette semaine</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alertes</span>
                  <span className="font-bold text-destructive">
                    {weeklySummary?.alerts_count ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Végétal</span>
                  <span className={cn(
                    'font-bold',
                    (weeklySummary?.vegetal_change ?? 0) > 0 ? 'text-green-400' :
                    (weeklySummary?.vegetal_change ?? 0) < 0 ? 'text-red-400' :
                    'text-muted-foreground'
                  )}>
                    {(weeklySummary?.vegetal_change ?? 0) > 0 ? '+' : ''}
                    {weeklySummary?.vegetal_change ?? '—'}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Maïs</span>
                  <span className={cn(
                    'font-bold',
                    (weeklySummary?.mais_price_change ?? 0) > 0 ? 'text-secondary' :
                    (weeklySummary?.mais_price_change ?? 0) < 0 ? 'text-red-400' :
                    'text-muted-foreground'
                  )}>
                    {(weeklySummary?.mais_price_change ?? 0) > 0 ? '+' : ''}
                    {weeklySummary?.mais_price_change ?? '—'}%
                    {weeklySummary?.mais_price_change ? ' prix' : ''}
                  </span>
                </div>
                {weeklySummary?.new_members !== undefined && (
                  <div className="flex items-center justify-between border-t border-border/10 pt-2 mt-1">
                    <span className="text-muted-foreground text-xs">Nouveaux membres</span>
                    <span className="font-semibold text-xs text-green-400">
                      +{weeklySummary.new_members}
                    </span>
                  </div>
                )}
                {weeklySummary?.posts_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Publications</span>
                    <span className="font-semibold text-xs text-secondary">
                      {weeklySummary.posts_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {FOOTER_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 bg-card border border-border/20 hover:border-border/40 hover:shadow-lg"
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.iconColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{item.value}</p>
                  <p className="text-xs truncate text-muted-foreground">{item.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground/70" />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
