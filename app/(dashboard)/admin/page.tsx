'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { useAuthStore } from '@/stores/auth-store';
import { isAdmin } from '@/types/auth';

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
        <p className="text-muted-foreground">Cette section est réservée aux administrateurs.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Administration" description="Gestion des utilisateurs et statistiques système">
      <AdminDashboard />
    </PageWrapper>
  );
}
