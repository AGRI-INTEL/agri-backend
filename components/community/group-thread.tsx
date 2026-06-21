'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGroupMessages, useSendGroupMessage } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, RefreshCw, Smile } from 'lucide-react';
import { formatRelativeDate, cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  author_id?: string;
  user_id?: string;
  author?: { name?: string; avatar?: string };
  user?: { name?: string; avatar?: string };
  author_name?: string;
  created_at?: string;
  content?: string;
  message?: string;
}

const QUICK_EMOJIS = ['👍', '🌾', '✅', '🐄', '🐟', '🌳'];

function groupByDate(messages: Message[]): { date: string; items: Message[] }[] {
  const groups: Record<string, Message[]> = {};
  for (const m of messages) {
    const key = m.created_at ? new Date(m.created_at).toDateString() : 'Aujourd\'hui';
    (groups[key] ??= []).push(m);
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

interface GroupThreadProps {
  groupId: string;
}

export function GroupThread({ groupId }: GroupThreadProps) {
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useGroupMessages(groupId, { refetchInterval: 5000 });
  const send = useSendGroupMessage();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages: Message[] = Array.isArray(data) ? data : [];
  const grouped = useMemo(() => groupByDate(messages), [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    setText('');
    await send.mutateAsync({ groupId, content: msg });
    setTimeout(() => refetch(), 400);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border overflow-hidden bg-card" style={{ height: 520 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm font-bold">Chat en direct</p>
        </div>
        <button
          onClick={() => refetch()}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'flex-row-reverse' : '')}>
                <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-56')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">💬</div>
            <div>
              <p className="text-sm font-semibold">Pas encore de messages</p>
              <p className="text-xs text-muted-foreground mt-0.5">Soyez le premier à écrire dans ce groupe !</p>
            </div>
          </div>
        ) : (
          grouped.map(({ date, items }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-1 bg-muted/60 rounded-full">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-1.5">
                {items.map((m, i) => {
                  const isMe = m.author_id === user?.id || m.user_id === user?.id;
                  const name = m.author?.name || m.user?.name || m.author_name || 'Anonyme';
                  const avatar = m.author?.avatar || m.user?.avatar;
                  const body = m.content || m.message || '';
                  const time = m.created_at ? formatRelativeDate(m.created_at) : '';

                  const prevMsg = items[i - 1];
                  const prevIsMe = prevMsg && (prevMsg.author_id === user?.id || prevMsg.user_id === user?.id);
                  const showAvatar = !isMe && (!prevMsg || prevIsMe || (prevMsg.author_id ?? prevMsg.user_id) !== (m.author_id ?? m.user_id));

                  return (
                    <div key={m.id || i} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      {/* Avatar spacer for grouped messages */}
                      {!isMe && (
                        <div className="w-7 flex-shrink-0 flex items-end">
                          {showAvatar && (
                            <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-primary/20 text-xs font-bold flex-shrink-0">
                              {avatar
                                ? <Image src={avatar} alt={name} width={28} height={28} className="object-cover" />
                                : name.charAt(0).toUpperCase()
                              }
                            </div>
                          )}
                        </div>
                      )}

                      <div className={cn('flex flex-col max-w-[70%]', isMe ? 'items-end' : 'items-start')}>
                        {showAvatar && !isMe && (
                          <span className="text-[10px] font-bold text-muted-foreground ml-1 mb-0.5">{name}</span>
                        )}
                        <div className={cn(
                          'px-3.5 py-2 text-sm leading-relaxed break-words',
                          isMe
                            ? 'bg-[#064E3B] text-white rounded-2xl rounded-tr-sm'
                            : 'bg-muted rounded-2xl rounded-tl-sm'
                        )}>
                          {body}
                        </div>
                        {time && (
                          <span className="text-[10px] text-muted-foreground mt-0.5 px-1">{time}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick emojis */}
      {showEmoji && (
        <div className="flex gap-1 px-4 py-2 border-t border-border bg-muted/30 flex-shrink-0">
          {QUICK_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => { setText(t => t + e); setShowEmoji(false); inputRef.current?.focus(); }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-2 px-3 py-3 border-t border-border flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowEmoji(e => !e)}
          className={cn('h-9 w-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0',
            showEmoji ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40' : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <Smile className="h-5 w-5" />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24 overflow-y-auto"
          style={{ lineHeight: '1.4' }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || send.isPending}
          className="h-9 w-9 flex-shrink-0 bg-[#064E3B] hover:bg-[#065f46] rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default GroupThread;
