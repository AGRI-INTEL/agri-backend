'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateGroup } from '@/hooks/use-community';
import { apiClient } from '@/lib/api-client';
import type { GroupType, GroupSector } from '@/types/community';
import { toast } from 'sonner';
import {
  Globe, Lock, Briefcase, Building2,
  Sprout, Beef, Fish, TreePine, LayoutGrid,
  ChevronRight, ChevronLeft, Check, Upload, X,
  Users, Tag, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const GROUP_TYPES: { value: GroupType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { value: 'public',       label: 'Public',         desc: 'Ouvert à tous',             icon: Globe,      color: 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  { value: 'private',      label: 'Privé',          desc: 'Sur invitation',             icon: Lock,       color: 'border-slate-400 text-slate-600 bg-slate-50 dark:bg-slate-800/30' },
  { value: 'professional', label: 'Professionnel',  desc: 'Réseau métier',              icon: Briefcase,  color: 'border-violet-400 text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
  { value: 'research',     label: 'Recherche',      desc: 'Études & expérimentation',   icon: Building2,  color: 'border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
];

const SECTORS: { value: GroupSector; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'general',      label: 'Général',     icon: LayoutGrid, color: '#4f46e5', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300' },
  { value: 'vegetal',      label: 'Végétal',     icon: Sprout,     color: '#16a34a', bg: 'bg-green-50 dark:bg-green-950/30 border-green-300' },
  { value: 'animal',       label: 'Élevage',     icon: Beef,       color: '#92400e', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300' },
  { value: 'halieutique',  label: 'Pêche',       icon: Fish,       color: '#1d4ed8', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-300' },
  { value: 'forestier',    label: 'Forestier',   icon: TreePine,   color: '#064E3B', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400' },
];

const STEPS = ['Informations', 'Paramètres', 'Visuels'];

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const router = useRouter();
  const create = useCreateGroup();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('public' as GroupType);
  const [sector, setSector] = useState<GroupSector>('general');
  const [tags, setTags] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  function pickFile(file: File, kind: 'avatar' | 'banner') {
    const url = URL.createObjectURL(file);
    if (kind === 'avatar') { setAvatar(file); setAvatarPreview(url); }
    else { setBanner(file); setBannerPreview(url); }
  }

  function resetDialog() {
    setStep(0); setName(''); setDescription(''); setType('public' as GroupType);
    setSector('general'); setTags(''); setRequiresApproval(false);
    setAvatar(null); setAvatarPreview(null); setBanner(null); setBannerPreview(null);
  }

  function handleClose(v: boolean) { if (!v) resetDialog(); onOpenChange(v); }

  function canNext() {
    if (step === 0) return name.trim().length >= 2;
    return true;
  }

  async function handleSubmit() {
    if (!name.trim()) return toast.error('Le nom du groupe est requis');
    setUploading(true);
    try {
      let avatar_url: string | undefined;
      let banner_url: string | undefined;
      if (avatar) {
        const fd = new FormData();
        fd.append('file', avatar);
        const r = await apiClient.upload<{ url: string }>('/files/upload', fd);
        avatar_url = r.url;
      }
      if (banner) {
        const fd = new FormData();
        fd.append('file', banner);
        const r = await apiClient.upload<{ url: string }>('/files/upload', fd);
        banner_url = r.url;
      }
      setUploading(false);
      await new Promise<void>((resolve, reject) => {
        create.mutate(
          { name, description, type, sector, requires_approval: requiresApproval,
            tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            avatar_url, banner_url },
          {
            onSuccess: (_data: Record<string, unknown>) => {
              resetDialog();
              onOpenChange(false);
              toast.success('Groupe créé avec succès !');
              router.push('/community');
              resolve();
            },
            onError: (err: Error) => {
              toast.error(err?.message || 'Erreur lors de la création du groupe');
              reject(err);
            },
          }
        );
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'opération");
    } finally {
      setUploading(false);
    }
  }

  const selectedType = GROUP_TYPES.find(t => t.value === type);
  const selectedSector = SECTORS.find(s => s.value === sector);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Créer un groupe</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    i < step ? 'bg-[#064E3B] text-white' :
                    i === step ? 'bg-[#D97706] text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-xs font-medium hidden sm:block',
                    i === step ? 'text-foreground' : 'text-muted-foreground'
                  )}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-px transition-colors', i < step ? 'bg-[#064E3B]' : 'bg-border')} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[300px]">

          {/* ── Step 0: Informations ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Nom du groupe <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex : Producteurs de maïs du Sénégal"
                  className="h-10"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">{name.length}/80 caractères</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Objectif du groupe, qui peut rejoindre, thèmes abordés..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Type de groupe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GROUP_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                        type === t.value ? t.color + ' border-current' : 'border-border hover:border-primary/30 bg-card'
                      )}
                    >
                      <t.icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Paramètres ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Secteur agricole
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SECTORS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSector(s.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all',
                        sector === s.value ? `border-current ${s.bg}` : 'border-border hover:border-primary/30'
                      )}
                      style={sector === s.value ? { color: s.color } : {}}
                    >
                      <s.icon className="h-5 w-5" />
                      <span className="text-[10px] font-semibold leading-tight text-center">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  <Tag className="h-3 w-3 inline mr-1" />
                  Tags (séparés par des virgules)
                </label>
                <Input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="maïs, coopérative, Sénégal..."
                />
                {tags.trim() && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                        {t}
                        <button type="button" onClick={() => setTags(tags.split(',').filter(x => x.trim() !== t).join(', '))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Confidentialité
                </label>
                <button
                  type="button"
                  onClick={() => setRequiresApproval(!requiresApproval)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                    requiresApproval ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' : 'border-border hover:border-primary/30'
                  )}
                >
                  {requiresApproval ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-semibold">
                      {requiresApproval ? 'Approbation requise' : 'Rejoindre librement'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {requiresApproval
                        ? 'Chaque demande d\'adhésion doit être approuvée'
                        : 'Les membres peuvent rejoindre sans validation'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Visuels ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Banner */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Bannière
                </label>
                <div
                  className="relative h-28 rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-[#064E3B]/15 to-[#065f46]/10 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group"
                  onClick={() => bannerRef.current?.click()}
                >
                  {bannerPreview
                    ? <Image src={bannerPreview} alt="" fill className="object-cover" unoptimized />
                    : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-xs text-muted-foreground">Cliquer pour ajouter une bannière</p>
                      </div>
                    )
                  }
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setBanner(null); setBannerPreview(null); }}
                      className="absolute top-2 right-2 h-7 w-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], 'banner')} />
              </div>

              {/* Avatar */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Avatar du groupe
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-primary/5 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden flex-shrink-0"
                    onClick={() => avatarRef.current?.click()}
                  >
                    {avatarPreview
                      ? <Image src={avatarPreview} alt="" fill className="object-cover" unoptimized />
                      : <Users className="h-8 w-8 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={() => avatarRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5 mr-2" />
                      Choisir une image
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG — 2 MB max</p>
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], 'avatar')} />
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Résumé</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{name}</span>
                    {selectedType && (
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', selectedType.color)}>
                        {selectedType.label}
                      </span>
                    )}
                  </div>
                  {selectedSector && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <selectedSector.icon className="h-3.5 w-3.5" style={{ color: selectedSector.color }} />
                      {selectedSector.label}
                    </div>
                  )}
                  {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={step === 0 ? () => handleClose(false) : () => setStep(s => s - 1)}
          >
            {step === 0 ? 'Annuler' : <><ChevronLeft className="h-4 w-4 mr-1" />Retour</>}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="gap-1.5 bg-[#064E3B] hover:bg-[#065f46]"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={create.isPending || uploading}
              className="gap-1.5 bg-[#D97706] hover:bg-[#b45309] text-white"
            >
              {uploading || create.isPending ? 'Création...' : <><Check className="h-4 w-4" />Créer le groupe</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGroupDialog;
