'use client';

import { useState, useMemo } from 'react';
import {
  Users, UserCheck, Shield, Activity, Clock,
  Search, Download, Lock, Unlock, Trash2, Eye,
  Mail, Calendar, CheckCircle, XCircle, ChevronUp,
  BarChart3, Settings, ChevronLeft, ChevronRight,
  MoreHorizontal, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useAdminStats,
  useAdminUsers,
  useAdminToggleUserActive,
  useAdminDeleteUser,
} from '@/hooks/use-admin';
import { getRoleLabel, ROLE_COLORS, ROLE_ICONS } from '@/types/auth';
import { UserManagementModal } from '@/components/admin/user-management-modal';
import { UserProfileModal } from '@/components/admin/user-profile-modal';
import { RolePermissionsModal } from '@/components/admin/role-permissions-modal';
import { AdminSystemAlerts, AdminSystemMetrics } from '@/components/admin/system-alerts';
import { AdminReportsSection } from '@/components/admin/reports-section';
import { AdminModerationPanel } from '@/components/admin/moderation-panel';
import { exportUsersToPDF } from '@/lib/export-pdf';
import type { User } from '@/types/auth';

const ROLES_FILTER = [
  { value: '', label: 'Tous les rôles' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'analyst', label: 'Analyste' },
  { value: 'producteur', label: 'Producteur' },
  { value: 'eleveur', label: 'Éleveur' },
  { value: 'pecheur', label: 'Pêcheur' },
  { value: 'forestier', label: 'Forestier' },
  { value: 'viewer', label: 'Lecteur' },
];

