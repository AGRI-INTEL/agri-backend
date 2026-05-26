'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  production: 'Production Végétale',
  animal: 'Élevage & Animal',
  halieutique: 'Halieutique',
  forestier: 'Forestier',
  actors: 'Acteurs',
  indicators: 'Indicateurs',
  analytics: 'Analytics',
  predictions: 'Prédictions IA',
  weather: 'Météo',
  alerts: 'Alertes',
  map: 'Carte Interactive',
  chatbot: 'AgriBot IA',
  community: 'Communauté',
  files: 'Fichiers',
  settings: 'Paramètres',
  profile: 'Profil',
  security: 'Sécurité',
  preferences: 'Préférences',
  admin: 'Administration',
  notifications: 'Notifications',
  groups: 'Groupes',
  economics: 'Économie',
};

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] || seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Fil d'Ariane" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Accueil"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
