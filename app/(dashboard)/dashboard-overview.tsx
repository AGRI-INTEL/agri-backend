'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from '@/lib/motion';
import {
  Sprout, Fish, TreePine, Beef,
  BarChart3, Bell, RefreshCw, Plus,
  TrendingUp, Map, ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ProductionChart } from '@/components/dashboard/production-chart';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { AlertsTicker } from '@/components/dashboard/alerts-ticker';
import { InteractiveMap } from '@/components/map/interactive-map';
import { cn } from '@/lib/utils';
import type { KPIStats, ProductionDataPoint } from '@/types/api';

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
    queryFn: () => apiClient.get<ProductionDataPoint[]>('/dashboard/production'),
  });

  const displayName = mounted
    ? (user?.display_name || user?.name || user?.email?.split('@')[0] || 'Utilisateur')
    : 'Utilisateur';

  return (
    <div className="min-h-full" style={{ background: '#0C1810' }}>
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: '#0C1810' }}>
        {/* Landscape photo bg */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/fond-landscape.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            style={{ opacity: 0.20, objectPosition: 'center 40%' }}
            sizes="100vw"
          />
        </div>
        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(135deg, rgba(12,24,16,0.95) 0%, rgba(12,24,16,0.75) 50%, rgba(12,24,16,0.95) 100%)',
          }}
          aria-hidden
        />
        {/* Gold horizon glow */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 70% 80%, rgba(196,146,58,0.12) 0%, transparent 55%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 px-6 py-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm font-semibold mb-1 capitalize" style={{ color: '#7D9486' }}>
                {dateStr}{timeStr ? ` · ${timeStr}` : ''}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold italic" style={{ color: '#E8E0CC' }}>
                {greeting},{' '}
                <span style={{ color: '#C4923A' }} className="capitalize">{displayName}</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: '#7D9486' }}>
                Voici un résumé de votre activité agricole aujourd&apos;hui.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="flex items-center gap-2 shrink-0"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <button
                onClick={() => refetchKpis()}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(196,146,58,0.08)',
                  border: '1px solid rgba(196,146,58,0.22)',
                  color: '#C4923A',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.14)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.08)'; }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Actualiser
              </button>
              <Link
                href="/alerts"
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: '#C4923A',
                  color: '#1A1000',
                  boxShadow: '0 4px 16px rgba(196,146,58,0.28)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#DDA85A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C4923A'; }}
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
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                  style={{
                    background: 'rgba(21,34,25,0.80)',
                    border: '1px solid rgba(196,146,58,0.14)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(196,146,58,0.32)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(21,34,25,0.97)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(196,146,58,0.14)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(21,34,25,0.80)';
                  }}
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: s.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight" style={{ color: '#E8E0CC' }}>{s.label}</p>
                    <p className="text-xs" style={{ color: '#4A6050' }}>Voir détails</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#4A6050' }} />
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── Page Content ──────────────────────────────────────────────────── */}
      <div className="p-6 space-y-5" style={{ background: '#0C1810' }}>
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
            className="rounded-xl overflow-hidden min-h-[300px] flex flex-col"
            style={{
              background: '#152219',
              border: '1px solid rgba(196,146,58,0.14)',
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid rgba(196,146,58,0.10)' }}
            >
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4" style={{ color: '#C4923A' }} />
                <span className="text-sm font-semibold" style={{ color: '#E8E0CC' }}>Carte des Zones</span>
              </div>
              <Link
                href="/map"
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: '#7D9486' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C4923A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#7D9486'; }}
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

        {/* Stats summary footer row */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          {FOOTER_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('group flex items-center gap-4 p-4 rounded-xl transition-all duration-200')}
                style={{
                  background: '#152219',
                  border: '1px solid rgba(196,146,58,0.12)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(196,146,58,0.30)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(196,146,58,0.12)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.iconColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#E8E0CC' }}>{item.value}</p>
                  <p className="text-xs truncate" style={{ color: '#7D9486' }}>{item.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto shrink-0" style={{ color: '#4A6050' }} />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
