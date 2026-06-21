'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MediaGrid } from '@/components/media/media-grid';
import { useReactToPost } from '@/hooks/use-community';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { Post, ReactionType } from '@/types/community';

const REACTIONS: { emoji: string; value: ReactionType; label: string }[] = [
  { emoji: '👍', value: 'like',       label: 'J\'aime' },
  { emoji: '❤️', value: 'love',       label: 'J\'adore' },
  { emoji: '💡', value: 'insightful', label: 'Pertinent' },
  { emoji: '🤝', value: 'support',    label: 'Soutien' },
  { emoji: '😢', value: 'sad',        label: 'Triste' },
  { emoji: '😡', value: 'angry',      label: 'En désaccord' },
];

const REACTION_EMOJI: Record<ReactionType, string> = {
  like: '👍', love: '❤️', insightful: '💡', support: '🤝', sad: '😢', angry: '😡',
};

interface PostCardProps {
  post: Post;
  onComment?: () => void;
}

export function PostCard({ post, onComment }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked ?? false);
  const reactTo = useReactToPost();
  const reactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLong = post.content.length > 320;
  const displayContent = isLong && !expanded ? post.content.slice(0, 320) + '…' : post.content;

  const totalReactions = Object.values(post.reactions ?? {}).reduce((a, b) => a + b, 0);
  const topReactions = Object.entries(post.reactions ?? {})
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => REACTION_EMOJI[k as ReactionType] ?? k);

  function openReactions() {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    setShowReactions(true);
  }
  function closeReactions() {
    reactionTimeout.current = setTimeout(() => setShowReactions(false), 150);
  }

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex items-center gap-3">
          <UserAvatar src={post.author?.avatar} name={post.author?.name ?? '?'} size="sm" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold leading-tight">{post.author?.name ?? 'Anonyme'}</span>
              {post.author?.badge && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-semibold">
                  {post.author.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeDate(post.created_at)}</p>
          </div>
        </div>
        <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed text-foreground">{displayContent}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1 hover:underline"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" />Voir moins</> : <><ChevronDown className="h-3 w-3" />Voir plus</>}
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className="px-4 pb-3">
          <MediaGrid media={post.media} />
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <div className="mx-4 mb-3 rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">{post.poll.question}</p>
          </div>
          <div className="p-3 space-y-2">
            {post.poll.options.map((opt) => {
              const pct = post.poll!.total_votes > 0 ? Math.round((opt.votes / post.poll!.total_votes) * 100) : 0;
              return (
                <button
                  key={opt.id}
                  onClick={() => !post.poll!.has_voted && reactTo.mutate({ postId: post.id, reaction: opt.id })}
                  disabled={post.poll!.has_voted}
                  className={cn(
                    'w-full text-left rounded-lg overflow-hidden border-2 transition-colors',
                    opt.has_voted ? 'border-primary' : 'border-transparent hover:border-primary/30',
                    post.poll!.has_voted ? 'cursor-default' : 'cursor-pointer'
                  )}
                >
                  <div className="relative px-3 py-2 bg-background">
                    <div
                      className={cn('absolute inset-0 transition-all', opt.has_voted ? 'bg-primary/15' : 'bg-muted/80')}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex justify-between text-sm font-medium">
                      <span>{opt.text}</span>
                      <span className="text-muted-foreground font-data text-xs">{pct}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="px-4 pb-3 text-xs text-muted-foreground">{post.poll.total_votes} votes</p>
        </div>
      )}

      {/* Link preview */}
      {post.link_preview && (
        <a
          href={post.link_preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mb-3 flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
        >
          {post.link_preview.image && (
            <Image src={post.link_preview.image} alt="" width={64} height={48} className="rounded-lg object-cover flex-shrink-0" unoptimized />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold line-clamp-1">{post.link_preview.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.link_preview.description}</p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        </a>
      )}

      {/* Reactions summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-xs text-muted-foreground">
          <span className="inline-flex">{topReactions.join('')}</span>
          <span>{totalReactions}</span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-t border-border">
        {/* Reaction button with picker */}
        <div className="relative" onMouseEnter={openReactions} onMouseLeave={closeReactions}>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => reactTo.mutate({ postId: post.id, reaction: 'like' })}
          >
            <span className="text-sm">{post.user_reaction ? REACTION_EMOJI[post.user_reaction] : '👍'}</span>
            <span>J&apos;aime</span>
          </button>
          {showReactions && (
            <div
              className="absolute bottom-full left-0 mb-2 flex gap-1 bg-card border border-border rounded-2xl px-2 py-1.5 shadow-xl z-20"
              onMouseEnter={openReactions}
              onMouseLeave={closeReactions}
            >
              {REACTIONS.map(r => (
                <button
                  key={r.value}
                  title={r.label}
                  onClick={() => reactTo.mutate({ postId: post.id, reaction: r.value })}
                  className="text-xl hover:scale-125 transition-transform px-1 py-0.5 rounded-lg hover:bg-muted"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onComment}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count > 0 ? post.comments_count : 'Commenter'}</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Partager</span>
        </button>

        <button
          className="ml-auto p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => setBookmarked(!bookmarked)}
        >
          <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current text-primary')} />
        </button>
      </div>
    </article>
  );
}
