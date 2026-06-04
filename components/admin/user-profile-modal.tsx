'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mail, Phone, MapPin, Calendar, Shield, Activity, Clock,
  User, Building, Globe, CheckCircle, XCircle, Star, Award
} from 'lucide-react';
import { getRoleLabel, ROLE_COLORS, ROLE_ICONS, getAccountStatusLabel, getAccountStatusColor } from '@/types/auth';
import type { User as UserType } from '@/types/auth';

interface UserProfileModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  if (!user) return null;

  const statusColor = getAccountStatusColor(user.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil de l'utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              {user.job_title && <p className="text-sm text-muted-foreground">{user.job_title}</p>}
              {user.organisation && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" /> {user.organisation}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  style={{
                    backgroundColor: ROLE_COLORS[user.role] + '20',
                    borderColor: ROLE_COLORS[user.role],
                    color: ROLE_COLORS[user.role],
                  }}
                  variant="outline"
                >
                  {ROLE_ICONS[user.role]} {getRoleLabel(user.role)}
                </Badge>
                <Badge
                  style={{
                    backgroundColor: statusColor + '20',
                    borderColor: statusColor,
                    color: statusColor,
                  }}
                  variant="outline"
                >
                  {getAccountStatusLabel(user.status)}
                </Badge>
                {user.email_verified && (
                  <Badge className="bg-green-50 dark:bg-green-950/20 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Email vérifié
                  </Badge>
                )}
                {user.two_factor_enabled && (
                  <Badge className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 border-blue-200">
                    <Shield className="h-3 w-3 mr-1" /> 2FA actif
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                  {user.email_verified ? (
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{user.phone}</span>
                    {user.phone_verified && (
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{[user.city, user.region, user.country_name || user.country].filter(Boolean).join(', ')}</span>
                </div>
                {user.timezone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{user.timezone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activité */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Activité</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {user.last_login_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Dernière connexion: {new Date(user.last_login_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{user.login_count} connexion{user.login_count !== 1 ? 's' : ''}</span>
                </div>
                {user.reputation_score !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>Score: {user.reputation_score} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Biographie</h3>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">{user.bio}</p>
            </div>
          )}

          {/* Permissions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Permissions ({user.permissions.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map((perm) => (
                <Badge key={perm} variant="secondary" className="text-xs">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                <Award className="h-4 w-4 inline mr-1" /> Badges ({user.badges.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border"
                    style={{ borderColor: badge.color + '60', backgroundColor: badge.color + '15' }}
                    title={badge.description}
                  >
                    <span>{badge.icon}</span>
                    <span style={{ color: badge.color }}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes admin */}
          {user.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Notes (admin)</h3>
              <p className="text-sm bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-yellow-800 dark:text-yellow-200">
                {user.notes}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
