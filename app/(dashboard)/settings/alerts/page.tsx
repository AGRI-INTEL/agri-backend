'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  BellOff,
  BellRing,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  MapPin,
  Wheat,
} from 'lucide-react';
import {
  usePriceAlerts,
  useCreatePriceAlert,
  useUpdatePriceAlert,
  useDeletePriceAlert,
  useCheckPriceAlert,
  CONDITION_LABELS,
  CROP_OPTIONS,
} from '@/hooks/use-price-alerts';
import type { PriceAlert, PriceAlertCreate } from '@/hooks/use-price-alerts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Create Alert Form ──────────────────────────────────────────────────────

function CreateAlertForm({ onClose }: { onClose: () => void }) {
  const createAlert = useCreatePriceAlert();
  const [crop, setCrop] = useState('');
  const [market, setMarket] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [showCustomCrop, setShowCustomCrop] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop.trim()) { toast.error('Veuillez sélectionner une culture'); return; }
    if (!market.trim()) { toast.error('Veuillez entrer un marché'); return; }
    if (!threshold.trim() || isNaN(Number(threshold)) || Number(threshold) <= 0) {
      toast.error('Veuillez entrer un seuil valide');
      return;
    }

    const data: PriceAlertCreate = {
      crop: crop.trim(),
      market: market.trim(),
      condition,
      threshold: Number(threshold),
    };

    await createAlert.mutateAsync(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Crop */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Culture</label>
        {!showCustomCrop ? (
          <div className="flex flex-wrap gap-2">
            {CROP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCrop(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg border transition-all font-medium',
                  crop === opt.value
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                <Wheat className="h-3 w-3 inline mr-1" />
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setShowCustomCrop(true); setCrop(''); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary/40"
            >
              Autre...
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Nom de la culture"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowCustomCrop(false); setCrop(''); }}>
              Cultures
            </Button>
          </div>
        )}
      </div>

      {/* Market */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Marché / Ville</label>
        <Input
          placeholder="ex: Lomé, Abidjan, Ouagadougou..."
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        />
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Condition</label>
        <div className="flex gap-2">
          {(['above', 'below'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={cn(
                'flex-1 px-4 py-2 text-xs rounded-lg border transition-all font-medium flex items-center justify-center gap-1.5',
                condition === c
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {c === 'above' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {CONDITION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Seuil de prix (FCFA/kg)</label>
        <Input
          type="number"
          min={1}
          step={5}
          placeholder="ex: 250"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={createAlert.isPending}>
          <BellRing className="h-4 w-4 mr-2" />
          {createAlert.isPending ? 'Création...' : 'Créer l\'alerte'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Edit Alert Form ────────────────────────────────────────────────────────

function EditAlertForm({ alert, onClose }: { alert: PriceAlert; onClose: () => void }) {
  const updateAlert = useUpdatePriceAlert();
  const [threshold, setThreshold] = useState(String(alert.threshold));
  const [condition, setCondition] = useState<'above' | 'below'>(alert.condition);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threshold.trim() || isNaN(Number(threshold)) || Number(threshold) <= 0) {
      toast.error('Veuillez entrer un seuil valide');
      return;
    }
    await updateAlert.mutateAsync({
      id: alert.id,
      data: { threshold: Number(threshold), condition },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-3 bg-muted rounded-lg space-y-1">
        <p className="text-sm font-medium">{alert.crop} — {alert.market}</p>
        <p className="text-xs text-muted-foreground">Marché: {alert.market}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Condition</label>
        <div className="flex gap-2">
          {(['above', 'below'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={cn(
                'flex-1 px-4 py-2 text-xs rounded-lg border transition-all font-medium flex items-center justify-center gap-1.5',
                condition === c
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {c === 'above' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {CONDITION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Seuil de prix (FCFA/kg)</label>
        <Input
          type="number"
          min={1}
          step={5}
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={updateAlert.isPending}>
          {updateAlert.isPending ? 'Mise à jour...' : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Alert Card ─────────────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: PriceAlert }) {
  const [editOpen, setEditOpen] = useState(false);
  const updateAlert = useUpdatePriceAlert();
  const deleteAlert = useDeletePriceAlert();
  const checkAlert = useCheckPriceAlert();

  const isTriggered = !!alert.last_triggered_at;

  const statusBadge = isTriggered ? (
    <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700">
      <AlertTriangle className="h-3 w-3 mr-1" />Déclenchée
    </Badge>
  ) : alert.is_active ? (
    <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700">
      <BellRing className="h-3 w-3 mr-1" />Active
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      <BellOff className="h-3 w-3 mr-1" />Inactive
    </Badge>
  );

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        isTriggered
          ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/10'
          : alert.is_active
            ? 'border-border bg-card'
            : 'border-border/60 bg-muted/30 opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Wheat className="h-4 w-4 text-primary shrink-0" />
            <h4 className="font-semibold text-sm capitalize truncate">{alert.crop}</h4>
            {statusBadge}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {alert.market}
            </span>
            <span className="flex items-center gap-1">
              {alert.condition === 'above' ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-blue-500" />
              )}
              {CONDITION_LABELS[alert.condition]} {alert.threshold.toLocaleString('fr-FR')} {alert.currency}/kg
            </span>
          </div>
          {alert.last_triggered_at && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
              Déclenchée le {new Date(alert.last_triggered_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Switch
            checked={alert.is_active}
            onCheckedChange={(checked) =>
              updateAlert.mutate({ id: alert.id, data: { is_active: checked } })
            }
            aria-label="Activer/désactiver l'alerte"
            disabled={updateAlert.isPending}
          />

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l'alerte</DialogTitle>
                <DialogDescription>
                  Modifiez le seuil ou la condition de l'alerte pour {alert.crop} à {alert.market}.
                </DialogDescription>
              </DialogHeader>
              <EditAlertForm alert={alert} onClose={() => setEditOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => checkAlert.mutate(alert.id)}
            disabled={checkAlert.isPending}
            title="Vérifier manuellement"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', checkAlert.isPending && 'animate-spin')} />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer l'alerte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer l'alerte pour {alert.crop} à {alert.market} ?
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAlert.mutate(alert.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <BellOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-base font-semibold">Aucune alerte de prix</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Créez des alertes personnalisées pour être notifié lorsque le prix d&apos;une culture
          dépasse ou descend en dessous d&apos;un seuil dans un marché spécifique.
        </p>
      </div>
      <Button onClick={onOpen}>
        <Plus className="h-4 w-4 mr-2" />
        Créer une alerte
      </Button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function SettingsAlertsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { data: alerts, isLoading } = usePriceAlerts(filter);

  const filters = [
    { value: undefined, label: 'Toutes' },
    { value: 'active', label: 'Actives' },
    { value: 'inactive', label: 'Inactives' },
    { value: 'triggered', label: 'Déclenchées' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alertes de prix</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Soyez notifié quand les prix des cultures atteignent vos seuils définis
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle alerte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une alerte de prix</DialogTitle>
              <DialogDescription>
                Soyez averti quand le prix d&apos;une culture dépasse ou descend en dessous d&apos;un seuil.
              </DialogDescription>
            </DialogHeader>
            <CreateAlertForm onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Box */}
      <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-300">
          <p className="font-medium mb-1">Comment ça fonctionne ?</p>
          <p>
            Les alertes sont vérifiées automatiquement chaque fois que les prix sont mis à jour.
            Vous pouvez aussi vérifier manuellement une alerte à tout moment.
            Exemple : &quot;Prévenez-moi quand le maïs dépasse 250 FCFA/kg à Lomé.&quot;
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg border transition-all font-medium',
              filter === f.value
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !alerts?.length ? (
        <EmptyState onOpen={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
