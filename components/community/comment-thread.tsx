'use client';

import { useState } from 'react';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePostComments, useAddComment } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeDate } from '@/lib/utils';
import type { Comment } from '@/types/community';

interface CommentThreadProps {
  postId: string;
}

function CommentItem({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const addComment = useAddComment();

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await addComment.mutateAsync({ postId, content: replyText, parentId: comment.id });
    setReplyText('');
    setReplying(false);
  };

  return (
    <div className="flex gap-2">
      {depth > 0 && <div className="w-px bg-border ml-4 shrink-0" aria-hidden="true" />}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2">
          <UserAvatar src={comment.author.avatar} name={comment.author.name} size="sm" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="bg-muted/50 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold">{comment.author.name}</p>
              <p className="text-sm mt-0.5">{comment.content}</p>
            </div>
            <div className="flex items-center gap-3 mt-1 px-1">
              <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
              <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Répondre
              </button>
            </div>

            {replying && (
              <div className="mt-2 flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Répondre à ${comment.author.name}...`}
                  autoResize
                  className="text-sm min-h-[36px]"
                />
                <Button size="sm" onClick={handleReply} loading={addComment.isPending}>
                  Envoyer
                </Button>
              </div>
            )}

            {comment.replies?.map((reply) => (
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

  const comments = data?.pages.flatMap((p) => p.data) || [];

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addComment.mutateAsync({ postId, content: text });
    setText('');
  };

  return (
    <div className="space-y-3">
      {/* Input */}
      {user && (
        <div className="flex gap-2">
          <UserAvatar src={user.avatar} name={user.name} size="sm" className="shrink-0" />
          <div className="flex-1 flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrire un commentaire..."
              autoResize
              className="text-sm min-h-[36px] flex-1"
            />
            <Button size="sm" onClick={handleSubmit} disabled={!text.trim()} loading={addComment.isPending}>
              Envoyer
            </Button>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} postId={postId} />
        ))}
      </div>

      {hasNextPage && (
        <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} className="w-full text-xs">
          Charger plus de commentaires
        </Button>
      )}
    </div>
  );
}
