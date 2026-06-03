"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGroup } from '@/hooks/use-community';
import type { GroupType, GroupSector } from '@/types/community';
import { toast } from 'sonner';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('public');
  const [sector, setSector] = useState<GroupSector>('general');
  const [tags, setTags] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const create = useCreateGroup();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return toast.error('Le nom du groupe est requis');

    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('type', type);
    fd.append('sector', sector);
    if (tags.trim()) fd.append('tags', JSON.stringify(tags.split(',').map((t) => t.trim()).filter(Boolean)));
    if (avatar) fd.append('avatar', avatar);
    if (banner) fd.append('banner', banner);

    create.mutate(fd, {
      onSuccess: () => {
        toast.success('Groupe créé');
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Erreur lors de la création');
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un groupe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Nom</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as GroupType)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="prive">Privé</SelectItem>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                  <SelectItem value="institutionnel">Institutionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Secteur</label>
              <Select value={sector} onValueChange={(v) => setSector(v as GroupSector)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="vegetal">Végétal</SelectItem>
                  <SelectItem value="animal">Animal</SelectItem>
                  <SelectItem value="halieutique">Halieutique</SelectItem>
                  <SelectItem value="forestier">Forestier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Tags (séparés par des virgules)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Avatar</label>
              <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Bannière</label>
              <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Création...' : 'Créer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGroupDialog;
