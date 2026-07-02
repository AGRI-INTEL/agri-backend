'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Sliders, Lock, Bell, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/page-wrapper';

const tabs = [
  { 
    href: '/settings/profile', 
    label: 'Profil', 
    icon: User,
    description: 'Informations personnelles et photo'
  },
  { 
    href: '/settings/preferences', 
    label: 'Préférences', 
    icon: Sliders,
    description: 'Apparence et notifications'
  },
  { 
    href: '/settings/security', 
    label: 'Sécurité', 
    icon: Lock,
    description: 'Mot de passe et authentification'
  },
  { 
    href: '/settings/alerts', 
    label: 'Alertes de prix', 
    icon: Bell,
    description: 'Seuils et notifications de prix'
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PageWrapper title="Paramètres">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav 
            className="space-y-1 sticky top-20"
            aria-label="Paramètres"
          >
            {tabs.map(({ href, label, icon: Icon, description }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col gap-1 px-4 py-3 rounded-lg transition-all duration-200',
                  pathname === href
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{description}</p>
              </Link>
            ))}
          </nav>

          {/* Info Card — static, never floats or animates */}
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border" style={{ position: 'static' }}>
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Vos données sont sécurisées</h4>
                <p className="text-xs text-muted-foreground">
                  Nous utilisons le chiffrement de bout en bout pour protéger vos informations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </PageWrapper>
  );
}
