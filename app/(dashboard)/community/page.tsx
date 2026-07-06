'use client';

import { useEffect, useState } from 'react';
import { motion } from '@/lib/motion';
import {
  Plus, TrendingUp, Users, MessageSquare, Flame, Search,
  Filter, Globe, ArrowRight, LayoutGrid, List, BookOpen, Settings,
} from 'lucide-react';
import { GroupCard } from '@/components/community/group-card';
import { PostCard } from '@/components/community/post-card';
import { CreateGroupDialog } from '@/components/community/create-group-dialog';
import { CommunitySettingsDialog } from '@/components/community/community-settings-dialog';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGroups, useCommunityStats, useTrendingGroups, useTrendingPosts, usePublicPosts,
} from '@/hooks/use-community';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetPreferences } from '@/hooks/use-settings';
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

type MainTab = 'groups' | 'discussions' | 'trending';

const CATEGORIES = [
  { name: 'Tous les secteurs', icon: '🌐', sector: '' },
  { name: 'Agriculture générale', icon: '🌾', sector: 'general' as const },
  { name: 'Élevage',              icon: '🐄', sector: 'animal' as const },
  { name: 'Pêche',                icon: '🐟', sector: 'halieutique' as const },
  { name: 'Foresterie',           icon: '🌳', sector: 'forestier' as const },
  { name: 'Végétal',              icon: '🌱', sector: 'vegetal' as const },
];

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [sector, setSector] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('groups');
  const [discSearch, setDiscSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const debouncedDiscSearch = useDebounce(discSearch, 300);

  // Applique les préférences communauté (tri/vue par défaut) une seule fois au chargement
  const { data: userPrefs } = useGetPreferences();
  const [prefsApplied, setPrefsApplied] = useState(false);
  useEffect(() => {
    if (!prefsApplied && userPrefs?.community) {
      if (userPrefs.community.default_sort) setSortBy(userPrefs.community.default_sort);
      if (userPrefs.community.default_view) setView(userPrefs.community.default_view);
      setPrefsApplied(true);
    }
  }, [prefsApplied, userPrefs?.community]);

  const { data, isLoading } = useGroups({
    search: debouncedSearch || undefined,
    type: type !== 'all' ? type : undefined,
    sector: sector || undefined,
    sort: sortBy,
  });

  const { data: communityStats } = useCommunityStats();
  const { data: trendingData } = useTrendingGroups();
  const { data: trendingPosts, isLoading: postsLoading } = useTrendingPosts();
  const { data: publicPostsData, isLoading: discLoading } = usePublicPosts({
    search: debouncedDiscSearch || undefined,
  });

  const groups = data?.data || [];
  const publicPosts = publicPostsData?.posts || [];

  const statValues = {
    members: communityStats?.active_members?.toLocaleString('fr-FR') ?? '—',
    discussions: (communityStats?.total_discussions ?? 0).toLocaleString('fr-FR'),
    groups: communityStats?.total_groups?.toLocaleString('fr-FR') ?? String(data?.total ?? '—'),
    growth: communityStats?.growth_percent != null ? `+${communityStats.growth_percent}%` : '—',
  };

  const trendingGroups: TrendingGroup[] = Array.isArray(trendingData) && trendingData.length > 0
    ? (trendingData as unknown as TrendingGroup[])
    : [];

  function handleCategoryClick(cat: typeof CATEGORIES[0]) {
    setSector(cat.sector);
    setMainTab('groups');
  }

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#065f46] to-[#043927]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="furrows" x="0" y="0" width="1" height="18" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="10000" y2="0" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#furrows)" opacity="0.06" />
        </svg>
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
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="sm:pt-1 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                title="Paramètres de la communauté"
                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button className="bg-[#D97706] hover:bg-[#b45309] text-white font-semibold shadow-lg border-0" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
            </motion.div>
          </div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
            {[
              { icon: Users,         label: 'Membres actifs', value: statValues.members },
              { icon: MessageSquare, label: 'Discussions',    value: statValues.discussions },
              { icon: Globe,         label: 'Groupes',        value: statValues.groups },
              { icon: TrendingUp,    label: 'Croissance',     value: statValues.growth },
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
        <CommunitySettingsDialog open={showSettings} onOpenChange={setShowSettings} />

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

                {/* Recherche groupes */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setMainTab('groups'); }}
                    placeholder="Trouver un groupe..."
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Recherche discussions */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={discSearch}
                    onChange={(e) => { setDiscSearch(e.target.value); setMainTab('discussions'); }}
                    placeholder="Chercher une discussion..."
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Type de groupe</label>
                  <Select value={type} onValueChange={(v) => { setType(v); setMainTab('groups'); }}>
                    <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                      <SelectItem value="professional">Professionnel</SelectItem>
                      <SelectItem value="research">Recherche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Trier par</label>
                  <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setMainTab('groups'); }}>
                    <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Récent</SelectItem>
                      <SelectItem value="popular">Populaire</SelectItem>
                      <SelectItem value="members">Plus de membres</SelectItem>
                      <SelectItem value="trending">Tendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trending groups */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <Flame className="h-3.5 w-3.5 text-[#D97706]" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Groupes tendance</h3>
                </div>
                {trendingGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Aucun groupe pour l&apos;instant</p>
                ) : (
                  <div className="space-y-1">
                    {trendingGroups.slice(0, 5).map((g, idx) => (
                      <div
                        key={g.id ?? idx}
                        className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                        onClick={() => { setSector(''); setSearch(''); setMainTab('groups'); }}
                      >
                        <span className="text-[11px] font-black text-muted-foreground/60 w-4 shrink-0 tabular-nums">#{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{g.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {(g.members_count ?? g.member_count ?? 0).toLocaleString('fr-FR')} membres
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories / Secteurs */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">Secteurs</h3>
                <div className="space-y-0.5">
                  {CATEGORIES.map((cat) => {
                    const color = cat.sector ? GROUP_SECTOR_COLORS[cat.sector as keyof typeof GROUP_SECTOR_COLORS] : '#6B7280';
                    const isActive = sector === cat.sector;
                    return (
                      <button
                        key={cat.sector || 'all'}
                        onClick={() => handleCategoryClick(cat)}
                        className={cn(
                          'w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )}
                      >
                        {cat.sector ? (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        ) : (
                          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="text-base leading-none">{cat.icon}</span>
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Main tabs */}
            <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 w-fit">
              <button
                onClick={() => setMainTab('groups')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  mainTab === 'groups'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="h-4 w-4" />
                Groupes
                {data?.total != null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {data.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMainTab('discussions')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  mainTab === 'discussions'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BookOpen className="h-4 w-4" />
                Discussions
                {publicPostsData?.total != null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {publicPostsData.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMainTab('trending')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  mainTab === 'trending'
                    ? 'bg-background shadow-sm text-[#D97706]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Flame className="h-4 w-4" />
                Tendances
              </button>
            </div>

            {/* ── Onglet Groupes ── */}
            {mainTab === 'groups' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{data?.total ?? groups.length}</span>{' '}
                      groupe{(data?.total ?? groups.length) !== 1 ? 's' : ''} trouvé{(data?.total ?? groups.length) !== 1 ? 's' : ''}
                    </p>
                    {sector && (
                      <button
                        onClick={() => setSector('')}
                        className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {CATEGORIES.find(c => c.sector === sector)?.icon} {CATEGORIES.find(c => c.sector === sector)?.name} ×
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-muted/50 rounded-lg p-0.5 gap-0.5">
                      <button
                        onClick={() => setView('grid')}
                        className={cn('p-1.5 rounded-md transition-colors', view === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}
                        title="Vue grille"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setView('list')}
                        className={cn('p-1.5 rounded-md transition-colors', view === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}
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
                    className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3')}
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

                {groups.length > 0 && data?.has_next && (
                  <div className="pt-2 flex justify-center">
                    <Button variant="outline" size="sm" className="gap-2">
                      Voir plus de groupes
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* ── Onglet Discussions publiques ── */}
            {mainTab === 'discussions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-foreground" />
                    <h2 className="text-sm font-bold text-foreground">Publications publiques</h2>
                    <span className="text-xs text-muted-foreground">— tous les groupes publics</span>
                  </div>
                  {publicPostsData?.total != null && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {publicPostsData.total} publication{publicPostsData.total !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {discLoading ? (
                  <LoadingSkeleton variant="card" count={4} />
                ) : publicPosts.length === 0 ? (
                  <EmptyState
                    icon="📝"
                    title="Aucune publication publique"
                    description="Les publications des groupes publics apparaîtront ici dès qu'il y aura de l'activité."
                  />
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {publicPosts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        {post.group && (
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <a
                              href={`/community/groups/${post.group_id}`}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              {post.group.name}
                            </a>
                          </div>
                        )}
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {publicPostsData?.has_next && (
                  <div className="pt-2 flex justify-center">
                    <Button variant="outline" size="sm" className="gap-2">
                      Voir plus de discussions
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── Onglet Tendances ── */}
            {mainTab === 'trending' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#D97706]" />
                  <h2 className="text-sm font-bold text-foreground">Publications les plus populaires</h2>
                  <span className="text-xs text-muted-foreground">— issues des groupes publics</span>
                </div>

                {postsLoading ? (
                  <LoadingSkeleton variant="card" count={4} />
                ) : !trendingPosts || trendingPosts.length === 0 ? (
                  <EmptyState
                    icon="🔥"
                    title="Aucune publication tendance"
                    description="Les publications les plus populaires des groupes publics apparaîtront ici."
                  />
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {trendingPosts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {post.group && (
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <Flame className="h-3 w-3 text-[#D97706]" />
                            <a
                              href={`/community/groups/${post.group_id}`}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              {post.group.name}
                            </a>
                          </div>
                        )}
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
