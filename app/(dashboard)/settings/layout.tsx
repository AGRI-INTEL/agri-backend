'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/page-wrapper';

const tabs = [
  { href: '/settings/profile', label: 'Profil', icon: User },
  { href: '/settings/preferences', label: 'Préférences', icon: Sliders },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PageWrapper title="Paramètres">
      <nav className="flex gap-2 border-b border-border mb-6" aria-label="Paramètres">
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              pathname === href
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </PageWrapper>
  );
}
