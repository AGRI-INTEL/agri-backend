'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Mail, Phone, Star, Eye, BadgeCheck, Shield, Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getSectorColor, getSectorEmoji, formatNumber } from '@/lib/utils';
import type { ActorRow } from '@/components/actors/actor-card';

interface ActorDetailViewProps { actor: ActorRow; }

export function ActorDetailView({ actor }: ActorDetailViewProps) {
  const sectorKey = actor.sector as 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'minier' | 'industriel';
  const sectorColor = getSectorColor(sectorKey);
  const sectorEmoji = getSectorEmoji(sectorKey);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/actors"><ArrowLeft className="h-4 w-4" />Retour aux acteurs</Link>
      </Button>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary">
              {(actor.name || '?').split(' ').map((n: string) => n[0] || '').join('').toUpperCase().slice(0, 2) || '?'}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{actor.name}</h1>
                <span className="text-xl" title={actor.sector}>{sectorEmoji}</span>
                {actor.is_featured && <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200"><Medal className="h-3 w-3" />À la une</Badge>}
                {actor.is_premium && <Badge className="gap-1 bg-purple-100 text-purple-700 border-purple-200"><Shield className="h-3 w-3" />Premium</Badge>}
              </div>
              <p className="text-muted-foreground capitalize">{actor.role?.replace(/_/g, ' ')}</p>
              <div className="flex items-center gap-1 text-sm mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {actor.city}, {actor.region} — {actor.country_name}
              </div>
              {actor.organisation && (
                <p className="text-sm mt-2 text-muted-foreground">
                  <span className="font-medium text-foreground">{actor.organisation}</span>
                  {actor.organisation_type ? ` · ${actor.organisation_type.replace(/_/g, ' ')}` : ''}
                </p>
              )}
              {actor.description && <p className="text-sm mt-4 text-muted-foreground">{actor.description}</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {actor.tags?.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{actor.rating_average?.toFixed(1) ?? '-'} ({actor.rating_count ?? 0})</span>
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{formatNumber(actor.view_count)} vues</span>
                {actor.is_verified && <span className="flex items-center gap-1 text-blue-600"><BadgeCheck className="h-4 w-4" />Vérifié</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact + Sector Data + Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2"><Mail className="h-4 w-4" />Contact</h2>
            <Separator />
            {actor.email && (
              <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 shrink-0 text-muted-foreground" />{actor.email}</p>
            )}
            {actor.phone && (
              <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 shrink-0 text-muted-foreground" />{actor.phone}</p>
            )}
            {!actor.email && !actor.phone && (
              <p className="text-sm text-muted-foreground">Aucune information de contact disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm" style={{ color: sectorColor }}>Données {actor.sector}</h2>
            <Separator />
            {actor.vegetal_data && (
              <div className="space-y-2 text-sm">
                <p>Superficie: <strong>{formatNumber(actor.vegetal_data.total_area_ha)} ha</strong></p>
                {actor.vegetal_data.main_crop && <p>Culture principale: <strong>{actor.vegetal_data.main_crop}</strong></p>}
                {actor.vegetal_data.annual_revenue && <p>Revenu annuel: <strong>{formatNumber(actor.vegetal_data.annual_revenue)} FCFA</strong></p>}
              </div>
            )}
            {actor.animal_data && (
              <div className="space-y-2 text-sm">
                <p>Cheptel: <strong>{formatNumber(actor.animal_data.total_livestock)} têtes</strong></p>
                {actor.animal_data.main_species && <p>Espèce principale: <strong>{actor.animal_data.main_species}</strong></p>}
              </div>
            )}
            {actor.halieutique_data && (
              <div className="space-y-2 text-sm">
                <p>Pirogues: <strong>{actor.halieutique_data.pirogues_count}</strong></p>
                {actor.halieutique_data.main_species?.length && <p>Espèces: <strong>{actor.halieutique_data.main_species.join(', ')}</strong></p>}
              </div>
            )}
            {actor.forestier_data && (
              <div className="space-y-2 text-sm">
                <p>Superficie: <strong>{formatNumber(actor.forestier_data.forest_area_ha)} ha</strong></p>
                {actor.forestier_data.main_products?.length && <p>Produits: <strong>{actor.forestier_data.main_products.join(', ')}</strong></p>}
              </div>
            )}
            {actor.minier_data && (
              <div className="space-y-2 text-sm">
                <p>Minéraux: <strong>{actor.minier_data.minerals?.join(', ') ?? '-'}</strong></p>
                <p>Ouvriers: <strong>{actor.minier_data.workers_count ?? '-'}</strong></p>
              </div>
            )}
            {actor.industriel_data && (
              <div className="space-y-2 text-sm">
                <p>Produits: <strong>{actor.industriel_data.products?.join(', ') ?? '-'}</strong></p>
                <p>Employés: <strong>{actor.industriel_data.employee_count ?? '-'}</strong></p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2"><Eye className="h-4 w-4" />Activité</h2>
            <Separator />
            <p className="text-sm flex justify-between"><span className="text-muted-foreground">Vues du profil</span><strong>{formatNumber(actor.view_count)}</strong></p>
            <p className="text-sm flex justify-between"><span className="text-muted-foreground">Contacts</span><strong>{actor.contact_count}</strong></p>
            <p className="text-sm flex justify-between"><span className="text-muted-foreground">Note moyenne</span><strong>{actor.rating_average?.toFixed(1) ?? '-'}/5</strong></p>
            <p className="text-sm flex justify-between"><span className="text-muted-foreground">Avis</span><strong>{actor.rating_count ?? 0}</strong></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
