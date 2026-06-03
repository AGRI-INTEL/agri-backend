'use client';

import { ProfileForm } from '@/components/settings/profile-form';
import { AlertCircle, Info } from 'lucide-react';

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mon profil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez vos informations personnelles et professionnelles
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-300">
          <p className="font-medium mb-1">Conseil :</p>
          <p>Une photo de profil attrayante et une bio complète augmentent votre visibilité sur la plateforme.</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <ProfileForm />
      </div>

      {/* Data Privacy Notice */}
      <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-300">
          <p className="font-medium mb-1">Sécurité des données :</p>
          <p>Vos informations personnelles sont chiffrées et ne sont jamais partagées sans votre consentement.</p>
        </div>
      </div>
    </div>
  );
}
