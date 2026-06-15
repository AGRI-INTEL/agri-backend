'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGroupMessages, useSendGroupMessage } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, RefreshCw } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
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

interface GroupThreadProps {
  groupId: string;
}

export function GroupThread({ groupId }: GroupThreadProps) {
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useGroupMessages(groupId, {
    refetchInterval: 5000,
  });
  const send = useSendGroupMessage();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages: Message[] = Array.isArray(data) ? data : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText('');
    await send.mutateAsync({ groupId, content: msg });
    setTimeout(() => refetch(), 300);
  };

  return (
    <div className="flex flex-col h-[500px] bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <p className="text-sm font-semibold">Chat du groupe</p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">En direct</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-3/4" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground text-center">
              Aucun message encore.<br />Soyez le premier à écrire !
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.author_id === user?.id || m.user_id === user?.id;
            const authorName = m.author?.name || m.user?.name || m.author_name || 'Anonyme';
            const authorAvatar = m.author?.avatar || m.user?.avatar;
            const time = m.created_at ? formatRelativeDate(m.created_at) : '';
            const content = m.content || m.message || '';

            return (
              <div key={m.id || i} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {authorAvatar
                      ? <Image src={authorAvatar} alt={authorName} width={28} height={28} className="h-full w-full object-cover rounded-full" />
                      : authorName.charAt(0).toUpperCase()
                    }
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!isMe && (
                    <span className="text-xs text-muted-foreground font-medium">{authorName}</span>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm break-words ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}>
                    {content}
                  </div>
                  {time && <span className="text-xs text-muted-foreground">{time}</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || send.isPending}
            className="h-9 px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default GroupThread;
