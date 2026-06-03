'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Shield, AlertCircle, Check, Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsSecurityPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setIsSaving(true);
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handle2FAToggle = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIs2FAEnabled(!is2FAEnabled);
      toast.success(
        !is2FAEnabled
          ? 'Authentification 2FA activée'
          : 'Authentification 2FA désactivée'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sécurité</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre mot de passe et les paramètres de sécurité de votre compte
        </p>
      </div>

      {/* Security Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100">Votre compte est sécurisé</h3>
            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
              Votre mot de passe est fort et à jour. Envisagez d'activer l'authentification 2FA pour une sécurité renforcée.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Modifier le mot de passe</h3>
        </div>

        {!isChangingPassword ? (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Mot de passe</p>
              <p className="text-xs text-muted-foreground mt-1">
                Dernière modification il y a 2 mois
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Modifier
            </Button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Mot de passe actuel</label>
              <Input
                type="password"
                placeholder="Entrez votre mot de passe actuel"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Nouveau mot de passe</label>
              <Input
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum 8 caractères, avec majuscules, minuscules et chiffres
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Confirmer le mot de passe</label>
              <Input
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                loading={isSaving}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold">Authentification à deux facteurs (2FA)</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Sécurisez votre compte avec une couche de protection supplémentaire
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {is2FAEnabled ? '✓ 2FA est activé' : 'Activer la 2FA'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {is2FAEnabled
                  ? 'Vous recevrez un code par SMS ou email à chaque connexion'
                  : 'Activez la 2FA pour une sécurité supplémentaire'}
              </p>
            </div>
            <Button
              onClick={handle2FAToggle}
              loading={isSaving}
              variant={is2FAEnabled ? 'destructive' : 'default'}
            >
              {is2FAEnabled ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        </div>

        {is2FAEnabled && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Méthode :</strong> Code à usage unique par SMS
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Sessions actives</h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Chrome on Windows</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dernière activité: à l'instant
                </p>
                <p className="text-xs text-muted-foreground">
                  IP: 192.168.1.1
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Actif
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Safari on iPhone</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dernière activité: il y a 2 heures
                </p>
                <p className="text-xs text-muted-foreground">
                  IP: 203.0.113.42
                </p>
              </div>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full" size="sm">
          Se déconnecter de toutes les autres sessions
        </Button>
      </div>

      {/* Login Activity */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Activité de connexion</h3>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium">Connexion réussie</p>
            <p className="text-xs text-muted-foreground">Chrome on Windows • il y a quelques secondes</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium">Connexion réussie</p>
            <p className="text-xs text-muted-foreground">Safari on iPhone • il y a 2 heures</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium">Connexion réussie</p>
            <p className="text-xs text-muted-foreground">Chrome on Windows • il y a 1 jour</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
        <h3 className="text-base font-semibold text-red-900 dark:text-red-100">Zone de danger</h3>
        
        <div className="p-4 bg-white dark:bg-background rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-100 mb-4">
            Une fois votre compte supprimé, il ne peut pas être récupéré. Tous vos données seront définitivement supprimées.
          </p>
          <Button variant="destructive" size="sm">
            Supprimer mon compte
          </Button>
        </div>
      </div>
    </div>
  );
}
