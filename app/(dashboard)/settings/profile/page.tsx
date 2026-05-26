'use client';

import { ProfileForm } from '@/components/settings/profile-form';

export default function SettingsProfilePage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Mon profil</h2>
      <ProfileForm />
    </div>
  );
}
