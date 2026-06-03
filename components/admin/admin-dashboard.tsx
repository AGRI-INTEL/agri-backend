'use client';

import { useState } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStats, useAdminUsers, useAdminToggleUserActive } from '@/hooks/use-admin';
import { getRoleLabel, ROLE_COLORS, ROLE_ICONS } from '@/types/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ page: 1 });
  const toggleActive = useAdminToggleUserActive();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'activity'>('recent');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'activity'>('overview');

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const u = stats?.users;
  const activeRate = u?.total ? Math.round((u.active / u.total) * 100) : 0;
  const verifiedRate = u?.total ? Math.round((u.verified / u.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
          { id: 'activity', label: 'Journal d\'activité', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Utilisateurs</p>
                    <p className="text-3xl font-bold">{u?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round((u?.active ?? 0) / (u?.total ?? 1) * 100)}% actifs
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Actifs aujourd'hui</p>
                    <p className="text-3xl font-bold">{u?.active ?? 0}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ChevronUp className="h-4 w-4 text-green-500" />
                      <p className="text-xs text-green-600 dark:text-green-400">+12% vs hier</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vérifiés</p>
                    <p className="text-3xl font-bold">{u?.verified ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {verifiedRate}% du total
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Système</p>
                    <p className="text-2xl font-bold">v{stats?.system?.version}</p>
                    <p className="text-xs text-muted-foreground mt-2 capitalize">
                      {stats?.system?.environment}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Users by Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Utilisateurs par rôle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(u?.by_role ?? {})
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 6)
                    .map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ROLE_ICONS[role as any]}</span>
                          <div>
                            <p className="text-sm font-medium">{getRoleLabel(role as any)}</p>
                            <p className="text-xs text-muted-foreground">{count as number} utilisateurs</p>
                          </div>
                        </div>
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${((count as number) / Math.max(...Object.values(u?.by_role ?? {})) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  État du système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux d'activité</span>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                      {activeRate}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${activeRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm font-medium">Taux de vérification</span>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      {verifiedRate}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${verifiedRate}%` }}
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Statut du serveur</p>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-600 dark:text-green-400">En ligne et fonctionnel</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="analyst">Analyste</option>
              <option value="producteur">Producteur</option>
              <option value="viewer">Lecteur</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="recent">Plus récent</option>
              <option value="name">Nom (A-Z)</option>
              <option value="activity">Activité</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Utilisateur</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Email</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Rôle</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Statut</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Inscription</th>
                        <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(usersData?.users || [])
                        .filter((user: any) =>
                          !roleFilter || user.role === roleFilter
                        )
                        .map((user: any) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {user.email}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] + '20',
                                  borderColor: ROLE_COLORS[user.role as keyof typeof ROLE_COLORS],
                                  color: ROLE_COLORS[user.role as keyof typeof ROLE_COLORS],
                                }}
                              >
                                {ROLE_ICONS[user.role as keyof typeof ROLE_ICONS]} {getRoleLabel(user.role as any)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={user.is_active ? 'success' : 'secondary'}
                                className="flex items-center gap-1 w-fit"
                              >
                                {user.is_active ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    Actif
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    Inactif
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Voir le profil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleActive.mutate({
                                        userId: user.id,
                                        activate: !user.is_active,
                                      })
                                    }
                                  >
                                    {user.is_active ? (
                                      <>
                                        <Lock className="h-4 w-4" />
                                        Désactiver
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="h-4 w-4" />
                                        Activer
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage 1 à {(usersData?.users || []).length} sur {usersData?.total} utilisateurs
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Précédent</Button>
              <Button variant="outline" size="sm">Suivant</Button>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Super Administrateur', permissions: 35, users: 1, color: 'from-red-500' },
            { name: 'Administrateur', permissions: 28, users: 3, color: 'from-orange-500' },
            { name: 'Analyste', permissions: 12, users: 8, color: 'from-blue-500' },
            { name: 'Producteur', permissions: 8, users: 342, color: 'from-green-500' },
            { name: 'Modérateur', permissions: 15, users: 5, color: 'from-purple-500' },
            { name: 'Lecteur', permissions: 3, users: 156, color: 'from-gray-500' },
          ].map((role) => (
            <Card key={role.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{role.permissions} permissions</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Utilisateurs: {role.users}</p>
                    <div className={`h-2 bg-gradient-to-r ${role.color} to-transparent rounded-full`} />
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    Gérer les permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Journal d'activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Connexion', user: 'Jean Dupont', time: 'À l\'instant', type: 'login' },
                { action: 'Profil mis à jour', user: 'Marie Sall', time: 'Il y a 5 min', type: 'update' },
                { action: 'Compte créé', user: 'Nouveau Utilisateur', time: 'Il y a 1h', type: 'register' },
                { action: 'Mot de passe changé', user: 'Ahmed Fall', time: 'Il y a 2h', type: 'password' },
                { action: 'Compte suspendu', user: 'Test User', time: 'Il y a 5h', type: 'suspend' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    login: <Activity className="h-4 w-4 text-blue-600" />,
    update: <CheckCircle className="h-4 w-4 text-green-600" />,
    register: <Users className="h-4 w-4 text-purple-600" />,
    password: <Lock className="h-4 w-4 text-orange-600" />,
    suspend: <AlertCircle className="h-4 w-4 text-red-600" />,
  };
  return icons[type] || <Activity className="h-4 w-4" />;
}
