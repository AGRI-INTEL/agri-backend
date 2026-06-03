'use client';

import { PreferencesForm } from '@/components/settings/preferences-form';
import { Info, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Préférences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personnalisez votre expérience et gérez vos notifications
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-300">
          <p className="font-medium mb-1">Personnalisez votre expérience :</p>
          <p>Ajustez vos préférences de notifications, de langue et d'apparence pour une meilleure expérience utilisateur.</p>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <PreferencesForm />
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Questions fréquentes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <h4 className="font-medium text-sm mb-2">Puis-je modifier mes notifications à tout moment ?</h4>
            <p className="text-xs text-muted-foreground">
              Oui, vous pouvez modifier vos préférences de notification à tout moment. Les modifications sont appliquées immédiatement.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border">
            <h4 className="font-medium text-sm mb-2">Comment désactiver toutes les notifications ?</h4>
            <p className="text-xs text-muted-foreground">
              Allez à la section "Notifications" et désactivez tous les commutateurs. Vous recevrez des alertes système critiques uniquement.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border">
            <h4 className="font-medium text-sm mb-2">Quel est l'impact du fuseau horaire ?</h4>
            <p className="text-xs text-muted-foreground">
              Le fuseau horaire est utilisé pour afficher les heures locales et pour planifier les notifications récapitulatives.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border">
            <h4 className="font-medium text-sm mb-2">Ma profil peut-il être privé ?</h4>
            <p className="text-xs text-muted-foreground">
              Oui, activez l'option "Profil public" dans la section Confidentialité pour contrôler la visibilité de votre profil.
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide supplémentaire ?{' '}
            <Link href="/help" className="text-primary hover:underline font-medium">
              Visitez notre centre d'aide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
