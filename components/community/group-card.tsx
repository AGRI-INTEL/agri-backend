'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Lock, Globe, Briefcase, TrendingUp, MessageSquare, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJoinGroup } from '@/hooks/use-community';
import type { Group } from '@/types/community';

const typeIcons = { public: Globe, prive: Lock, professionnel: Briefcase, institutionnel: Briefcase };
const typeLabels = { public: 'Public', prive: 'Privé', professionnel: 'Pro', institutionnel: 'Institution' };

interface GroupCardProps {
  group: Group;
  variant?: 'grid' | 'list';
}

export function GroupCard({ group, variant = 'grid' }: GroupCardProps) {
  const join = useJoinGroup();
  const Icon = typeIcons[group.type] || Globe;

  if (variant === 'list') {
    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-lg border-2 border-border bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {group.avatar ? (
              <Image
                src={group.avatar}
                alt={group.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <Users className="h-8 w-8 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-sm">{group.name}</h3>
              <Badge variant="outline" className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {typeLabels[group.type]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{group.description}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{group.members_count} membres</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>245 posts</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>+12% cette semaine</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-red-500">
              <Heart className="h-4 w-4" />
            </Button>
            {group.membership_status === 'none' && (
              <Button
                size="sm"
                onClick={() => join.mutate(group.id)}
                loading={join.isPending}
              >
                Rejoindre
              </Button>
            )}
            {group.membership_status === 'pending' && (
              <Badge variant="warning" className="text-xs">En attente</Badge>
            )}
            {(group.membership_status === 'member' || group.membership_status === 'admin') && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/community/groups/${group.id}`}>Visiter</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="card-hover overflow-hidden h-full flex flex-col">
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
          <div className="h-14 w-14 rounded-xl border-3 border-card bg-primary/10 flex items-center justify-center overflow-hidden relative">
            {group.avatar ? (
              <Image
                src={group.avatar}
                alt={group.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <Users className="h-7 w-7 text-primary" />
            )}
          </div>
        </div>
        
        {/* Like button */}
        <button className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur rounded-lg hover:bg-card transition-colors">
          <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
        </button>
      </div>

      <CardContent className="pt-9 pb-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{typeLabels[group.type]}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{group.members_count}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{group.description}</p>

        {/* Tags */}
        {group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {group.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs px-1.5 py-0.5">{t}</Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="text-xs text-muted-foreground space-y-1 mb-3 py-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Discussions
            </span>
            <span className="font-semibold">245</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Croissance
            </span>
            <span className="font-semibold text-green-600">+12%</span>
          </div>
        </div>

        {/* Actions */}
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