const STATUS_FILTER = [
  { value: '', label: 'Tous les statuts' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'pending', label: 'En attente' },
  { value: 'suspended', label: 'Suspendu' },
  { value: 'banned', label: 'Banni' },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'roles' | 'activity' | 'moderation' | 'reports' | 'system'
  >('overview');

  // Users tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [managementModal, setManagementModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [rolesModal, setRolesModal] = useState(false);

  // Mutations
  const toggleActive = useAdminToggleUserActive();
  const deleteUser = useAdminDeleteUser();

  // Queries
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useAdminUsers({
    page: currentPage,
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    per_page: 20,
  });

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    const timer = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timer);
  };

  const handleFilterChange = (type: 'role' | 'status', value: string) => {
    if (type === 'role') setRoleFilter(value);
    if (type === 'status') setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleExportPDF = () => {
    const users = usersData?.users || [];
    if (!users.length) return;
    exportUsersToPDF(users, 'Liste des utilisateurs');
  };

  const openManagement = (user: User) => {
    setSelectedUser(user);
    setManagementModal(true);
  };

  const openProfile = (user: User) => {
    setSelectedUser(user);
    setProfileModal(true);
  };

  const openRoles = (user: User) => {
    setSelectedUser(user);
    setRolesModal(true);
  };

  const u = stats?.users;
  const activeRate = u?.total ? Math.round((u.active / u.total) * 100) : 0;
  const verifiedRate = u?.total ? Math.round((u.verified / u.total) * 100) : 0;
  const totalPages = usersData?.pages || 1;

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {[
          { id: 'overview', label: "Vue d'ensemble", icon: Activity },
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
          { id: 'moderation', label: 'Modération', icon: Shield },
          { id: 'reports', label: 'Rapports', icon: BarChart3 },
          { id: 'system', label: 'Système', icon: Settings },
          { id: 'activity', label: "Journal d'activité", icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Utilisateurs totaux</p>
                        <p className="text-3xl font-bold">{u?.total ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-2">{activeRate}% actifs</p>
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
                        <p className="text-sm text-muted-foreground mb-1">Actifs</p>
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
                        <p className="text-xs text-muted-foreground mt-2">{verifiedRate}% du total</p>
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
                        <p className="text-2xl font-bold">v{stats?.system?.version || '—'}</p>
                        <p className="text-xs text-muted-foreground mt-2 capitalize">
                          {stats?.system?.environment || '—'}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Utilisateurs par rôle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(u?.by_role ?? {})
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 8)
                        .map(([role, count]) => {
                          const max = Math.max(...Object.values(u?.by_role ?? {}).map(Number));
                          const pct = max > 0 ? ((count as number) / max) * 100 : 0;
                          return (
                            <div key={role} className="flex items-center gap-3">
                              <span className="text-lg w-6 flex-shrink-0">{ROLE_ICONS[role as keyof typeof ROLE_ICONS] || '👤'}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-medium">{getRoleLabel(role as any)}</p>
                                  <p className="text-xs text-muted-foreground">{count as number}</p>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: ROLE_COLORS[role as keyof typeof ROLE_COLORS] || '#6B7280',
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {Object.keys(u?.by_role ?? {}).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée disponible</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      État du système
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Taux d'activité</span>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 border-green-200">
                          {activeRate}%
                        </Badge>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${activeRate}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Taux de vérification</span>
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 border-blue-200">
                          {verifiedRate}%
                        </Badge>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${verifiedRate}%` }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-medium mb-2">Serveur</p>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-green-600 dark:text-green-400">En ligne</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { refetchStats(); refetchUsers(); }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser les données
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              {ROLES_FILTER.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              {STATUS_FILTER.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              className="flex items-center gap-2 flex-shrink-0"
              onClick={handleExportPDF}
              disabled={!usersData?.users?.length}
            >
              <Download className="h-4 w-4" />
              Exporter PDF
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !usersData?.users?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Aucun utilisateur trouvé</p>
                  <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Utilisateur</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rôle</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Statut</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Inscription</th>
                        <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[100px]">{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs truncate max-w-[160px]">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: ROLE_COLORS[user.role] + '20',
                                borderColor: ROLE_COLORS[user.role],
                                color: ROLE_COLORS[user.role],
                              }}
                            >
                              {ROLE_ICONS[user.role]} {getRoleLabel(user.role)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 w-fit text-xs ${
                                user.is_active
                                  ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20'
                                  : 'border-red-400 text-red-500 bg-red-50 dark:bg-red-950/20'
                              }`}
                            >
                              {user.is_active ? (
                                <><CheckCircle className="h-3 w-3" />Actif</>
                              ) : (
                                <><XCircle className="h-3 w-3" />Inactif</>
                              )}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => openProfile(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                  Voir le profil
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => openManagement(user)}
                                >
                                  <Settings className="h-4 w-4" />
                                  Gérer l'utilisateur
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => openRoles(user)}
                                >
                                  <Shield className="h-4 w-4" />
                                  Rôles & Permissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    toggleActive.mutate({ userId: user.id, activate: !user.is_active })
                                  }
                                >
                                  {user.is_active ? (
                                    <><Lock className="h-4 w-4" />Désactiver</>
                                  ) : (
                                    <><Unlock className="h-4 w-4" />Activer</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer {user.name} ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action est irréversible. Toutes les données seront supprimées.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => deleteUser.mutate(user.id)}
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          {(usersData?.total ?? 0) > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} · {usersData?.total ?? 0} utilisateurs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ROLES TAB ── */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cliquez sur un rôle pour voir les permissions associées. Pour modifier les permissions d'un utilisateur spécifique, allez dans l'onglet Utilisateurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { role: 'super_admin', users: u?.by_role?.super_admin ?? 0 },
              { role: 'admin', users: u?.by_role?.admin ?? 0 },
              { role: 'moderator', users: u?.by_role?.moderator ?? 0 },
              { role: 'analyst', users: u?.by_role?.analyst ?? 0 },
              { role: 'data_scientist', users: u?.by_role?.data_scientist ?? 0 },
              { role: 'producteur', users: u?.by_role?.producteur ?? 0 },
              { role: 'viewer', users: u?.by_role?.viewer ?? 0 },
            ].map(({ role, users: count }) => (
              <Card key={role}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ROLE_ICONS[role as keyof typeof ROLE_ICONS]}</span>
                      <div>
                        <CardTitle
                          className="text-base"
                          style={{ color: ROLE_COLORS[role as keyof typeof ROLE_COLORS] }}
                        >
                          {getRoleLabel(role as any)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count} utilisateur{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setRoleFilter(role);
                      setActiveTab('users');
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Voir les utilisateurs avec ce rôle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MODERATION TAB ── */}
      {activeTab === 'moderation' && <AdminModerationPanel />}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && <AdminReportsSection />}

      {/* ── SYSTEM TAB ── */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <AdminSystemMetrics />
          <AdminSystemAlerts />
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Journal d'activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {(u?.recent || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune activité récente</p>
                )}
                {(u?.recent || []).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                        {item.avatar ? (
                          <img src={item.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{String(item.name || item.email || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name || item.email || item.id}</p>
                        <p className="text-xs text-muted-foreground">{item.role || ''}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── MODALS ── */}
      <UserManagementModal
        user={selectedUser}
        isOpen={managementModal}
        onClose={() => setManagementModal(false)}
        onViewProfile={() => setProfileModal(true)}
        onManageRoles={() => setRolesModal(true)}
      />

      <UserProfileModal
        user={selectedUser}
        isOpen={profileModal}
        onClose={() => setProfileModal(false)}
      />

      <RolePermissionsModal
        user={selectedUser}
        isOpen={rolesModal}
        onClose={() => setRolesModal(false)}
      />
    </div>
  );
}
