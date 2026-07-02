'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, TrendingUp, TrendingDown, Search, AlertTriangle, Store, Package, Clock, RefreshCw } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useMarketPrices, type MarketPrice } from '@/hooks/use-markets';
import { formatNumber } from '@/lib/utils';

type SortKey = 'price' | 'change' | 'product' | 'country';
type SortDir = 'asc' | 'desc';

function formatDate(ts: string): string {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return 'À l\'instant';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return ts;
  }
}

function VariationBadge({ change }: { change: number }) {
  const isUp = change >= 0;
  const isHigh = Math.abs(change) > 5;
  return (
    <Badge
      variant={isHigh ? (isUp ? 'danger' : 'warning') : 'outline'}
      className={`gap-1 text-xs font-mono ${!isHigh ? 'border-border/40 text-muted-foreground' : ''} ${isUp ? '' : ''}`}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? '+' : ''}{change.toFixed(1)}%
    </Badge>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold font-mono truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data, isLoading, isError, refetch, isFetching } = useMarketPrices(
    country !== 'all' ? { country } : undefined,
  );

  const items = useMemo(() => {
    const list: MarketPrice[] = Array.isArray(data) ? (data as MarketPrice[]) : [];
    let filtered = list;
    if (search) {
      const q = search.toLowerCase();
      filtered = list.filter(
        (m) => m.product?.toLowerCase().includes(q) || m.market?.toLowerCase().includes(q),
      );
    }
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'price':
          cmp = (a.price ?? 0) - (b.price ?? 0);
          break;
        case 'change':
          cmp = (a.change_percent ?? 0) - (b.change_percent ?? 0);
          break;
        case 'product':
          cmp = (a.product ?? '').localeCompare(b.product ?? '');
          break;
        case 'country':
          cmp = (a.country ?? '').localeCompare(b.country ?? '');
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return filtered;
  }, [data, search, sortKey, sortDir]);

  const summary = useMemo(() => {
    if (!items.length) return null;
    const cheapest = items.reduce((a, b) => (a.price ?? 0) < (b.price ?? 0) ? a : b);
    const priciest = items.reduce((a, b) => (a.price ?? 0) > (b.price ?? 0) ? a : b);
    const markets = new Set(items.map((m) => m.market).filter(Boolean));
    let latest = '';
    items.forEach((m) => {
      if (m.timestamp && m.timestamp > latest) latest = m.timestamp;
    });
    return { cheapest, priciest, marketCount: markets.size, latest };
  }, [items]);

  const countries = useMemo(() => {
    const s = new Set<string>();
    (Array.isArray(data) ? (data as MarketPrice[]) : []).forEach((m: MarketPrice) => {
      if (m.country) s.add(m.country);
    });
    return Array.from(s).sort();
  }, [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'price' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return <span className="ml-1 text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Prix des Marchés</span>
              {items.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{items.length}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Prix des produits agricoles sur les marchés</p>
          </div>
        </div>
      }
      actions={
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-xs">Actualiser</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary cards */}
        {summary && !isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Package} label="Produit le plus cher" value={`${formatNumber(summary.priciest.price ?? 0)} ${summary.priciest.unit ?? ''}`} color="#10B981" />
            <SummaryCard icon={Package} label="Produit le moins cher" value={`${formatNumber(summary.cheapest.price ?? 0)} ${summary.cheapest.unit ?? ''}`} color="#6B7280" />
            <SummaryCard icon={Store} label="Nombre de marchés" value={String(summary.marketCount)} color="#8B5CF6" />
            <SummaryCard icon={Clock} label="Dernière mise à jour" value={summary.latest ? formatDate(summary.latest) : '—'} color="#3B82F6" />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Tous les pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={`${sortKey}-${sortDir}`} onValueChange={(v) => { const [k, d] = v.split('-') as [SortKey, SortDir]; setSortKey(k); setSortDir(d); }}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-desc">Prix (décroissant)</SelectItem>
              <SelectItem value="price-asc">Prix (croissant)</SelectItem>
              <SelectItem value="change-desc">Variation (décroissante)</SelectItem>
              <SelectItem value="change-asc">Variation (croissante)</SelectItem>
              <SelectItem value="product-asc">Produit (A-Z)</SelectItem>
              <SelectItem value="product-desc">Produit (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="⚠️"
            title="Erreur de chargement"
            description="Impossible de charger les prix des marchés."
            action={{ label: 'Réessayer', onClick: () => refetch() }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Aucun prix disponible"
            description="Aucune donnée de marché trouvée pour les filtres actuels."
            action={search || country !== 'all' ? { label: 'Réinitialiser les filtres', onClick: () => { setSearch(''); setCountry('all'); } } : undefined}
          />
        ) : (
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('product')}>
                      Produit<SortIcon columnKey="product" />
                    </th>
                    <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('country')}>
                      Pays<SortIcon columnKey="country" />
                    </th>
                    <th className="text-right px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('price')}>
                      Prix<SortIcon columnKey="price" />
                    </th>
                    <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">Unité</th>
                    <th className="text-center px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('change')}>
                      Variation<SortIcon columnKey="change" />
                    </th>
                    <th className="text-left px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest hidden md:table-cell">Marché</th>
                    <th className="text-right px-4 py-3.5 font-medium text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Mise à jour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {items.map((row, i) => (
                    <tr key={row.id || i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 font-medium">{row.product}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{row.country}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-sm">
                        {formatNumber(row.price ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{row.unit ?? '—'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <VariationBadge change={row.change_percent ?? 0} />
                        {Math.abs(row.change_percent ?? 0) > 5 && (
                          <div className="mt-1">
                            <Badge variant="warning" className="text-[9px] h-4 px-1 gap-0.5">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Forte variation
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{row.market ?? '—'}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-mono text-muted-foreground hidden sm:table-cell">
                        {row.timestamp ? formatDate(row.timestamp) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
