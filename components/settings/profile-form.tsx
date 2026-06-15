'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateProfile } from '@/hooks/use-auth';
import { CountrySelector } from '@/components/shared/country-selector';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';
import { Camera, Upload, Check, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileFormValues {
  full_name: string;
  phone_number: string;
  organization: string;
  country: string;
  bio: string;
  job_title?: string;
  department?: string;
  gender?: string;
}

export function ProfileForm() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const { register, handleSubmit, setValue } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: user?.name || '',
      phone_number: user?.phone || '',
      organization: user?.organisation || '',
      country: user?.country || 'SN',
      bio: user?.bio || '',
      job_title: user?.job_title || '',
      department: user?.department || '',
      gender: user?.gender || '',
    },
  });

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Preview local immédiatement
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    // Upload réel
    try {
      setIsUploadingAvatar(true);
      const fd = new FormData();
      fd.append('avatar', file);
      await apiClient.upload('/auth/avatar', fd);
      toast.success('Photo de profil mise à jour');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Erreur lors de l'upload de la photo");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setCoverPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    try {
      setIsUploadingCover(true);
      const fd = new FormData();
      fd.append('cover', file);
      await apiClient.upload('/auth/cover', fd);
      toast.success('Photo de couverture mise à jour');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Erreur lors de l'upload de la couverture");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({
      full_name: data.full_name,
      phone_number: data.phone_number,
      organization: data.organization,
      country: data.country,
      bio: data.bio,
      job_title: data.job_title,
      department: data.department,
      gender: data.gender,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Section Photo de Couverture */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Photo de couverture</h3>
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden group cursor-pointer">
          {(coverPreview || user?.cover_image) && (
            <Image
              src={coverPreview ?? user?.cover_image ?? ''}
              alt="Couverture"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-white" />
              <span className="text-sm text-white font-medium">Modifier</span>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverSelect}
            disabled={isUploadingCover}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Recommandé: 1200x400px, max 10MB
        </p>
      </div>

      {/* Section Photo de Profil */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Photo de profil</h3>
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32 flex-shrink-0">
            <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center border-4 border-background">
              {(avatarPreview || user?.avatar) ? (
                <Image
                  src={avatarPreview ?? user?.avatar ?? ''}
                  alt="Profil"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl font-bold text-slate-400">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <div className="animate-spin h-5 w-5" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              disabled={isUploadingAvatar}
              className="hidden"
            />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-muted-foreground">
              Téléchargez une photo carrée pour un meilleur rendu
            </p>
            <p className="text-xs text-muted-foreground">
              Formats acceptés: JPG, PNG, WebP
            </p>
            <p className="text-xs text-muted-foreground">
              Taille max: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Informations Personnelles */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Informations personnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nom complet *</label>
            <Input {...register('full_name')} placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <div className="relative">
              <Input value={user?.email || ''} disabled className="bg-muted pr-20" />
              <Badge
                variant="outline"
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 text-[10px] py-0 px-1.5 pointer-events-none',
                  user?.email_verified
                    ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20'
                    : 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                )}
              >
                {user?.email_verified
                  ? <><CheckCircle className="h-2.5 w-2.5 mr-0.5" />Vérifié</>
                  : <><AlertCircle className="h-2.5 w-2.5 mr-0.5" />Non vérifié</>}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Téléphone</label>
            <Input
              {...register('phone_number')}
              type="tel"
              placeholder="+221 77 123 45 67"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Sexe</label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">Sélectionner</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre</option>
              <option value="prefere_pas_dire">Je préfère ne pas dire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Informations Professionnelles */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Informations professionnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Poste</label>
            <Input
              {...register('job_title')}
              placeholder="ex: Ingénieur Agricole"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Département</label>
            <Input
              {...register('department')}
              placeholder="ex: Recherche & Développement"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Organisation</label>
          <Input
            {...register('organization')}
            placeholder="Nom de votre entreprise ou organisation"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Pays</label>
          <CountrySelector
            value={user?.country}
            onChange={(country) => setValue('country', country)}
          />
          <input type="hidden" {...register('country')} />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">À propos de vous</h3>
        <div>
          <label className="text-sm font-medium block mb-1.5">Bio</label>
          <Textarea
            {...register('bio')}
            placeholder="Parlez-nous de vous, vos expériences, vos passions..."
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Jusqu'à 500 caractères</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          loading={updateProfile.isPending}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Enregistrer les modifications
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setAvatarPreview(null);
            setCoverPreview(null);
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
