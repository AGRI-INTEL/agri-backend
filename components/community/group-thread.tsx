'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGroupMessages, useSendGroupMessage, useEditGroupMessage, useDeleteGroupMessage } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Send, RefreshCw, Smile, Pencil, Trash2, Check, X, Play, Square, Loader2
} from 'lucide-react';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';
import { formatRelativeDate, cn } from '@/lib/utils';

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
  message_type?: string;
  is_edited?: boolean;
  audio_url?: string;
  audio_duration?: number;
}

function groupByDate(messages: Message[]): { date: string; items: Message[] }[] {
  const groups: Record<string, Message[]> = {};
  for (const m of messages) {
    const key = m.created_at ? new Date(m.created_at).toDateString() : "Aujourd'hui";
    (groups[key] ??= []).push(m);
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

interface GroupThreadProps {
  groupId: string;
}

function AudioMessage({ url, duration }: { url: string; duration?: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button
        onClick={togglePlay}
        className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 hover:bg-primary/30 transition-colors"
      >
        {playing ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3.5 w-3.5 ml-0.5 fill-current" />}
      </button>
      <div className="flex-1 h-1.5 rounded-full bg-muted-foreground/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      {duration != null && (
        <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0 w-8 text-right">
          {Math.floor(duration)}s
        </span>
      )}
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
          }
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        preload="none"
      />
    </div>
  );
}

export function GroupThread({ groupId }: GroupThreadProps) {
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useGroupMessages(groupId, { refetchInterval: 5000 });
  const send = useSendGroupMessage();
  const editMsg = useEditGroupMessage();
  const deleteMsg = useDeleteGroupMessage();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useMemo<Message[]>(() => (Array.isArray(data) ? data : []), [data]);
  const grouped = useMemo(() => groupByDate(messages), [messages]);

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

  function startEdit(m: Message) {
    setEditingId(m.id);
    setEditText(m.content || m.message || '');
    setTimeout(() => editInputRef.current?.focus(), 50);
  }

  async function confirmEdit() {
    if (!editingId || !editText.trim()) return;
    await editMsg.mutateAsync({ groupId, messageId: editingId, content: editText.trim() });
    setEditingId(null);
    setEditText('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirmEdit();
    }
    if (e.key === 'Escape') {
      cancelEdit();
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
                  const msgType = m.message_type || 'text';
                  const isVoice = msgType === 'voice';
                  const isEditing = editingId === m.id;

                  const prevMsg = items[i - 1];
                  const prevIsMe = prevMsg && (prevMsg.author_id === user?.id || prevMsg.user_id === user?.id);
                  const showAvatar = !isMe && (!prevMsg || prevIsMe || (prevMsg.author_id ?? prevMsg.user_id) !== (m.author_id ?? m.user_id));

                  return (
                    <div key={m.id || i} className={cn('flex gap-2 group', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      {/* Avatar */}
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

                      <div className={cn('flex flex-col max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                        {showAvatar && !isMe && (
                          <span className="text-[10px] font-bold text-muted-foreground ml-1 mb-0.5">{name}</span>
                        )}

                        {/* Edit/Delete actions */}
                        {isMe && !isEditing && (
                          <div className={cn(
                            'flex gap-0.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                            isMe ? 'flex-row' : 'flex-row-reverse'
                          )}>
                            <button
                              onClick={() => startEdit(m)}
                              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            {deletingId === m.id ? (
                              <span className="flex gap-0.5">
                                <button
                                  onClick={() => {
                                    deleteMsg.mutate({ groupId, messageId: m.id });
                                    setDeletingId(null);
                                  }}
                                  className="h-6 w-6 flex items-center justify-center rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                  title="Confirmer"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                  title="Annuler"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ) : (
                              <button
                                onClick={() => setDeletingId(m.id)}
                                className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Bubble */}
                        {isEditing ? (
                          <div className="flex flex-col gap-1 min-w-[200px]">
                            <textarea
                              ref={editInputRef}
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              rows={2}
                              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={cancelEdit}
                                className="h-7 px-2 text-xs font-semibold rounded-lg hover:bg-muted transition-colors"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={confirmEdit}
                                disabled={!editText.trim() || editMsg.isPending}
                                className="h-7 px-2 text-xs font-semibold rounded-lg bg-[#064E3B] text-white hover:bg-[#065f46] transition-colors disabled:opacity-50"
                              >
                                {editMsg.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enregistrer'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={cn(
                            'px-3.5 py-2 text-sm leading-relaxed break-words',
                            isVoice ? 'bg-transparent border border-border rounded-2xl' :
                            isMe
                              ? 'bg-[#064E3B] text-white rounded-2xl rounded-tr-sm'
                              : 'bg-muted rounded-2xl rounded-tl-sm'
                          )}>
                            {isVoice && m.audio_url ? (
                              <AudioMessage url={m.audio_url} duration={m.audio_duration} />
                            ) : (
                              body
                            )}
                          </div>
                        )}

                        {/* Time + edited indicator */}
                        {!isEditing && time && (
                          <span className="text-[10px] text-muted-foreground mt-0.5 px-1 flex items-center gap-1">
                            {time}
                            {m.is_edited && <span className="italic">(modifié)</span>}
                          </span>
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

      {/* Emoji picker */}
      {showEmoji && (
        <div className="border-t border-border flex-shrink-0">
          <div className="h-56 overflow-y-auto">
            <EmojiPicker
              onEmojiClick={(e) => {
                setText(t => t + e.emoji);
                inputRef.current?.focus();
              }}
              lazyLoadEmojis
              width="100%"
              height="220px"
              skinTonesDisabled
            />
          </div>
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
