'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateProfile } from '@/hooks/use-auth';
import { CountrySelector } from '@/components/shared/country-selector';

interface ProfileFormValues {
  full_name: string;
  phone_number: string;
  organization: string;
  country: string;
  bio: string;
}

export function ProfileForm() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: user?.name || '',
      phone_number: user?.phone || '',
      organization: user?.organisation || '',
      country: user?.country || 'SN',
      bio: user?.bio || '',
    },
  });

  const onSubmit = (data: ProfileFormValues) => updateProfile.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm font-medium block mb-1.5">Nom complet</label>
        <Input {...register('full_name')} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Email</label>
        <Input value={user?.email || ''} disabled />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Téléphone</label>
        <Input {...register('phone_number')} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Organisation</label>
        <Input {...register('organization')} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Pays</label>
        <CountrySelector
          value={user?.country}
          onChange={() => {}}
        />
        <input type="hidden" {...register('country')} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Bio</label>
        <Textarea {...register('bio')} rows={4} />
      </div>
      <Button type="submit" loading={updateProfile.isPending}>Enregistrer</Button>
    </form>
  );
}
