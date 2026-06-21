'use client';

import { useState } from 'react';
import { motion } from '@/lib/motion';
import {
  Plus, TrendingUp, Users, MessageSquare, Flame, Search,
  Filter, Globe, ArrowRight, LayoutGrid, List,
} from 'lucide-react';
import { GroupCard } from '@/components/community/group-card';
import { CreateGroupDialog } from '@/components/community/create-group-dialog';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGroups, useCommunityStats, useTrendingGroups } from '@/hooks/use-community';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { GROUP_SECTOR_COLORS } from '@/types/community';

type TrendingGroup = {
  id?: string;
  name: string;
  members_count?: number;
  member_count?: number;
  growth_percent?: number;
  trend_score?: number;
};

const CATEGORIES = [
  { name: 'Agriculture générale', count: 45, icon: '🌾', sector: 'general' as const },
  { name: 'Élevage', count: 32, icon: '🐄', sector: 'animal' as const },
  { name: 'Pêche', count: 18, icon: '🐟', sector: 'halieutique' as const },
  { name: 'Foresterie', count: 12, icon: '🌳', sector: 'forestier' as const },
  { name: 'Coopératives', count: 25, icon: '🤝', sector: 'general' as const },
];

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGroups({
    search: debouncedSearch || undefined,
    type: type !== 'all' ? type : undefined,
    sort: sortBy,
  });

  const { data: communityStats } = useCommunityStats();
  const { data: trendingData } = useTrendingGroups();

  const groups = data?.data || [];

  const statValues = {
    members: communityStats?.active_members?.toLocaleString('fr-FR') || '—',
    discussions: (communityStats?.total_discussions ?? (communityStats as unknown as { total_posts?: number } | undefined)?.total_posts)?.toLocaleString('fr-FR') || '—',
    groups: communityStats?.total_groups?.toLocaleString('fr-FR') || String(data?.total || '—'),
    growth: communityStats?.growth_percent != null ? `+${communityStats.growth_percent}%` : '—',
  };

  const trendingGroups: TrendingGroup[] = (trendingData && (trendingData as unknown as TrendingGroup[]).length > 0)
    ? (trendingData as unknown as TrendingGroup[])
    : [
        { id: '1', name: 'Maraîchage bio', members_count: 1250, growth_percent: 15 },
        { id: '2', name: 'Élevage durable', members_count: 980, growth_percent: 12 },
        { id: '3', name: 'Coton équitable', members_count: 850, growth_percent: 8 },
      ];

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#065f46] to-[#043927]">
        {/* Crop-furrow texture */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="furrows" x="0" y="0" width="1" height="18" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="10000" y2="0" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#furrows)" opacity="0.06" />
        </svg>

        {/* Amber sunrise glow — top right */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.25) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 mb-1.5">Réseau agricole</p>
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">Communauté AgriIntel</h1>
              <p className="text-white/60 text-sm mt-2 max-w-sm">Échangez avec des agriculteurs, partagez vos pratiques et apprenez ensemble.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="sm:pt-1"
            >
              <Button
                className="bg-[#D97706] hover:bg-[#b45309] text-white font-semibold shadow-lg border-0"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            {[
              { icon: Users, label: 'Membres actifs', value: statValues.members },
              { icon: MessageSquare, label: 'Discussions', value: statValues.discussions },
              { icon: Globe, label: 'Groupes', value: statValues.groups },
              { icon: TrendingUp, label: 'Croissance', value: statValues.growth },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-white/50" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
                </div>
                <p className="text-xl font-black text-white font-data leading-none">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Page Content ────────────────────────────────────────────────── */}
      <div className="p-6">
        <CreateGroupDialog open={showCreate} onOpenChange={setShowCreate} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Search & Filters */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filtres</h3>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Trouver un groupe..."
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="prive">Privé</SelectItem>
                      <SelectItem value="professionnel">Professionnel</SelectItem>
                      <SelectItem value="institutionnel">Institutionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Trier par</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Récent</SelectItem>
                      <SelectItem value="popular">Populaire</SelectItem>
                      <SelectItem value="members">Plus de membres</SelectItem>
                      <SelectItem value="trending">Tendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trending */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <Flame className="h-3.5 w-3.5 text-[#D97706]" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">En tendance</h3>
                </div>
                <div className="space-y-1">
                  {trendingGroups.map((g, idx) => (
                    <div
                      key={g.id || idx}
                      className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <span className="text-[11px] font-black text-muted-foreground/60 w-4 shrink-0 tabular-nums">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{g.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {(g.members_count ?? g.member_count ?? 0).toLocaleString('fr-FR')} membres
                        </p>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                        +{g.growth_percent ?? g.trend_score ?? 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">Catégories</h3>
                <div className="space-y-0.5">
                  {CATEGORIES.map((cat) => {
                    const color = GROUP_SECTOR_COLORS[cat.sector];
                    return (
                      <button
                        key={cat.name}
                        className="w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-base leading-none">{cat.icon}</span>
                          <span className="text-sm">{cat.name}</span>
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{groups.length}</span>{' '}
                groupe{groups.length !== 1 ? 's' : ''} trouvé{groups.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex bg-muted/50 rounded-lg p-0.5 gap-0.5">
                  <button
                    onClick={() => setView('grid')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      view === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Vue grille"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      view === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Vue liste"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton variant="card" count={6} />
            ) : groups.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Aucun groupe trouvé"
                description="Essayez d'autres filtres ou créez votre propre groupe pour démarrer."
              />
            ) : (
              <motion.div
                className={cn(
                  view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {groups.map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <GroupCard group={g} variant={view} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {groups.length > 0 && (
              <div className="pt-2 flex justify-center">
                <Button variant="outline" size="sm" className="gap-2">
                  Voir plus de groupes
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
