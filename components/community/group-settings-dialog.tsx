'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Camera, Save, Loader2, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDeleteGroup } from '@/hooks/use-community';
import type { Group } from '@/types/community';

interface GroupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

const SECTORS = [
  { value: 'general', label: 'Général' },
  { value: 'vegetal', label: 'Végétal' },
  { value: 'animal', label: 'Animal' },
  { value: 'halieutique', label: 'Halieutique' },
  { value: 'forestier', label: 'Forestier' },
];

const GROUP_TYPES = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Privé' },
  { value: 'professional', label: 'Professionnel' },
  { value: 'research', label: 'Recherche' },
  { value: 'regional', label: 'Régional' },
  { value: 'thematic', label: 'Thématique' },
];

export function GroupSettingsDialog({ open, onOpenChange, group }: GroupSettingsDialogProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const deleteGroup = useDeleteGroup();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [rules, setRules] = useState(group.rules || '');
  const [type, setType] = useState(group.type);
  const [sector, setSector] = useState(group.sector);
  const [requiresApproval, setRequiresApproval] = useState(group.requires_approval);
  const [maxMembers, setMaxMembers] = useState(String(group.max_members ?? 1000));
  const [tags, setTags] = useState((group.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (name !== group.name) updateData.name = name;
      if (description !== (group.description || '')) updateData.description = description;
      if (rules !== (group.rules || '')) updateData.rules = rules;
      if (type !== group.type) updateData.type = type;
      if (sector !== group.sector) updateData.sector = sector;
      if (requiresApproval !== group.requires_approval) updateData.requires_approval = requiresApproval;
      const parsedMax = maxMembers === '' ? undefined : Number(maxMembers);
      if (parsedMax !== undefined && parsedMax !== (group.max_members ?? 1000)) {
        updateData.max_members = parsedMax;
      }
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const originalTags = (group.tags || []).join(', ');
      if (tags !== originalTags) updateData.tags = tagArray;

      if (Object.keys(updateData).length > 0) {
        await apiClient.put(`/community/groups/${group.id}`, updateData);
      }

      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        const result = await apiClient.upload<{ url: string }>('/files/upload', fd);
        await apiClient.put(`/community/groups/${group.id}`, { avatar_url: result.url });
      }

      if (bannerFile) {
        const fd = new FormData();
        fd.append('file', bannerFile);
        const result = await apiClient.upload<{ url: string }>('/files/upload', fd);
        await apiClient.put(`/community/groups/${group.id}`, { banner_url: result.url });
      }

      qc.invalidateQueries({ queryKey: ['groups', group.id] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Groupe mis à jour');
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteGroup.mutateAsync(group.id);
    setDeleteOpen(false);
    onOpenChange(false);
    router.push('/community');
  }

  const isOwner = group.membership_status === 'owner';

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le groupe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les publications, messages et données du groupe seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Paramètres du groupe</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Banner */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Photo de couverture</label>
              <div className="relative h-32 rounded-xl overflow-hidden bg-muted cursor-pointer group" onClick={() => bannerRef.current?.click()}>
                {(bannerPreview || group.banner) && (
                  <Image src={bannerPreview || group.banner!} alt="" fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); }
              }} />
            </div>

            {/* Avatar */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Photo de profil</label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-muted cursor-pointer group flex-shrink-0" onClick={() => avatarRef.current?.click()}>
                  {(avatarPreview || group.avatar) ? (
                    <Image src={avatarPreview || group.avatar!} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-2xl">
                    <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }} />
                <div className="text-xs text-muted-foreground">Formats: JPG, PNG, WebP</div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Nom du groupe</label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>

            {/* Type & Sector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Type</label>
                <Select value={type} onValueChange={v => setType(v as Group['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Secteur</label>
                <Select value={sector} onValueChange={v => setSector(v as Group['sector'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Approval & Max Members */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Approbation requise</label>
                <Select value={requiresApproval ? 'yes' : 'no'} onValueChange={v => setRequiresApproval(v === 'yes')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Libre</SelectItem>
                    <SelectItem value="yes">Approbation requise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Max membres</label>
                <Input type="number" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} min={1} />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Tags (séparés par des virgules)</label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="agriculture, élevage, conseil" />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            {/* Rules */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Règles du groupe</label>
              <Textarea value={rules} onChange={e => setRules(e.target.value)} rows={3} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isOwner && (
                <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button className="flex-1 bg-[#064E3B] hover:bg-[#065f46]" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
