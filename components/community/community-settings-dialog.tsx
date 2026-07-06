'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Bell, Eye, LayoutGrid, Loader2, Save } from 'lucide-react';
import {
  useGetPreferences, useUpdatePreferences, type CommunityPreferences,
} from '@/hooks/use-settings';

const DEFAULTS: Required<CommunityPreferences> = {
  default_sort: 'recent',
  default_view: 'grid',
  notify_new_posts: true,
  notify_comments: true,
  notify_mentions: true,
  notify_join_requests: true,
  notify_events: true,
  show_profile: true,
  allow_group_invites: true,
};

interface CommunitySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunitySettingsDialog({ open, onOpenChange }: CommunitySettingsDialogProps) {
  const { data: prefs, isLoading } = useGetPreferences();
  const updatePrefs = useUpdatePreferences();
  const [values, setValues] = useState<Required<CommunityPreferences>>(DEFAULTS);

  useEffect(() => {
    if (open && prefs?.community) {
      setValues({ ...DEFAULTS, ...prefs.community });
    }
  }, [open, prefs?.community]);

  const set = <K extends keyof CommunityPreferences>(key: K, value: CommunityPreferences[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const save = () => {
    updatePrefs.mutate(
      { community: values },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramètres de la communauté</DialogTitle>
          <DialogDescription>
            Personnalisez votre expérience : affichage, notifications et confidentialité.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Affichage ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                Affichage
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tri des publications</Label>
                  <Select value={values.default_sort} onValueChange={(v) => set('default_sort', v as 'recent' | 'popular')}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Plus récentes</SelectItem>
                      <SelectItem value="popular">Plus populaires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Vue des groupes</Label>
                  <Select value={values.default_view} onValueChange={(v) => set('default_view', v as 'grid' | 'list')}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grille</SelectItem>
                      <SelectItem value="list">Liste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Notifications ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Notifications
              </div>
              {([
                ['notify_new_posts', 'Nouvelles publications de mes groupes'],
                ['notify_comments', 'Réponses et commentaires'],
                ['notify_mentions', 'Mentions (@moi)'],
                ['notify_join_requests', "Demandes d'adhésion à mes groupes"],
                ['notify_events', 'Événements et rencontres'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
                  <Switch id={key} checked={values[key]} onCheckedChange={(c) => set(key, c)} />
                </div>
              ))}
            </div>

            <Separator />

            {/* ── Confidentialité ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Confidentialité
              </div>
              {([
                ['show_profile', 'Profil visible par les membres des groupes'],
                ['allow_group_invites', 'Autoriser les invitations à des groupes'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
                  <Switch id={key} checked={values[key]} onCheckedChange={(c) => set(key, c)} />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button onClick={save} disabled={updatePrefs.isPending} className="gap-2 bg-[#064E3B] hover:bg-[#065f46]">
                {updatePrefs.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
