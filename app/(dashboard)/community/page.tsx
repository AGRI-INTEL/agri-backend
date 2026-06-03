'use client';

import { useState } from 'react';
import { Plus, TrendingUp, Users, MapPin, Trophy, MessageSquare, Flame, Search } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupCard } from '@/components/community/group-card';
import { CreateGroupDialog } from '@/components/community/create-group-dialog';
import { SearchBar } from '@/components/shared/search-bar';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGroups } from '@/hooks/use-community';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

export default function CommunityPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGroups({
    search: debouncedSearch || undefined,
    type: type !== 'all' ? type : undefined,
  });

  const groups = data?.data || [];

  // Mock trending groups
  const trendingGroups = [
    { name: 'Maraîchage bio', members: 1250, growth: 15 },
    { name: 'Élevage durable', members: 980, growth: 12 },
    { name: 'Coton équitable', members: 850, growth: 8 },
  ];

  // Mock community stats
  const stats = [
    { icon: Users, label: 'Membres actifs', value: '12,450', color: 'text-blue-500' },
    { icon: MessageSquare, label: 'Discussions', value: '3,240', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Groupes', value: '284', color: 'text-purple-500' },
    { icon: Flame, label: 'Tendance', value: '+24%', color: 'text-orange-500' },
  ];

  const [showCreate, setShowCreate] = useState(false);

  return (
    <PageWrapper
      title="Communauté"
      description="Connectez-vous avec des agriculteurs et partagez vos expériences"
      actions={
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Créer un groupe
        </Button>
      }
    >
      <CreateGroupDialog open={showCreate} onOpenChange={setShowCreate} />
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-gradient-to-br from-muted to-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              </div>
              <Icon className={cn('h-6 w-6', color)} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Search */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Filtres</h3>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Trouver un groupe..."
                    className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="text-sm">
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
                <label className="text-xs font-medium text-muted-foreground block mb-2">Trier par</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="text-sm">
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

            {/* Trending Groups */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h3 className="font-semibold text-sm">En tendance</h3>
              </div>
              
              {trendingGroups.map((group, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{group.members.toLocaleString()} membres</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 text-xs">+{group.growth}%</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-3">Catégories</h3>
              {[
                { name: 'Agriculture générale', count: 45 },
                { name: 'Élevage', count: 32 },
                { name: 'Pêche', count: 18 },
                { name: 'Foresterie', count: 12 },
                { name: 'Coopératives', count: 25 },
              ].map((cat, idx) => (
                <button
                  key={idx}
                  className="w-full text-left p-2 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <div className="flex items-center justify-between">
                    <span>{cat.name}</span>
                    <Badge variant="outline" className="text-xs">{cat.count}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {groups.length} groupe{groups.length !== 1 ? 's' : ''} trouvé{groups.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    view === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {v === 'grid' ? '⊞ Grille' : '≡ Liste'}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Display */}
          {isLoading ? (
            <LoadingSkeleton variant="card" count={6} />
          ) : groups.length === 0 ? (
            <EmptyState
              icon="👥"
              title="Aucun groupe trouvé"
              description="Essayez d'autres filtres ou créez votre propre groupe pour démarrer."
            />
          ) : (
            <div className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                : 'space-y-3'
            )}>
              {groups.map((g) => <GroupCard key={g.id} group={g} variant={view} />)}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
