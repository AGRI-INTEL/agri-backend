'use client';

import { PreferencesForm } from '@/components/settings/preferences-form';

export default function SettingsPreferencesPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Préférences</h2>
      <PreferencesForm />
    </div>
  );
}
