'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Save } from 'lucide-react';
import {
  getRoleLabel, ROLE_COLORS, ROLE_ICONS, ROLE_PERMISSIONS,
  type UserRole, type Permission
} from '@/types/auth';
import { useAdminUpdateUser, useAdminUpdateUserPermissions } from '@/hooks/use-admin';
import type { User } from '@/types/auth';

const PERMISSION_GROUPS: Record<string, Permission[]> = {
  'Utilisateurs': ['users:read', 'users:write', 'users:delete'],
  'Acteurs': ['actors:read', 'actors:write', 'actors:delete', 'actors:verify'],
  'Prédictions': ['predictions:read', 'predictions:write', 'predictions:admin'],
  'Alertes': ['alerts:read', 'alerts:write', 'alerts:admin'],
  'Marchés': ['markets:read', 'markets:write'],
  'Cartes': ['maps:read', 'maps:write'],
  'Fichiers': ['files:read', 'files:write', 'files:delete'],
  'Publications': ['posts:read', 'posts:write', 'posts:moderate'],
  'Commentaires': ['comments:read', 'comments:write', 'comments:moderate'],
  'Analytics': ['analytics:read', 'analytics:admin'],
  'Paramètres': ['settings:read', 'settings:write'],
  'Facturation': ['billing:read', 'billing:write'],
  'API': ['api:read', 'api:write', 'api:admin'],
};

const ROLES_AVAILABLE: UserRole[] = [
  'super_admin', 'admin', 'moderator', 'analyst', 'data_scientist',
  'producteur', 'eleveur', 'pecheur', 'forestier', 'cooperative',
  'groupement', 'transformateur', 'commercant', 'exportateur',
  'fournisseur_intrants', 'veterinaire', 'agronome', 'technicien',
  'chercheur', 'ong', 'institution', 'financier', 'assureur',
  'transporteur', 'stockeur', 'semencier', 'irrigant', 'mecanisateur',
  'certifieur', 'auditeur', 'consultant', 'formateur', 'journaliste',
  'fonctionnaire', 'elu', 'viewer', 'autre',
];

interface RolePermissionsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RolePermissionsModal({ user, isOpen, onClose }: RolePermissionsModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'viewer');
  const [customPermissions, setCustomPermissions] = useState<Permission[]>(
    user?.permissions || []
  );

  const updateUser = useAdminUpdateUser();
  const updatePermissions = useAdminUpdateUserPermissions();

  // Sync state when user changes
  if (user && selectedRole !== user.role && !updateUser.isPending) {
    // only on first open
  }

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    // Auto-set permissions from role
    const rolePerms = ROLE_PERMISSIONS.find((r) => r.role === role)?.permissions || [];
    setCustomPermissions(rolePerms);
  };

  const togglePermission = (perm: Permission) => {
    setCustomPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    await updateUser.mutateAsync({
      userId: user.id,
      data: { role: selectedRole },
    });
    await updatePermissions.mutateAsync({
      userId: user.id,
      permissions: customPermissions,
    });
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rôles & Permissions — {user.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Rôle</label>
            <Select value={selectedRole} onValueChange={(v) => handleRoleChange(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {ROLES_AVAILABLE.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="flex items-center gap-2">
                      <span>{ROLE_ICONS[role]}</span>
                      <span style={{ color: ROLE_COLORS[role] }}>{getRoleLabel(role)}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {ROLE_PERMISSIONS.find((r) => r.role === selectedRole)?.description}
            </p>
          </div>

          {/* Permissions by group */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Permissions personnalisées</label>
              <Badge variant="secondary">{customPermissions.length} sélectionnées</Badge>
            </div>

            <div className="space-y-4">
              {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                const allChecked = perms.every((p) => customPermissions.includes(p));

                return (
                  <div key={group} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{group}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => {
                          if (allChecked) {
                            setCustomPermissions((prev) =>
                              prev.filter((p) => !perms.includes(p))
                            );
                          } else {
                            setCustomPermissions((prev) => [
                              ...new Set([...prev, ...perms]),
                            ]);
                          }
                        }}
                      >
                        {allChecked ? 'Décocher tout' : 'Cocher tout'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={customPermissions.includes(perm)}
                            onCheckedChange={() => togglePermission(perm)}
                          />
                          <span className="text-xs font-mono">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending || updatePermissions.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateUser.isPending || updatePermissions.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
