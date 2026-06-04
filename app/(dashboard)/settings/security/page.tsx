'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Lock, Shield, AlertCircle, Check, Clock, LogOut,
  Smartphone, Globe, Monitor, AlertTriangle, KeyRound,
  Trash2, RefreshCw, Eye, EyeOff, CheckCircle, XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import {
  useChangePassword,
  useGet2FAStatus,
  useEnable2FA,
  useDisable2FA,
  useActiveSessions,
  useRevokeSession,
  useRevokeAllOtherSessions,
  useLoginActivity,
  useDeleteAccount,
} from '@/hooks/use-settings';
import { clearAuthSession } from '@/lib/auth-session';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Password form ──────────────────────────────────────────────────────────

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères min.', ok: password.length >= 8 },
    { label: 'Majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Minuscule', ok: /[a-z]/.test(password) },
    { label: 'Chiffre', ok: /[0-9]/.test(password) },
    { label: 'Caractère spécial', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i < score ? colors[score - 1] : 'bg-muted')}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span key={c.label} className={cn('text-xs flex items-center gap-1', c.ok ? 'text-green-600' : 'text-muted-foreground')}>
            {c.ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const changePassword = useChangePassword();
  const { user } = useAuthStore();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PasswordFormValues>();
  const newPassword = watch('new_password', '');

  const onSubmit = async (data: PasswordFormValues) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    await changePassword.mutateAsync({
      current_password: data.current_password,
      new_password: data.new_password,
    });
    reset();
    setOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Mot de passe</h3>
      </div>

      {!open ? (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Mot de passe actuel</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.last_password_change
                ? `Modifié le ${new Date(user.last_password_change).toLocaleDateString('fr-FR')}`
                : 'Jamais modifié'}
            </p>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Mot de passe actuel</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('current_password', { required: 'Requis' })}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-muted-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 8 caractères"
                {...register('new_password', {
                  required: 'Requis',
                  minLength: { value: 8, message: 'Minimum 8 caractères' },
                })}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-muted-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthBar password={newPassword} />
            {errors.new_password && <p className="text-xs text-red-500 mt-1">{errors.new_password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Confirmer le nouveau mot de passe</label>
            <Input
              type="password"
              placeholder="Répétez le nouveau mot de passe"
              {...register('confirm_password', { required: 'Requis' })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={changePassword.isPending} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {changePassword.isPending ? 'Modification...' : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── 2FA Section ────────────────────────────────────────────────────────────

function TwoFactorSection() {
  const { data: twoFAStatus, isLoading } = useGet2FAStatus();
  const enable2FA = useEnable2FA();
  const disable2FA = useDisable2FA();
  const [method, setMethod] = useState<'sms' | 'email' | 'app'>('sms');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const isEnabled = twoFAStatus?.enabled || false;

  const handleEnable = async () => {
    const result = await enable2FA.mutateAsync(method);
    if (result?.backup_codes) {
      setBackupCodes(result.backup_codes);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword.trim()) {
      toast.error('Veuillez entrer votre mot de passe');
      return;
    }
    await disable2FA.mutateAsync(disablePassword);
    setDisablePassword('');
    setShowDisableForm(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Authentification à deux facteurs (2FA)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <Badge variant="outline" className={cn(
            isEnabled
              ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20'
              : 'border-red-400 text-red-500 bg-red-50 dark:bg-red-950/20'
          )}>
            {isEnabled ? <><CheckCircle className="h-3 w-3 mr-1" />Activé</> : <><XCircle className="h-3 w-3 mr-1" />Désactivé</>}
          </Badge>
        )}
      </div>

      {!isEnabled ? (
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <label className="text-sm font-medium block mb-2">Méthode</label>
            <div className="flex gap-2 flex-wrap">
              {(['sms', 'email', 'app'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                    method === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {m === 'sms' ? '📱 SMS' : m === 'email' ? '📧 Email' : '🔐 App d\'auth'}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleEnable} disabled={enable2FA.isPending} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {enable2FA.isPending ? 'Activation...' : 'Activer la 2FA'}
          </Button>
          {backupCodes.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Codes de secours — notez-les maintenant
              </p>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map((code) => (
                  <code key={code} className="text-xs bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded font-mono">{code}</code>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200">
            <strong>Méthode active :</strong> {twoFAStatus?.method === 'sms' ? 'SMS' : twoFAStatus?.method === 'email' ? 'Email' : 'App d\'authentification'}
          </div>
          {!showDisableForm ? (
            <Button variant="outline" className="border-red-400 text-red-500 hover:bg-red-50" onClick={() => setShowDisableForm(true)}>
              Désactiver la 2FA
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirmez votre mot de passe pour désactiver"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDisable} disabled={disable2FA.isPending}>
                  {disable2FA.isPending ? 'Désactivation...' : 'Confirmer la désactivation'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowDisableForm(false); setDisablePassword(''); }}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Active Sessions ─────────────────────────────────────────────────────────

function DeviceIcon({ type }: { type: string }) {
  if (type?.includes('mobile') || type?.includes('phone')) return <Smartphone className="h-5 w-5" />;
  if (type?.includes('tablet')) return <Monitor className="h-5 w-5" />;
  return <Globe className="h-5 w-5" />;
}

function SessionsSection() {
  const { data: sessions, isLoading, refetch } = useActiveSessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllOtherSessions();

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60_000) return "À l'instant";
    if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)}h`;
    return new Date(d).toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Sessions actives</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : !sessions?.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">Aucune session active trouvée</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className={cn(
              'p-4 rounded-lg border',
              s.is_current
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-muted'
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg">
                    <DeviceIcon type={s.device_type} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{s.device_name || `${s.browser} on ${s.os}`}</p>
                      {s.is_current && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Session actuelle</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.ip} {s.location ? `· ${s.location}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dernière activité: {formatDate(s.last_active)}
                    </p>
                  </div>
                </div>
                {!s.is_current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Révoquer cette session ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          L'appareil {s.device_name || s.browser} sera déconnecté.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeSession.mutate(s.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Révoquer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(sessions?.filter((s) => !s.is_current).length ?? 0) > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter de toutes les autres sessions
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Révoquer toutes les autres sessions ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous resterez connecté uniquement sur cet appareil.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => revokeAll.mutate()}
                className="bg-red-600 hover:bg-red-700"
              >
                Révoquer tout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// ── Login Activity ──────────────────────────────────────────────────────────

function LoginActivitySection() {
  const { data, isLoading, refetch } = useLoginActivity({ page: 1, limit: 10 });
  const activities = data?.data || [];

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60_000) return "À l'instant";
    if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)}h`;
    return new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Journal de connexion</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Aucune activité enregistrée</p>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <div key={a.id} className={cn(
              'p-3 rounded-lg border text-sm flex items-center justify-between',
              a.type === 'success' ? 'bg-muted border-border' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            )}>
              <div>
                <div className="flex items-center gap-2">
                  {a.type === 'success'
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                  <span className="font-medium">{a.type === 'success' ? 'Connexion réussie' : 'Tentative échouée'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {a.device_name || a.device_type} · {a.ip} {a.location ? `· ${a.location}` : ''}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(a.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Delete Account ──────────────────────────────────────────────────────────

function DangerZone() {
  const [password, setPassword] = useState('');
  const deleteAccount = useDeleteAccount();
  const qc = useQueryClient();
  const router = useRouter();

  const handleDelete = async () => {
    if (!password.trim()) {
      toast.error('Entrez votre mot de passe pour confirmer');
      return;
    }
    await deleteAccount.mutateAsync(password);
    clearAuthSession();
    qc.clear();
    router.push('/login');
  };

  return (
    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="text-base font-semibold text-red-900 dark:text-red-100">Zone de danger</h3>
      </div>

      <div className="p-4 bg-white dark:bg-background rounded-lg border border-red-200 dark:border-red-800 space-y-3">
        <p className="text-sm text-red-800 dark:text-red-200">
          La suppression de votre compte est permanente et irréversible. Toutes vos données seront définitivement effacées.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Entrez votre mot de passe pour confirmer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Input
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPassword('')}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteAccount.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteAccount.isPending ? 'Suppression...' : 'Supprimer définitivement'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function SettingsSecurityPage() {
  const { user } = useAuthStore();

  const securityScore = [
    user?.email_verified,
    user?.phone_verified,
    user?.two_factor_enabled,
    (user?.login_count ?? 0) > 0,
    user?.is_verified,
  ].filter(Boolean).length;

  const scoreColors = ['text-red-600', 'text-red-500', 'text-orange-500', 'text-blue-500', 'text-green-600'];
  const scoreLabels = ['Critique', 'Faible', 'Moyen', 'Bien', 'Excellent'];
  const scoreBarColors = ['bg-red-500', 'bg-red-400', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sécurité</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Protégez votre compte avec un mot de passe fort et l'authentification 2FA
        </p>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Score de sécurité</h3>
              <p className={cn('text-sm font-medium', scoreColors[securityScore] || scoreColors[0])}>
                {scoreLabels[securityScore] || scoreLabels[0]}
              </p>
            </div>
          </div>
          <span className={cn('text-2xl font-bold', scoreColors[securityScore] || scoreColors[0])}>
            {securityScore * 20}%
          </span>
        </div>
        <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', scoreBarColors[securityScore] || scoreBarColors[0])}
            style={{ width: `${securityScore * 20}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { label: 'Email vérifié', ok: user?.email_verified },
            { label: 'Téléphone vérifié', ok: user?.phone_verified },
            { label: '2FA activée', ok: user?.two_factor_enabled },
            { label: 'Compte actif', ok: user?.is_active },
            { label: 'Compte vérifié', ok: user?.is_verified },
          ].map((c) => (
            <div key={c.label} className={cn(
              'flex items-center gap-1.5 text-xs',
              c.ok ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
            )}>
              {c.ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {c.label}
            </div>
          ))}
        </div>
      </div>

      <PasswordSection />
      <TwoFactorSection />
      <SessionsSection />
      <LoginActivitySection />
      <DangerZone />
    </div>
  );
}
