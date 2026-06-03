'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Trash2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Image,
  Flag,
  Clock,
  User,
  MoreHorizontal,
  Check,
  X,
} from 'lucide-react';

export function AdminModerationPanel() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged' | 'pending' | 'resolved'>('all');

  const flaggedContent = [
    {
      id: 1,
      type: 'post',
      author: 'Jean Dupont',
      avatar: '👤',
      title: 'Post de Jean Dupont',
      preview: 'Lorem ipsum dolor sit amet consectetur...',
      reason: 'Contenu offensant',
      reports: 3,
      date: 'Il y a 2h',
      status: 'pending',
    },
    {
      id: 2,
      type: 'comment',
      author: 'Marie Sall',
      avatar: '👥',
      title: 'Commentaire de Marie Sall',
      preview: 'Ce commentaire contient du contenu inapproprié...',
      reason: 'Spam',
      reports: 5,
      date: 'Il y a 1h',
      status: 'flagged',
    },
    {
      id: 3,
      type: 'image',
      author: 'Ahmed Fall',
      avatar: '🖼️',
      title: 'Image téléchargée par Ahmed Fall',
      preview: 'Image avec contenu potentiellement offensant',
      reason: 'Contenu interdit',
      reports: 2,
      date: 'Il y a 30 min',
      status: 'resolved',
    },
  ];

  const filters = [
    { id: 'all', label: 'Tous', count: 12 },
    { id: 'flagged', label: 'Signalés', count: 5 },
    { id: 'pending', label: 'En attente', count: 3 },
    { id: 'resolved', label: 'Résolus', count: 4 },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400',
      flagged: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400',
      resolved: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400',
    };
    return colors[status] || 'bg-gray-50 dark:bg-gray-950/20';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      post: <MessageSquare className="h-4 w-4" />,
      comment: <MessageCircle className="h-4 w-4" />,
      image: <Image className="h-4 w-4" />,
    };
    return icons[type] || <MessageSquare className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Modération de contenu</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les signalements et le contenu problématique
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Signalements en attente
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeFilter === filter.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Flagged Content List */}
      <div className="space-y-3">
        {flaggedContent.map((content) => (
          <Card key={content.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar and Type */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
                    {content.avatar}
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    {getTypeIcon(content.type)}
                  </div>
                </div>

                {/* Content Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{content.title}</h4>
                      <p className="text-sm text-muted-foreground">Par {content.author}</p>
                    </div>
                    <Badge className={getStatusColor(content.status)}>
                      {content.status === 'pending' && '⏳ En attente'}
                      {content.status === 'flagged' && '🚩 Signalé'}
                      {content.status === 'resolved' && '✓ Résolu'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{content.preview}</p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      {content.reports} signalements
                    </span>
                    <span className="flex items-center gap-1">
                      <Badge variant="outline">{content.reason}</Badge>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {content.date}
                    </span>
                  </div>

                  {/* Actions */}
                  {content.status !== 'resolved' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Voir le contenu
                      </Button>
                      <Button size="sm" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4" />
                        Approuver
                      </Button>
                      <Button size="sm" variant="destructive" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>

                {/* More Options */}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Approuver tous les signalements
        </Button>
        <Button variant="destructive" className="flex-1">
          Supprimer les sélectionnés
        </Button>
      </div>
    </div>
  );
}
