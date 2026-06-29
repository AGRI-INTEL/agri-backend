'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { useAuthStore } from '@/stores/auth-store';
import { isAdmin, isOwner } from '@/types/auth';
import { AlertCircle, Shield, Users, Flag, Activity, Database, RefreshCw, Globe, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [systemStatus, setSystemStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user && !isAdmin(user)) router.replace('/');
  }, [user, router]);

  const runSystemCheck = async () => {
    setSystemStatus({ checking: true });
    const checks: Record<string, boolean> = {};
    const results = await Promise.allSettled([
      fetch('/api/v1/health').then(r => r.ok),
      fetch('/ping').then(r => r.ok),
      fetch('/api/v1/admin/stats').then(r => r.ok).catch(() => false),
    ]);
    checks.api = results[0].status === 'fulfilled' && results[0].value;
    checks.site = results[1].status === 'fulfilled' && results[1].value;
    checks.stats = results[2].status === 'fulfilled' && results[2].value;
    setSystemStatus(checks);
    toast.success('Vérification système terminée');
  };

  useEffect(() => { runSystemCheck(); }, []);

  if (!user || !isAdmin(user)) {
    return (
      <PageWrapper title="Accès refusé">
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Accès refusé</h2>
              <p className="text-muted-foreground mt-2">
                Vous n&apos;avez pas la permission d&apos;accéder à cette section.
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const roleSpecificSections = [
    { id: 'users', label: 'Utilisateurs', icon: Users, desc: 'Gérer les comptes, rôles et permissions', roles: ['admin', 'superadmin'] },
    { id: 'reports', label: 'Signalements', icon: Flag, desc: 'Modérer les signalements utilisateurs et groupes', roles: ['admin', 'superadmin', 'moderator'] },
    { id: 'groups', label: 'Groupes', icon: Globe, desc: 'Superviser les groupes et leurs contenus', roles: ['admin', 'superadmin', 'moderator'] },
    { id: 'system', label: 'Système', icon: Activity, desc: 'Métriques, logs et santé de la plateforme', roles: ['admin', 'superadmin'] },
    { id: 'messages', label: 'Messages', icon: MessageSquare, desc: 'Superviser la messagerie globale', roles: ['admin', 'superadmin'] },
  ];

  const userRole = user?.role || 'user';
  const visibleSections = roleSpecificSections.filter(s => s.roles.includes(userRole));

  return (
    <PageWrapper
      title="Administration"
      description="Gestion complète de la plateforme, utilisateurs, rôles et sécurité"
    >
      <div className="space-y-6">
        {/* Header avec sélecteur de langue admin */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex-1">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Panneau d&apos;administration</h3>
                {isOwner(user) && <Badge className="bg-amber-500">Super Admin</Badge>}
                <Badge variant="outline" className="text-xs">{userRole}</Badge>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Rôle: <strong>{userRole}</strong> &middot; Email: {user.email}
              </p>
            </div>
          </div>
          <div className="ml-3">
            <LanguageSwitcher variant="minimal" />
          </div>
        </div>

        {/* System Status Bar */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs font-bold uppercase text-muted-foreground">État du système</span>
            {systemStatus.checking ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <>
                <span className={`flex items-center gap-1 text-xs font-semibold ${systemStatus.api ? 'text-green-600' : 'text-red-600'}`}>
                  <span className={`h-2 w-2 rounded-full ${systemStatus.api ? 'bg-green-500' : 'bg-red-500'}`} />
                  API
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${systemStatus.site ? 'text-green-600' : 'text-red-600'}`}>
                  <span className={`h-2 w-2 rounded-full ${systemStatus.site ? 'bg-green-500' : 'bg-red-500'}`} />
                  Site
                </span>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={runSystemCheck}>
            <RefreshCw className={`h-3 w-3 mr-1 ${systemStatus.checking ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
        </div>

        {/* Navigation par sections */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeSection === section.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/30 hover:bg-muted/30'
              }`}
            >
              <section.icon className={`h-5 w-5 mb-2 ${activeSection === section.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <h4 className="text-sm font-bold">{section.label}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{section.desc}</p>
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <AdminDashboard activeSection={activeSection} />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Utilisateurs', value: '—', color: 'text-blue-500' },
            { icon: Globe, label: 'Groupes', value: '—', color: 'text-green-500' },
            { icon: Flag, label: 'Signalements', value: '—', color: 'text-amber-500' },
            { icon: Database, label: 'Base de données', value: 'PostgreSQL', color: 'text-purple-500' },
          ].map((stat, i) => (
            <Card key={i} className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Owner-specific section */}
        {isOwner(user) && (
          <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-100">Privilèges Super Admin</h4>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                  Vous avez un accès complet à toutes les fonctionnalités d&apos;administration,
                  la gestion des rôles, la suppression de comptes, et la configuration système avancée.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
