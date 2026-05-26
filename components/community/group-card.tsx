'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Lock, Globe, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJoinGroup } from '@/hooks/use-community';
import type { Group } from '@/types/community';

const typeIcons = { public: Globe, prive: Lock, professionnel: Briefcase, institutionnel: Briefcase };
const typeLabels = { public: 'Public', prive: 'Privé', professionnel: 'Pro', institutionnel: 'Institution' };

interface GroupCardProps { group: Group; }

export function GroupCard({ group }: GroupCardProps) {
  const join = useJoinGroup();
  const Icon = typeIcons[group.type] || Globe;

  return (
    <Card className="card-hover overflow-hidden">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
        {group.banner && (
          <Image
            src={group.banner}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          <div className="h-12 w-12 rounded-xl border-2 border-card bg-primary/10 flex items-center justify-center overflow-hidden relative">
            {group.avatar ? (
              <Image
                src={group.avatar}
                alt={group.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <Users className="h-6 w-6 text-primary" />
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-8 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{typeLabels[group.type]}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{group.members_count}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{group.description}</p>

        {group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {group.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs px-1.5 py-0">{t}</Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
            <Link href={`/community/groups/${group.id}`}>Voir</Link>
          </Button>
          {group.membership_status === 'none' && (
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={() => join.mutate(group.id)}
              loading={join.isPending}
            >
              Rejoindre
            </Button>
          )}
          {group.membership_status === 'pending' && (
            <Badge variant="warning" className="flex-1 justify-center text-xs">En attente</Badge>
          )}
          {(group.membership_status === 'member' || group.membership_status === 'admin') && (
            <Badge variant="success" className="flex-1 justify-center text-xs">Membre</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
