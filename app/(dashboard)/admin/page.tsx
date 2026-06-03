'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { useAuthStore } from '@/stores/auth-store';
import { isAdmin } from '@/types/auth';
import { AlertCircle, Shield, Settings, Info } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAdmin(user)) {
      router.replace('/');
    }
  }, [user, router]);

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
                Vous n'avez pas la permission d'accéder à cette section.
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Administration" 
      description="Gestion complète de la plateforme, utilisateurs, rôles et sécurité"
    >
      <div className="space-y-6">
        {/* Admin Header Alert */}
        <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Bienvenue dans le panneau d'administration</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Vous pouvez gérer les utilisateurs, les rôles, les permissions, voir les statistiques système et consulter les journaux d'activité.
            </p>
          </div>
        </div>

        {/* Admin Dashboard */}
        <AdminDashboard />

        {/* Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Gestion des utilisateurs</h4>
                <p className="text-xs text-muted-foreground">
                  Créez, modifiez, activez ou désactivez les comptes utilisateurs. Gérez les rôles et les permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Sécurité et permissions</h4>
                <p className="text-xs text-muted-foreground">
                  Définez les rôles et les permissions. Suivez l'activité et les journaux d'audit.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Configuration système</h4>
                <p className="text-xs text-muted-foreground">
                  Consultez les statistiques du système, les métriques de performance et les alertes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
