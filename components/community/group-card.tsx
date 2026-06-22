'use client';

import React from 'react';
import Image from 'next/image';
import { Users, Lock, Globe, Briefcase, Building2, MessageSquare, TrendingUp, Heart, Sprout, Beef, Fish, TreePine, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJoinGroup } from '@/hooks/use-community';
import { cn } from '@/lib/utils';
import type { Group } from '@/types/community';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; ring: string; text: string }> = {
  public:       { icon: Globe,      label: 'Public',     ring: 'ring-blue-400',    text: 'text-blue-600' },
  private:      { icon: Lock,       label: 'Privé',      ring: 'ring-slate-400',   text: 'text-slate-600' },
  professional: { icon: Briefcase,  label: 'Pro',        ring: 'ring-violet-400',  text: 'text-violet-600' },
  research:     { icon: Building2,  label: 'Recherche',  ring: 'ring-emerald-400', text: 'text-emerald-700' },
  regional:     { icon: Globe,      label: 'Régional',   ring: 'ring-cyan-400',    text: 'text-cyan-700' },
  thematic:     { icon: Globe,      label: 'Thématique', ring: 'ring-purple-400',  text: 'text-purple-700' },
};

const SECTOR_GRADIENT = {
  general:     'from-indigo-600/80 to-indigo-900/90',
  vegetal:     'from-green-600/80 to-green-900/90',
  animal:      'from-amber-600/80 to-amber-900/90',
  halieutique: 'from-blue-600/80 to-blue-900/90',
  forestier:   'from-[#064E3B]/80 to-[#021f18]/95',
} as const;

const SECTOR_ICON = {
  general:     LayoutGrid,
  vegetal:     Sprout,
  animal:      Beef,
  halieutique: Fish,
  forestier:   TreePine,
} as const;

interface GroupCardProps {
  group: Group;
  variant?: 'grid' | 'list';
}

export function GroupCard({ group, variant = 'grid' }: GroupCardProps) {
  const join = useJoinGroup();
  const typeKey = group.type in TYPE_CONFIG ? group.type : 'public';
  const typeCfg = TYPE_CONFIG[typeKey];
  const TypeIcon = typeCfg.icon;
  const sectorKey = (group.sector as keyof typeof SECTOR_GRADIENT) in SECTOR_GRADIENT ? group.sector as keyof typeof SECTOR_GRADIENT : 'general';
  const SectorIcon = SECTOR_ICON[sectorKey];
  const gradientClass = SECTOR_GRADIENT[sectorKey];

  const isMember = group.membership_status === 'member' || group.membership_status === 'admin' || group.membership_status === 'owner';

  if (variant === 'list') {
    return (
      <div className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex items-center gap-4">
        {/* Avatar */}
        <div className={cn('h-14 w-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative ring-2', typeCfg.ring)}>
          {group.avatar
            ? <Image src={group.avatar} alt={group.name} fill sizes="56px" className="object-cover" />
            : (
              <div className={cn('absolute inset-0 flex items-center justify-center bg-gradient-to-br', gradientClass)}>
                <SectorIcon className="h-6 w-6 text-white/90" />
              </div>
            )
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
            <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide bg-muted', typeCfg.text)}>
              <TypeIcon className="h-3 w-3" />
              {typeCfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{group.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{group.members_count.toLocaleString('fr-FR')}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{group.posts_count ?? '—'}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          {!isMember && group.membership_status !== 'pending' && (
            <Button size="sm" className="bg-[#064E3B] hover:bg-[#065f46]" onClick={() => join.mutate(group.id)} disabled={join.isPending}>
              Rejoindre
            </Button>
          )}
          {group.membership_status === 'pending' && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full">En attente</span>
          )}
          {isMember && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/community/groups/${group.id}`}>Visiter</a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col">
      {/* Banner */}
      <div className={cn('h-24 relative overflow-hidden bg-gradient-to-br', gradientClass)}>
        {group.banner && (
          <Image src={group.banner} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover opacity-70" />
        )}
        {/* Sector watermark */}
        <div className="absolute bottom-2 right-3 opacity-20">
          <SectorIcon className="h-10 w-10 text-white" />
        </div>
        {/* Type badge */}
        <div className="absolute top-2 left-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
            <TypeIcon className="h-3 w-3" />
            {typeCfg.label}
          </span>
        </div>
        {/* Bookmark */}
        <button className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/25 hover:bg-black/50 flex items-center justify-center transition-colors">
          <Heart className="h-3.5 w-3.5 text-white" />
        </button>
        {/* Avatar */}
        <div className="absolute -bottom-6 left-4">
          <div className={cn('h-12 w-12 rounded-xl border-2 border-card overflow-hidden relative ring-2 shadow-lg flex items-center justify-center', typeCfg.ring)}>
            {group.avatar
              ? <Image src={group.avatar} alt={group.name} fill sizes="48px" className="object-cover" />
              : <div className={cn('absolute inset-0 bg-gradient-to-br flex items-center justify-center', gradientClass)}><SectorIcon className="h-5 w-5 text-white" /></div>
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 px-4 pb-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm leading-tight mb-1">{group.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{group.description}</p>

        {/* Tags */}
        {group.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {group.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{t}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pb-3 mb-3 border-b border-border">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{group.members_count.toLocaleString('fr-FR')} membres</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{group.posts_count ?? '—'} posts</span>
          {group.members_count > 100 && (
            <span className="ml-auto flex items-center gap-1 text-green-600 font-medium"><TrendingUp className="h-3 w-3" />Actif</span>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
            <a href={`/community/groups/${group.id}`}>Voir</a>
          </Button>
          {!isMember && group.membership_status !== 'pending' && (
            <Button size="sm" className="flex-1 h-8 text-xs bg-[#064E3B] hover:bg-[#065f46]" onClick={() => join.mutate(group.id)} disabled={join.isPending}>
              Rejoindre
            </Button>
          )}
          {group.membership_status === 'pending' && (
            <span className="flex-1 flex items-center justify-center text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg">En attente</span>
          )}
          {isMember && (
            <span className="flex-1 flex items-center justify-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">✓ Membre</span>
          )}
        </div>
      </div>
    </div>
  );
}
