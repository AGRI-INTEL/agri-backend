'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Trash2,
  Eye,
  MessageCircle,
  Image as ImageIcon,
  Flag,
  Clock,
  MoreHorizontal,
  Check,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface FlaggedItem {
  id: string;
  type: 'post' | 'comment' | 'image' | 'user';
  author: string;
  title: string;
  preview: string;
  reason: string;
  reports: number;
  date: string;
  status: 'pending' | 'flagged' | 'resolved';
}

async function fetchFlaggedContent(): Promise<FlaggedItem[]> {
  try {
    const data = await apiClient.get<FlaggedItem[] | Record<string, unknown>>('/admin/flagged-content');
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items as FlaggedItem[];
    return [];
  } catch {
    return [];
  }
}

export function AdminModerationPanel() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged' | 'pending' | 'resolved'>('all');

  const { data: flaggedContent = [], isLoading } = useQuery({
    queryKey: ['admin', 'flagged-content'],
    queryFn: fetchFlaggedContent,
    refetchInterval: 30_000,
  });

  const filtered = flaggedContent.filter(item =>
    activeFilter === 'all' ? true : item.status === activeFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'flagged': return 'bg-red-100 text-red-800 border-red-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const counts = {
    all: flaggedContent.length,
    pending: flaggedContent.filter(i => i.status === 'pending').length,
    flagged: flaggedContent.filter(i => i.status === 'flagged').length,
    resolved: flaggedContent.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'flagged', 'resolved'] as const).map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'all' ? 'Tous' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            {counts[filter] > 0 && (
              <Badge variant="secondary" className="ml-1.5">{counts[filter]}</Badge>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-1">Aucun contenu signalé</h3>
          <p className="text-sm text-muted-foreground">Tout est sous contrôle pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 min-w-0">
                    <div className="mt-1 shrink-0">{getTypeIcon(item.type)}</div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{item.author}</span>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.preview}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Flag className="h-3 w-3" />{item.reports} signalements</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.date}</span>
                        <Badge variant="destructive" className="text-xs">{item.reason}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><X className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
