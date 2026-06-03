'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Shield, Lock, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface UserManagementModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagementModal({ user, isOpen, onClose }: UserManagementModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gérer l'utilisateur</DialogTitle>
          <DialogDescription>Visualisez et modifiez les détails de l'utilisateur</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{user.is_active ? 'Actif' : 'Inactif'}</Badge>
                <Badge variant="outline">{user.email_verified ? 'Email vérifié' : 'Email non vérifié'}</Badge>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input value={user.email} disabled className="text-sm" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(user.email)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Téléphone</label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input value={user.phone || 'Non fourni'} disabled className="text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Pays</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input value={user.country || 'Non fourni'} disabled className="text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Créé le</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input 
                  value={new Date(user.created_at).toLocaleDateString('fr-FR')} 
                  disabled 
                  className="text-sm" 
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Authentification 2FA</span>
                <Badge variant={user.two_factor_enabled ? 'success' : 'secondary'}>
                  {user.two_factor_enabled ? 'Activé' : 'Désactivé'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Dernier changement de mot de passe</span>
                <span className="text-xs text-muted-foreground">
                  {user.password_changed_at ? new Date(user.password_changed_at).toLocaleDateString('fr-FR') : 'Jamais'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dernière connexion</span>
                <span className="text-xs text-muted-foreground">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR') : 'Jamais'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Lock className="h-4 w-4 mr-2" />
              Réinitialiser le mot de passe
            </Button>
            <Button variant="outline" className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Forcer la vérification
            </Button>
            <Button variant="destructive" className="flex-1">
              Supprimer l'utilisateur
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
