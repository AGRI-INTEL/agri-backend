'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Mail, Phone, MapPin, Calendar, Shield, Lock, Unlock,
  Trash2, RotateCcw, CheckCircle, XCircle, Eye, KeyRound,
  UserCheck, UserX,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminDeleteUser,
  useAdminToggleUserActive,
  useAdminResetUserPassword,
  useAdminUpdateUser,
} from '@/hooks/use-admin';
import { getRoleLabel, ROLE_COLORS, ROLE_ICONS } from '@/types/auth';
import type { User } from '@/types/auth';

interface UserManagementModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: () => void;
  onManageRoles?: () => void;
}

export function UserManagementModal({
  user,
  isOpen,
  onClose,
  onViewProfile,
  onManageRoles,
}: UserManagementModalProps) {
  const deleteUser = useAdminDeleteUser();
  const toggleActive = useAdminToggleUserActive();
  const resetPassword = useAdminResetUserPassword();
  const updateUser = useAdminUpdateUser();

  if (!user) return null;

  const handleToggleActive = async () => {
    await toggleActive.mutateAsync({ userId: user.id, activate: !user.is_active });
    onClose();
  };

  const handleDelete = async () => {
    await deleteUser.mutateAsync(user.id);
    onClose();
  };

  const handleResetPassword = async () => {
    await resetPassword.mutateAsync(user.id);
  };

  const handleForceVerify = async () => {
    await updateUser.mutateAsync({
      userId: user.id,
      data: { is_verified: true },
    });
    toast.success('Compte marqué comme vérifié');
  };

  const isPending =
    deleteUser.isPending ||
    toggleActive.isPending ||
    resetPassword.isPending ||
    updateUser.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Gérer l'utilisateur</DialogTitle>
          <DialogDescription>Actions d'administration sur ce compte</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* User Header */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{user.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">{user.name}</h3>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: ROLE_COLORS[user.role] + '20',
                  borderColor: ROLE_COLORS[user.role],
                  color: ROLE_COLORS[user.role],
                }}
                className="mt-1"
              >
                {ROLE_ICONS[user.role]} {getRoleLabel(user.role)}
              </Badge>
            </div>
            <Badge variant={user.is_active ? 'outline' : 'secondary'} className={
              user.is_active
                ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20'
                : 'border-red-400 text-red-500 bg-red-50 dark:bg-red-950/20'
            }>
              {user.is_active ? (
                <><CheckCircle className="h-3 w-3 mr-1" />Actif</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" />Inactif</>
              )}
            </Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{user.phone || 'Non fourni'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{[user.city, user.country].filter(Boolean).join(', ') || 'Non fourni'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Inscrit: {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</p>

            {/* View profile & roles */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => { onClose(); onViewProfile?.(); }}
              >
                <Eye className="h-4 w-4" />
                Voir le profil
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => { onClose(); onManageRoles?.(); }}
              >
                <Shield className="h-4 w-4" />
                Rôles & Permissions
              </Button>
            </div>

            {/* Reset password */}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={handleResetPassword}
              disabled={isPending}
            >
              <KeyRound className="h-4 w-4" />
              Envoyer un lien de réinitialisation du mot de passe
            </Button>

            {/* Force verify */}
            {!user.is_verified && (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
                onClick={handleForceVerify}
                disabled={isPending}
              >
                <Shield className="h-4 w-4" />
                Forcer la vérification du compte
              </Button>
            )}

            {/* Activate / Deactivate */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full flex items-center gap-2 ${
                    user.is_active
                      ? 'border-orange-400 text-orange-600 hover:bg-orange-50'
                      : 'border-green-500 text-green-600 hover:bg-green-50'
                  }`}
                  disabled={isPending}
                >
                  {user.is_active ? (
                    <><UserX className="h-4 w-4" />Désactiver le compte</>
                  ) : (
                    <><UserCheck className="h-4 w-4" />Réactiver le compte</>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {user.is_active ? 'Désactiver ce compte ?' : 'Réactiver ce compte ?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.is_active
                      ? `Le compte de ${user.name} sera désactivé et il ne pourra plus se connecter.`
                      : `Le compte de ${user.name} sera réactivé et il pourra se reconnecter.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleToggleActive}
                    className={user.is_active ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {user.is_active ? 'Désactiver' : 'Réactiver'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full flex items-center gap-2"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer définitivement ce compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer {user.name} ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées définitivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
