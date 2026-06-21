'use client';

import { useState } from 'react';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { usePostComments, useAddComment } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeDate, cn } from '@/lib/utils';
import { Send, CornerDownRight } from 'lucide-react';
import type { Comment } from '@/types/community';

interface CommentThreadProps {
  postId: string;
}

function CommentItem({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const addComment = useAddComment();
  const { user } = useAuthStore();

  async function handleReply() {
    const text = replyText.trim();
    if (!text) return;
    await addComment.mutateAsync({ postId, content: text, parentId: comment.id });
    setReplyText('');
    setReplying(false);
  }

  return (
    <div className={cn('flex gap-2.5', depth > 0 && 'ml-8 mt-2')}>
      {depth > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/50 mt-2 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2.5">
          <UserAvatar src={comment.author?.avatar} name={comment.author?.name ?? '?'} size="sm" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="inline-block bg-muted/60 rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-full">
              <p className="text-xs font-bold text-foreground mb-0.5">{comment.author?.name ?? 'Anonyme'}</p>
              <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
            </div>
            <div className="flex items-center gap-3 mt-1 px-1">
              <span className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
              {user && (
                <button
                  onClick={() => setReplying(!replying)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Répondre
                </button>
              )}
            </div>

            {replying && (
              <div className="flex gap-2 mt-2">
                <UserAvatar src={user?.avatar} name={user?.name ?? '?'} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 flex gap-2">
                  <input
                    autoFocus
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
                    placeholder={`Répondre à ${comment.author?.name ?? 'Anonyme'}…`}
                    className="flex-1 px-3 py-1.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Button
                    size="icon"
                    onClick={handleReply}
                    disabled={!replyText.trim() || addComment.isPending}
                    className="h-8 w-8 rounded-xl bg-[#064E3B] hover:bg-[#065f46] flex-shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {comment.replies?.map(reply => (
              <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentThread({ postId }: CommentThreadProps) {
  const { user } = useAuthStore();
  const { data, fetchNextPage, hasNextPage } = usePostComments(postId);
  const addComment = useAddComment();
  const [text, setText] = useState('');

  const comments = data?.pages.flatMap(p => p.data) ?? [];

  async function handleSubmit() {
    const t = text.trim();
    if (!t) return;
    await addComment.mutateAsync({ postId, content: t });
    setText('');
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Comment input */}
      {user && (
        <div className="flex gap-2.5">
          <UserAvatar src={user.avatar} name={user.name} size="sm" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(); }}
              placeholder="Écrire un commentaire…"
              className="flex-1 px-3.5 py-2 text-sm border border-input rounded-2xl bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!text.trim() || addComment.isPending}
              className="h-9 w-9 rounded-xl bg-[#064E3B] hover:bg-[#065f46] flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} postId={postId} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors pl-10"
        >
          Afficher plus de commentaires…
        </button>
      )}
    </div>
  );
}
