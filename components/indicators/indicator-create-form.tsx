'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateIndicator } from '@/hooks/use-indicators';

const SECTOR_OPTIONS = ['vegetal', 'animal', 'halieutique', 'forestier'];
const CATEGORY_OPTIONS = ['comptes_exploitation', 'revenus', 'pauvrete', 'nutrition', 'sante', 'bien_etre'];
const TYPE_OPTIONS = [
  'chiffre_affaires', 'charges_exploitation', 'marge_brute', 'valeur_ajoutee',
  'revenu_mensuel', 'revenu_annuel', 'seuil_pauvrete', 'diversite_alimentaire',
  'taux_malnutrition_legere', 'acces_soins', 'satisfaction_professionnelle',
  'emploi_rural', 'securite_fonciere',
];
const UNIT_OPTIONS = ['XOF', 'EUR', 'USD', 'pourcentage', 'nombre', 'score_1_5', 'kg_par_personne_mois'];

export function IndicatorCreateForm() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateIndicator();
  const [form, setForm] = useState({
    actor_id: '',
    sector: 'vegetal',
    category: 'revenus',
    type: 'revenu_annuel',
    unit: 'XOF',
    value: 0,
    year: new Date().getFullYear(),
    source: 'Saisie manuelle',
    comment: '',
  });

  const handleSubmit = async () => {
    if (!form.actor_id.trim()) {
      toast.error('ID acteur requis');
      return;
    }
    try {
      await mutation.mutateAsync(form as unknown as Record<string, unknown>);
      toast.success('Indicateur créé');
      setOpen(false);
      setForm({ ...form, value: 0, comment: '', source: 'Saisie manuelle' });
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvel indicateur</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Créer un indicateur
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>ID de l&apos;acteur (UUID)</Label>
            <Input
              placeholder="Entrez l'UUID de l'acteur"
              value={form.actor_id}
              onChange={(e) => setForm({ ...form, actor_id: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Secteur</Label>
              <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTOR_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type d&apos;indicateur</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unité</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valeur</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Année</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Commentaire</Label>
            <Input
              placeholder="Optionnel"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Créer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
