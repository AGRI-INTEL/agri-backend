'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare, Send, ChevronLeft, Search,
  Loader2, Play, Square, Smile, Pencil, Trash2, MoreHorizontal, Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import EmojiPicker from 'emoji-picker-react';
import {
  useConversations, useMessages, useSendPrivateMessage,
  useMarkConversationRead,
  useEditPrivateMessage, useDeletePrivateMessage, useDeleteConversation,
  useOnlineStatus, useUserOnline,
} from '@/hooks/use-messaging';
import { useAuthStore } from '@/stores/auth-store';
import { cn, formatRelativeDate } from '@/lib/utils';
import { isBackendDown } from '@/lib/api-client';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const searchParams = useSearchParams();
  const convParam = searchParams.get('conv');

  const [selectedConvId, setSelectedConvId] = useState<string | null>(convParam);
  const [showMobileList, setShowMobileList] = useState(!convParam);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConvConfirm, setDeleteConvConfirm] = useState(false);

  const { data: conversations, isLoading: convsLoading } = useConversations({ refetchInterval: 15000 });
  const { data: messages, isLoading: msgsLoading } = useMessages(selectedConvId, { refetchInterval: 5000 });
  const sendMsg = useSendPrivateMessage();
  const editMsg = useEditPrivateMessage();
  const deleteMsg = useDeletePrivateMessage();
  const deleteConv = useDeleteConversation();
  const markRead = useMarkConversationRead();
  const presence = useOnlineStatus();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Presence heartbeat every 2 minutes
  useEffect(() => {
    if (!mounted) return;
    if (!isBackendDown()) presence.mutate();
    const interval = setInterval(() => {
      if (!isBackendDown()) presence.mutate();
    }, 120000);
    return () => clearInterval(interval);
  }, [mounted, presence]);

  const selectedConv = useMemo(
    () => conversations?.find(c => c.id === selectedConvId),
    [conversations, selectedConvId]
  );

  const otherParticipant = useMemo(() => {
    if (!selectedConv || !user) return null;
    return selectedConv.participants.find(p => p.id !== user.id) || null;
  }, [selectedConv, user]);

  const { data: otherOnlineData } = useUserOnline(otherParticipant?.id ?? null);
  const otherOnline = otherOnlineData?.online ?? otherParticipant?.is_online ?? false;

  useEffect(() => {
    if (selectedConvId) markRead.mutate(selectedConvId);
  }, [selectedConvId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length]);

  function selectConversation(id: string) {
    setSelectedConvId(id);
    setShowMobileList(false);
    setShowEmoji(false);
    // Clean URL param
    const url = new URL(window.location.href);
    url.searchParams.delete('conv');
    window.history.replaceState({}, '', url.pathname);
  }

  function backToList() {
    setShowMobileList(true);
    setSelectedConvId(null);
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg || !selectedConvId) return;
    setText('');
    setShowEmoji(false);
    await sendMsg.mutateAsync({ conversationId: selectedConvId, content: msg });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function startEdit(m: { id: string; content?: string | null }) {
    setEditingMsgId(m.id);
    setEditText(m.content ?? '');
    setTimeout(() => editInputRef.current?.focus(), 50);
  }

  async function confirmEdit() {
    if (!editingMsgId || !editText.trim() || !selectedConvId) return;
    await editMsg.mutateAsync({ conversationId: selectedConvId, messageId: editingMsgId, content: editText.trim() });
    setEditingMsgId(null);
    setEditText('');
  }

  function cancelEdit() {
    setEditingMsgId(null);
    setEditText('');
  }

  function getOtherParticipantName(): string {
    if (selectedConv?.title) return selectedConv.title;
    const other = selectedConv?.participants.find(p => p.id !== user?.id);
    return other?.name || 'Conversation';
  }

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-2rem)] rounded-2xl border border-border overflow-hidden bg-card">
      {/* Delete conversation confirm */}
      <AlertDialog open={deleteConvConfirm} onOpenChange={setDeleteConvConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              La conversation sera supprimée de votre liste. L&apos;autre personne pourra toujours y accéder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedConvId) deleteConv.mutate(selectedConvId);
                setDeleteConvConfirm(false);
                backToList();
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar */}
      <div className={cn(
        'w-full sm:w-80 lg:w-96 border-r border-border flex-shrink-0 flex flex-col',
        showMobileList ? 'flex' : 'hidden sm:flex'
      )}>
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-lg font-black mb-3">Messagerie</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher…" className="pl-9 h-9 text-sm rounded-xl" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <EmptyState
              icon="💬"
              title="Aucune conversation"
              description="Cliquez sur 'Contacter' sur le profil d'un acteur pour démarrer une conversation."
            />
          ) : (
            conversations.map(conv => {
              const other = conv.participants.find(p => p.id !== user?.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50',
                    selectedConvId === conv.id && 'bg-muted/80'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <UserAvatar src={other?.avatar} name={other?.name || '?'} size="sm" />
                    {other?.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                    )}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-[#D97706] text-[9px] font-bold text-white px-1">
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{other?.name || conv.title || 'Conversation'}</p>
                      {conv.last_message?.created_at && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatRelativeDate(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className={cn('text-xs truncate mt-0.5', conv.unread_count > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                      {conv.last_message?.content || 'Aucun message'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main */}
      <div className={cn('flex-1 flex flex-col', showMobileList ? 'hidden sm:flex' : 'flex')}>
        {!selectedConvId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold">Messagerie</h2>
              <p className="text-sm text-muted-foreground mt-1">Sélectionnez une conversation ou contactez un acteur</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
              <button onClick={backToList} className="sm:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="relative flex-shrink-0">
                <UserAvatar src={otherParticipant?.avatar} name={otherParticipant?.name || '?'} size="sm" />
                {otherOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{getOtherParticipantName()}</p>
                <p className="text-[10px] text-muted-foreground">{otherOnline ? 'En ligne' : 'Hors ligne'}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDeleteConvConfirm(true)} className="gap-2 text-red-600 focus:text-red-600">
                    <Trash className="h-4 w-4" /> Supprimer la conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              {msgsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'flex-row-reverse' : '')}>
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-56')} />
                    </div>
                  ))}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Aucun message. Écrivez le premier !</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_id === user?.id;
                  const showAvatar = i === 0 || messages[i - 1].sender_id !== m.sender_id;
                  const isVoice = m.message_type === 'voice';
                  const isEditing = editingMsgId === m.id;
                  const isDeleting = deleteConfirm === m.id;

                  return (
                    <div key={m.id} className={cn('flex gap-2 group', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      {!isMe && (
                        <div className="w-7 flex-shrink-0 flex items-end">
                          {showAvatar && <UserAvatar src={m.sender_avatar} name={m.sender_name} size="sm" />}
                        </div>
                      )}

                      <div className={cn('flex flex-col max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                        {showAvatar && !isMe && (
                          <span className="text-[10px] font-bold text-muted-foreground ml-1 mb-0.5">{m.sender_name}</span>
                        )}

                        {/* Actions: edit / delete self messages */}
                        {isMe && !isEditing && !isDeleting && (
                          <div className={cn('flex gap-0.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity', isMe ? 'flex-row' : 'flex-row-reverse')}>
                            <button onClick={() => startEdit(m)} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Modifier">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => setDeleteConfirm(m.id)} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" title="Supprimer">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Delete confirmation */}
                        {isDeleting && (
                          <span className="flex gap-1 mb-1">
                            <button onClick={() => { if (selectedConvId) deleteMsg.mutate({ conversationId: selectedConvId, messageId: m.id }); setDeleteConfirm(null); }} className="h-6 px-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                              Supprimer
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="h-6 px-2 text-xs font-semibold rounded-lg hover:bg-muted transition-colors">
                              Annuler
                            </button>
                          </span>
                        )}

                        {/* Bubble */}
                        {isEditing ? (
                          <div className="flex flex-col gap-1 min-w-[200px]">
                            <textarea
                              ref={editInputRef}
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirmEdit(); } if (e.key === 'Escape') cancelEdit(); }}
                              rows={2}
                              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <div className="flex gap-1 justify-end">
                              <button onClick={cancelEdit} className="h-7 px-2 text-xs font-semibold rounded-lg hover:bg-muted transition-colors">Annuler</button>
                              <button onClick={confirmEdit} disabled={!editText.trim() || editMsg.isPending} className="h-7 px-2 text-xs font-semibold rounded-lg bg-[#064E3B] text-white hover:bg-[#065f46] transition-colors disabled:opacity-50">
                                {editMsg.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enregistrer'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={cn('px-3.5 py-2 text-sm leading-relaxed break-words',
                            isVoice ? 'bg-transparent border border-border rounded-2xl' :
                            isMe ? 'bg-[#064E3B] text-white rounded-2xl rounded-tr-sm' : 'bg-muted rounded-2xl rounded-tl-sm'
                          )}>
                            {isVoice && m.audio_url ? <AudioMessageUI url={m.audio_url} duration={m.audio_duration} /> : m.content}
                          </div>
                        )}

                        {/* Time + edited */}
                        {!isEditing && m.created_at && (
                          <span className="text-[10px] text-muted-foreground mt-0.5 px-1 flex items-center gap-1">
                            {formatRelativeDate(m.created_at)}
                            {m.is_edited && <span className="italic">(modifié)</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div className="border-t border-border flex-shrink-0">
                <div className="h-64 overflow-y-auto">
                  <EmojiPicker onEmojiClick={(e) => { setText(t => t + e.emoji); inputRef.current?.focus(); }} lazyLoadEmojis width="100%" height="260px" skinTonesDisabled />
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-end gap-2 px-3 py-3 border-t border-border flex-shrink-0">
              <button type="button" onClick={() => setShowEmoji(e => !e)} className={cn('h-9 w-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0',
                showEmoji ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40' : 'text-muted-foreground hover:bg-muted'
              )}>
                <Smile className="h-5 w-5" />
              </button>
              <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Écrire un message…" rows={1}
                className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24 overflow-y-auto"
                style={{ lineHeight: '1.4' }}
              />
              <Button type="submit" size="icon" disabled={!text.trim() || sendMsg.isPending}
                className="h-9 w-9 flex-shrink-0 bg-[#064E3B] hover:bg-[#065f46] rounded-xl">
                {sendMsg.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function AudioMessageUI({ url, duration }: { url: string; duration?: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <button onClick={() => {
        if (!audioRef.current) return;
        if (playing) { audioRef.current.pause(); setPlaying(false); }
        else { audioRef.current.play(); setPlaying(true); }
      }} className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 hover:bg-primary/30 transition-colors">
        {playing ? <Square className="h-2.5 w-2.5 fill-current" /> : <Play className="h-3 w-3 ml-0.5 fill-current" />}
      </button>
      <div className="flex-1 h-1 rounded-full bg-muted-foreground/20 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
      {duration != null && <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">{Math.floor(duration)}s</span>}
      <audio ref={audioRef} src={url} onTimeUpdate={() => {
        if (audioRef.current) setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
      }} onEnded={() => { setPlaying(false); setProgress(0); }} preload="none" />
    </div>
  );
}
