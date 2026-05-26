'use client';

import { useState } from 'react';
import { MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MediaGrid } from '@/components/media/media-grid';
import { useReactToPost } from '@/hooks/use-community';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { Post } from '@/types/community';

const REACTIONS = ['👍', '❤️', '✅', '😂', '😠', '😢'];

interface PostCardProps {
  post: Post;
  onComment?: () => void;
}

export function PostCard({ post, onComment }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const reactTo = useReactToPost();

  const isLong = post.content.length > 300;
  const displayContent = isLong && !expanded ? post.content.slice(0, 300) + '...' : post.content;

  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  return (
    <article className="bg-card rounded-card border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserAvatar src={post.author.avatar} name={post.author.name} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">{post.author.name}</span>
              {post.author.badge && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">{post.author.badge}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatRelativeDate(post.created_at)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="text-sm text-foreground leading-relaxed">
          <p>{displayContent}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary text-xs mt-1 hover:underline"
            >
              {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && <MediaGrid media={post.media} />}

      {/* Poll */}
      {post.poll && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-xl">
          <p className="text-sm font-semibold">{post.poll.question}</p>
          {post.poll.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !post.poll!.has_voted && reactTo.mutate({ postId: post.id, reaction: opt.id })}
              className={cn(
                'w-full text-left rounded-lg overflow-hidden border transition-colors',
                opt.has_voted ? 'border-primary' : 'border-border hover:border-primary/50'
              )}
              disabled={post.poll!.has_voted}
            >
              <div className="relative px-3 py-2">
                <div
                  className="absolute inset-0 bg-primary/10 transition-all"
                  style={{ width: `${post.poll!.total_votes > 0 ? (opt.votes / post.poll!.total_votes) * 100 : 0}%` }}
                />
                <div className="relative flex justify-between text-sm">
                  <span>{opt.text}</span>
                  <span className="font-data font-semibold">
                    {post.poll!.total_votes > 0 ? Math.round((opt.votes / post.poll!.total_votes) * 100) : 0}%
                  </span>
                </div>
              </div>
            </button>
          ))}
          <p className="text-xs text-muted-foreground">{post.poll.total_votes} votes</p>
        </div>
      )}

      {/* Reactions summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{Object.entries(post.reactions).filter(([, v]) => v > 0).map(([k]) => k).join('')}</span>
          <span>{totalReactions}</span>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center gap-1 pt-1 border-t border-border relative">
        {/* Reactions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            onClick={() => reactTo.mutate({ postId: post.id, reaction: '👍' })}
            aria-label="Réagir"
          >
            {post.user_reaction || '👍'}
            <span>J&apos;aime</span>
          </Button>
          {showReactions && (
            <div
              className="absolute bottom-full left-0 mb-1 flex gap-1 bg-card border border-border rounded-full px-2 py-1 shadow-modal z-10"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {REACTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => reactTo.mutate({ postId: post.id, reaction: r })}
                  className="text-lg hover:scale-125 transition-transform"
                  aria-label={`Réagir avec ${r}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={onComment}
          aria-label={`${post.comments_count} commentaires`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground ml-auto" aria-label="Partager">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Enregistrer">
          <Bookmark className={cn('h-4 w-4', post.is_bookmarked && 'fill-current text-primary')} />
        </Button>
      </div>
    </article>
  );
}
