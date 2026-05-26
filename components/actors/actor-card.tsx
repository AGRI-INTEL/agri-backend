'use client';

import Link from 'next/link';
import { Eye, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { SectorBadge } from '@/components/shared/sector-badge';
import { COUNTRY_FLAGS, formatNumber } from '@/lib/utils';
import type { Actor } from '@/types/actor';

interface ActorCardProps { actor: Actor; }

export function ActorCard({ actor }: ActorCardProps) {
  const flag = COUNTRY_FLAGS[actor.country] || '🌍';

  const metric = actor.sector === 'vegetal'
    ? actor.vegetal_data?.total_area_ha ? `${formatNumber(actor.vegetal_data.total_area_ha)} ha` : null
    : actor.sector === 'animal'
    ? actor.animal_data?.total_livestock ? `${formatNumber(actor.animal_data.total_livestock)} têtes` : null
    : actor.sector === 'halieutique'
    ? actor.halieutique_data?.pirogues_count ? `${actor.halieutique_data.pirogues_count} pirogues` : null
    : actor.forestier_data?.forest_area_ha ? `${formatNumber(actor.forestier_data.forest_area_ha)} ha` : null;

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar src={actor.avatar} name={actor.name} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{actor.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{actor.role}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs">{flag}</span>
              <span className="text-xs text-muted-foreground">{actor.city || actor.region}, {actor.country}</span>
            </div>
          </div>
          <SectorBadge sector={actor.sector} />
        </div>

        {metric && (
          <div className="bg-muted/50 rounded-lg px-3 py-1.5 mb-3">
            <p className="text-xs text-muted-foreground">Superficie / Cheptel</p>
            <p className="text-sm font-semibold font-data">{metric}</p>
          </div>
        )}

        {(actor.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(actor.tags || []).slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs px-1.5 py-0">{t}</Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" asChild>
            <Link href={`/actors/${actor.id}`}>
              <Eye className="h-3 w-3" />
              Voir
            </Link>
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Envoyer un message">
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Ajouter aux favoris">
            <Star className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
