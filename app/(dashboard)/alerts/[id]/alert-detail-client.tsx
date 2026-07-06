'use client';

import LinkButton from '@/components/ui/link-button';
import { usePathname } from 'next/navigation';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { SectorBadge } from '@/components/shared/sector-badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAlert, useMarkAlertRead } from '@/hooks/use-alerts';
import { getAlertAge, getAlertTypeLabel } from '@/types/alert';
import DOMPurify from 'dompurify';

export default function AlertDetailClient({ params: _params }: { params: Promise<{ id: string }> }) {
  const pathname = usePathname();
  const id = pathname.split('/').pop() || '';
  const { data: alert, isLoading } = useAlert(id);
  const markRead = useMarkAlertRead();

  const sanitizedBody = typeof window !== 'undefined' && alert?.body
    ? DOMPurify.sanitize(alert.body, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'hr', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption'] })
    : null;

  if (isLoading) {
    return (
      <PageWrapper>
        <LoadingSkeleton variant="card" count={2} />
      </PageWrapper>
    );
  }

  if (!alert) {
    return (
      <PageWrapper title="Alerte introuvable">
        <LinkButton href="/alerts" variant="ghost">← Retour</LinkButton>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={alert.title}
      actions={
        !alert.is_read && (
          <Button size="sm" onClick={() => markRead.mutate(alert.id)}>Marquer comme lu</Button>
        )
      }
    >
      <LinkButton href="/alerts" variant="ghost" size="sm" className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" />Retour
      </LinkButton>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={alert.severity} />
            <span className="text-sm text-muted-foreground">{getAlertTypeLabel(alert.type)}</span>
            {alert.sector && <SectorBadge sector={alert.sector} />}
          </div>
          <p className="text-muted-foreground leading-relaxed">{alert.description}</p>
          {sanitizedBody && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{getAlertAge(alert)}</span>
            {(alert.city || alert.country) && (
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{alert.city || alert.country}</span>
            )}
            {alert.source && <span>Source: {alert.source}</span>}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
