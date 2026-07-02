'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Camera, Save, Loader2, Trash2, Archive, MessageSquareOff, UserMinus, Crown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  useDeleteGroup, useUpdateGroupSettings, useToggleMessaging,
  useArchiveGroup, useTransferOwnership, useGroupMembers,
} from '@/hooks/use-community';
import type { Group, GroupSettings } from '@/types/community';

interface GroupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

type SettingsTab = 'general' | 'permissions' | 'moderation' | 'danger';

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

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'Général' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'moderation', label: 'Modération' },
  { id: 'danger', label: 'Zone dangereuse' },
];

export function GroupSettingsDialog({ open, onOpenChange, group }: GroupSettingsDialogProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>('general');

  const deleteGroup = useDeleteGroup();
  const updateSettings = useUpdateGroupSettings();
  const toggleMessaging = useToggleMessaging();
  const archiveGroup = useArchiveGroup();
  const transferOwnership = useTransferOwnership();
  const { data: members } = useGroupMembers(group.id);

  // General settings state
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
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Permission settings
  const [settings, setSettings] = useState<GroupSettings>(
    group.settings ?? {
      messaging_blocked: false,
      members_can_post: true,
      members_can_comment: true,
      members_can_invite: true,
      members_can_upload: true,
      hidden_members: false,
      is_archived: false,
      mute_notifications: false,
    }
  );

  // Transfer ownership state
  const [transferUserId, setTransferUserId] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOwner = group.membership_status === 'owner' || group.user_role === 'owner';

  async function handleSaveGeneral() {
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
      setAvatarFile(null);
      setBannerFile(null);
      setAvatarPreview(null);
      setBannerPreview(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePermissions() {
    await updateSettings.mutateAsync({ groupId: group.id, settings: settings as unknown as Record<string, boolean> });
  }

  function handleToggle(key: keyof GroupSettings) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleDelete() {
    await deleteGroup.mutateAsync(group.id);
    setDeleteOpen(false);
    onOpenChange(false);
    router.push('/community');
  }

  async function handleTransferOwnership() {
    if (!transferUserId) return;
    await transferOwnership.mutateAsync({ groupId: group.id, userId: transferUserId });
    setShowTransferConfirm(false);
    setTransferUserId('');
    onOpenChange(false);
  }

  return (
    <>
      {/* Delete confirmation */}
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

      {/* Transfer ownership confirmation */}
      <AlertDialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transférer la propriété ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous ne serez plus le propriétaire du groupe. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTransferConfirm(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-[#D97706] hover:bg-[#B45309]" onClick={handleTransferOwnership}>
              Transférer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Paramètres du groupe</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border -mx-6 px-6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-[#D97706] text-[#D97706]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-5">

            {/* ── TAB: General ── */}
            {tab === 'general' && (
              <>
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

                {/* Save button */}
                <Button className="w-full bg-[#064E3B] hover:bg-[#065f46]" onClick={handleSaveGeneral} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer les modifications
                </Button>
              </>
            )}

            {/* ── TAB: Permissions ── */}
            {tab === 'permissions' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <h3 className="text-sm font-bold">Permissions des membres</h3>
                  <p className="text-xs text-muted-foreground">Ces paramètres s'appliquent à tous les membres (sauf admins et propriétaire).</p>

                  <div className="space-y-4">
                    <SettingRow
                      icon={MessageSquareOff}
                      label="Bloquer la messagerie"
                      description="Empêche les membres d'envoyer des messages dans le chat"
                      checked={settings.messaging_blocked}
                      onToggle={() => handleToggle('messaging_blocked')}
                    />
                    <SettingRow
                      icon={Save}
                      label="Publications autorisées"
                      description="Permettre aux membres de créer des publications"
                      checked={settings.members_can_post}
                      onToggle={() => handleToggle('members_can_post')}
                    />
                    <SettingRow
                      icon={Save}
                      label="Commentaires autorisés"
                      description="Permettre aux membres de commenter les publications"
                      checked={settings.members_can_comment}
                      onToggle={() => handleToggle('members_can_comment')}
                    />
                    <SettingRow
                      icon={UserMinus}
                      label="Invitations autorisées"
                      description="Permettre aux membres d'inviter d'autres personnes"
                      checked={settings.members_can_invite}
                      onToggle={() => handleToggle('members_can_invite')}
                    />
                    <SettingRow
                      icon={Save}
                      label="Upload de fichiers"
                      description="Permettre aux membres d'uploader des fichiers"
                      checked={settings.members_can_upload}
                      onToggle={() => handleToggle('members_can_upload')}
                    />
                    <SettingRow
                      icon={Save}
                      label="Masquer la liste des membres"
                      description="Seuls les admins peuvent voir qui sont les membres"
                      checked={settings.hidden_members}
                      onToggle={() => handleToggle('hidden_members')}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-[#064E3B] hover:bg-[#065f46]"
                  onClick={handleSavePermissions}
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer les permissions
                </Button>
              </div>
            )}

            {/* ── TAB: Moderation ── */}
            {tab === 'moderation' && (
              <div className="space-y-4">
                {/* Toggle messaging quick action */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Messagerie</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {settings.messaging_blocked ? 'La messagerie est actuellement désactivée' : 'La messagerie est active'}
                      </p>
                    </div>
                    <Button
                      variant={settings.messaging_blocked ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleMessaging.mutate(group.id)}
                      disabled={toggleMessaging.isPending}
                      className={settings.messaging_blocked ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {settings.messaging_blocked ? 'Réactiver' : 'Désactiver'}
                    </Button>
                  </div>
                </div>

                {/* Archive */}
                {isOwner && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Archivage</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {settings.is_archived ? 'Le groupe est archivé et en lecture seule' : 'Le groupe est actif'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveGroup.mutate(group.id)}
                        disabled={archiveGroup.isPending}
                        className="gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        {settings.is_archived ? 'Désarchiver' : 'Archiver'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Danger Zone ── */}
            {tab === 'danger' && (
              <div className="space-y-4">
                {/* Transfer ownership */}
                {isOwner && (
                  <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Crown className="h-5 w-5 text-[#D97706] mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Transférer la propriété</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Transférez la propriété du groupe à un autre membre. Vous deviendrez administrateur.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={transferUserId}
                        onChange={e => setTransferUserId(e.target.value)}
                        className="flex-1 h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="">Sélectionner un membre…</option>
                        {(members || [])
                          .filter(m => m.role !== 'owner' && m.user_id !== group.created_by)
                          .map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                      </select>
                      <Button
                        variant="outline"
                        className="border-[#D97706] text-[#D97706] hover:bg-amber-50 dark:hover:bg-amber-950/20 gap-2"
                        disabled={!transferUserId}
                        onClick={() => setShowTransferConfirm(true)}
                      >
                        <Crown className="h-4 w-4" /> Transférer
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delete group */}
                {isOwner && (
                  <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Supprimer le groupe</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Cette action est irréversible. Toutes les publications, messages et données seront définitivement supprimés.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" /> Supprimer définitivement
                    </Button>
                  </div>
                )}
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <Label className="text-sm font-semibold cursor-pointer">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
