'use client';

import Link from 'next/link';
import { MapPin, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { SectorBadge } from '@/components/shared/sector-badge';
import { Badge } from '@/components/ui/badge';
import { COUNTRY_FLAGS, formatNumber } from '@/lib/utils';
import type { Actor } from '@/types/actor';

interface ActorDetailViewProps {
  actor: Actor;
}

export function ActorDetailView({ actor }: ActorDetailViewProps) {
  const flag = COUNTRY_FLAGS[actor.country] || '🌍';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/actors"><ArrowLeft className="h-4 w-4" />Retour aux acteurs</Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <UserAvatar src={actor.avatar} name={actor.name} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{actor.name}</h1>
                <SectorBadge sector={actor.sector} />
              </div>
              <p className="text-muted-foreground capitalize">{actor.role?.replace(/_/g, ' ')}</p>
              <p className="flex items-center gap-1 text-sm mt-2">
                <MapPin className="h-4 w-4" />
                {flag} {actor.city}, {actor.region} — {actor.country_name || actor.country}
              </p>
              {actor.description && (
                <p className="text-sm mt-4 text-muted-foreground">{actor.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {(actor.tags || []).map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">Contact</h2>
            {actor.email && (
              <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" />{actor.email}</p>
            )}
            {actor.phone && (
              <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" />{actor.phone}</p>
            )}
            {actor.website && (
              <a href={actor.website} className="flex items-center gap-2 text-sm text-primary hover:underline" target="_blank" rel="noreferrer">
                <Globe className="h-4 w-4" />{actor.website}
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">Données sectorielles</h2>
            {actor.vegetal_data?.total_area_ha != null && (
              <p className="text-sm">Superficie: <strong>{formatNumber(actor.vegetal_data.total_area_ha)} ha</strong></p>
            )}
            {actor.animal_data?.total_livestock != null && (
              <p className="text-sm">Cheptel: <strong>{formatNumber(actor.animal_data.total_livestock)} têtes</strong></p>
            )}
            {actor.halieutique_data?.pirogues_count != null && (
              <p className="text-sm">Pirogues: <strong>{actor.halieutique_data.pirogues_count}</strong></p>
            )}
            {actor.forestier_data?.forest_area_ha != null && (
              <p className="text-sm">Forêt: <strong>{formatNumber(actor.forestier_data.forest_area_ha)} ha</strong></p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
