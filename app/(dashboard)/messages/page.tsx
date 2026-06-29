'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare, Send, ChevronLeft, Search, Plus,
  Loader2, Play, Square, Smile, Pencil, Trash2, MoreHorizontal, Trash,
  Paperclip, Mic, MicOff, X, FileText, Image, File as FileIcon, BarChart3,
  UserPlus, CheckCheck,
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn, formatRelativeDate } from '@/lib/utils';
import { isBackendDown } from '@/lib/api-client';
import EmojiPicker from 'emoji-picker-react';
import {
  useConversations, useMessages, useSendPrivateMessage,
  useMarkConversationRead,
  useEditPrivateMessage, useDeletePrivateMessage, useDeleteConversation,
  useOnlineStatus, useUserOnline,
  useUploadFile, useVotePoll, useCreateConversation,
} from '@/hooks/use-messaging';
import { useAuthStore } from '@/stores/auth-store';
import type { PrivateMessage, PollData, SearchUserResult } from '@/types/messaging';

type InputMode = 'text' | 'voice' | 'poll';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
}

function isImageType(mime: string): boolean {
  return mime.startsWith('image/');
}

function VoiceRecorder({ onFinish, onCancel }: {
  onFinish: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    chunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start();
      mediaRef.current = mr;
      let sec = 0;
      timerRef.current = setInterval(() => { sec++; setDuration(sec); }, 1000) as unknown as ReturnType<typeof setInterval>;
    }).catch(() => onCancelRef.current());
    return () => { if (timerRef.current != null) clearInterval(timerRef.current); mediaRef.current?.stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop()); };
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/5 rounded-2xl border border-red-500/20">
      {!audioBlob ? (
        <>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-500">Enregistrement</span>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums font-mono bg-muted/40 px-2 py-0.5 rounded-md">{duration}s</span>
          <div className="flex-1" />
          <Button type="button" size="sm" variant="ghost" onClick={() => { mediaRef.current?.stop(); clearInterval(timerRef.current!); }} className="h-8 gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10">
            <Square className="h-3 w-3 fill-current" /> Arrêter
          </Button>
        </>
      ) : (
        <>
          <PlayAudioPreview url={audioUrl!} />
          <span className="text-xs text-muted-foreground tabular-nums font-mono">{duration}s</span>
          <div className="flex-1" />
          <Button type="button" size="sm" onClick={() => onFinish(audioBlob!)} className="h-8 gap-1.5 text-xs rounded-xl">
            <Send className="h-3 w-3" /> Envoyer
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="h-8 gap-1.5 text-xs rounded-xl">
            <X className="h-3 w-3" /> Annuler
          </Button>
        </>
      )}
    </div>
  );
}

function PlayAudioPreview({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);
  return (
    <div className="flex items-center gap-2.5">
      <button onClick={() => {
        if (!ref.current) return;
        if (playing) { ref.current.pause(); setPlaying(false); }
        else { ref.current.play(); setPlaying(true); }
      }} className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors">
        {playing ? <Square className="h-2.5 w-2.5 fill-current text-primary" /> : <Play className="h-3 w-3 ml-0.5 fill-current text-primary" />}
      </button>
      <div className="w-24 h-1.5 rounded-full bg-muted-foreground/15 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>
      <audio ref={ref} src={url} onTimeUpdate={() => {
        if (ref.current) setProgress((ref.current.currentTime / (ref.current.duration || 1)) * 100);
      }} onEnded={() => { setPlaying(false); setProgress(0); }} preload="auto" />
    </div>
  );
}

function AudioMessage({ url, duration, isMe }: { url: string; duration?: number; isMe: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);

  function toggle() {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play(); setPlaying(true); }
  }

  return (
    <div className={cn('flex items-center gap-2.5 min-w-[180px]', isMe ? 'flex-row' : 'flex-row')}>
      <button onClick={toggle} className={cn(
        'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95',
        isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/15 hover:bg-primary/25'
      )}>
        {playing
          ? <Square className="h-3 w-3 fill-current" />
          : <Play className="h-3.5 w-3.5 ml-0.5 fill-current" />
        }
      </button>
      <div className="flex-1 space-y-1.5">
        <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-200', isMe ? 'bg-white/60' : 'bg-primary')} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px]">
          <span className={cn('font-mono tabular-nums', isMe ? 'text-white/60' : 'text-muted-foreground')}>{Math.floor(currentTime)}s</span>
          {duration != null && <span className={cn('font-mono tabular-nums', isMe ? 'text-white/60' : 'text-muted-foreground')}>{Math.floor(duration)}s</span>}
        </div>
      </div>
      <audio ref={ref} src={url} onTimeUpdate={() => {
        if (ref.current) { setCurrentTime(ref.current.currentTime); setProgress((ref.current.currentTime / (ref.current.duration || 1)) * 100); }
      }} onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }} preload="none" />
    </div>
  );
}

function FileMessage({ url, name, type }: { url: string; name?: string; type?: string }) {
  const isImg = type && isImageType(type);
  const ext = (name || '').split('.').pop()?.toUpperCase() || 'FILE';
  const Icon = type?.startsWith('image/') ? Image : type?.startsWith('application/pdf') ? FileText : FileIcon;

  return (
    <div className="space-y-1.5">
      {isImg ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={name || 'Fichier'} className="max-w-[220px] max-h-[220px] rounded-xl object-cover border border-white/10 group-hover:opacity-90 transition-opacity" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-3.5 py-2.5 hover:bg-muted/40 transition-colors min-w-[180px] group"
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{name || 'Fichier'}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{ext}</p>
          </div>
        </a>
      )}
    </div>
  );
}

function PollMessage({ poll, messageId, conversationId, myUserId }: {
  poll: PollData; messageId: string; conversationId: string; myUserId?: string;
}) {
  const votePoll = useVotePoll();
  const totalVotes = Object.keys(poll.votes || {}).length;
  const myVote = myUserId ? ((poll.votes || {})[myUserId] as number | undefined) : undefined;

  return (
    <div className="space-y-3 min-w-[240px] sm:min-w-[280px]">
      <div className="flex items-start gap-2">
        <div className="h-5 w-5 rounded-md bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <BarChart3 className="h-3 w-3 text-amber-500" />
        </div>
        <p className="text-sm font-semibold leading-snug">{poll.question}</p>
      </div>
      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const count = Object.values(poll.votes || {}).filter((v) => v === i).length;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isMine = myVote === i;
          return (
            <button
              key={i}
              onClick={() => {
                if (myVote == null) votePoll.mutate({ messageId, optionIndex: i, conversationId });
              }}
              disabled={myVote != null || votePoll.isPending}
              className={cn(
                'relative w-full text-left px-3.5 py-2.5 rounded-xl border transition-all overflow-hidden',
                isMine
                  ? 'border-primary/50 bg-primary/8'
                  : 'border-border/30 hover:border-border/50 hover:bg-muted/30',
                myVote != null && 'cursor-default',
              )}
            >
              {myVote != null && (
                <div className="absolute inset-0 rounded-xl bg-primary/8 transition-all" style={{ width: `${pct}%` }} />
              )}
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {isMine && <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
                  <span className="text-sm font-medium truncate">{opt}</span>
                </div>
                {myVote != null && (
                  <span className="text-xs font-bold tabular-nums text-primary flex-shrink-0">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 inline-block" />
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function PollBuilder({ onSend, onCancel }: {
  onSend: (question: string, options: string[]) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  function addOption() { setOptions([...options, '']); }
  function setOption(i: number, v: string) { const o = [...options]; o[i] = v; setOptions(o); }
  function removeOption(i: number) { if (options.length > 2) setOptions(options.filter((_, j) => j !== i)); }

  return (
    <div className="space-y-3 p-4 bg-muted/20 rounded-2xl border border-border/40">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <BarChart3 className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Nouveau sondage</p>
      </div>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Posez votre question…"
        className="w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow placeholder:text-muted-foreground/60"
      />
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground/60 w-4 flex-shrink-0 text-center">{i + 1}</span>
            <input value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`}
              className="flex-1 rounded-xl border border-input bg-background/80 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow placeholder:text-muted-foreground/60"
            />
            {options.length > 2 && (
              <button onClick={() => removeOption(i)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={addOption} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> Ajouter une option
        </button>
        <div className="flex-1" />
        <button onClick={onCancel} className="h-8 px-3 text-xs font-medium rounded-xl hover:bg-muted transition-colors">Annuler</button>
        <button onClick={() => { if (question.trim() && options.filter(Boolean).length >= 2) onSend(question.trim(), options.filter(Boolean)); }}
          disabled={!question.trim() || options.filter(Boolean).length < 2}
          className="h-8 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          <Send className="h-3 w-3" /> Envoyer
        </button>
      </div>
    </div>
  );
}

function NewConversationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const createConv = useCreateConversation();
  const { user } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(async () => {
      try {
        const { apiClient } = await import('@/lib/api-client');
        const data = await apiClient.get<SearchUserResult[]>(`/messaging/users/search?q=${encodeURIComponent(query)}`);
        setResults(data.filter((u) => u.id !== user?.id));
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timerRef.current!);
  }, [query, user?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            Nouvelle conversation
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un utilisateur…"
            className="pl-9 rounded-xl"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto space-y-0.5 -mx-1 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : results.length === 0 && query.trim() ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-foreground">Aucun résultat</p>
              <p className="text-xs text-muted-foreground mt-1">Essayez un autre nom ou email</p>
            </div>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                onClick={async () => {
                  const conv = await createConv.mutateAsync({ userId: u.id });
                  onOpenChange(false);
                  if (conv?.id) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('conv', conv.id);
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                disabled={createConv.isPending}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group"
              >
                <UserAvatar src={u.avatar} name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  {u.email && <p className="text-xs text-muted-foreground truncate">{u.email}</p>}
                </div>
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              </button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => { ref.current = value; });
  return ref.current;
}

function MessagesInner() {
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
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioBlobRef = useRef<Blob | null>(null);
  const audioDurationRef = useRef<number>(0);
  const [voiceReady, setVoiceReady] = useState(false);

  const { data: conversations, isLoading: convsLoading } = useConversations({ refetchInterval: 15000 });
  const { data: messages, isLoading: msgsLoading } = useMessages(selectedConvId, { refetchInterval: 8000 });
  const sendMsg = useSendPrivateMessage();
  const editMsg = useEditPrivateMessage();
  const deleteMsg = useDeletePrivateMessage();
  const deleteConv = useDeleteConversation();
  const markRead = useMarkConversationRead();
  const presence = useOnlineStatus();
  const uploadFile = useUploadFile();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markReadRef = useRef(markRead);
  markReadRef.current = markRead;
  const presenceRef = useRef(presence);
  presenceRef.current = presence;

  const prevMsgCount = usePrevious(messages?.length);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const newConvId = params.get('conv');
      if (newConvId) {
        setSelectedConvId(newConvId);
        setShowMobileList(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isBackendDown()) presenceRef.current.mutate();
    const interval = setInterval(() => {
      if (!isBackendDown()) presenceRef.current.mutate();
    }, 120000);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (selectedConvId) markReadRef.current.mutate(selectedConvId);
  }, [selectedConvId]);

  useEffect(() => {
    if (prevMsgCount !== undefined && (messages?.length ?? 0) > prevMsgCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length, prevMsgCount]);

  const selectedConv = useMemo(
    () => conversations?.find((c) => c.id === selectedConvId),
    [conversations, selectedConvId],
  );

  const otherParticipant = useMemo(() => {
    if (!selectedConv || !user) return null;
    return selectedConv.participants.find((p) => p.id !== user.id) || null;
  }, [selectedConv, user]);

  const { data: otherOnlineData } = useUserOnline(otherParticipant?.id ?? null);
  const otherOnline = otherOnlineData?.online ?? otherParticipant?.is_online ?? false;

  function selectConversation(id: string) {
    setSelectedConvId(id);
    setShowMobileList(false);
    setShowEmoji(false);
    setInputMode('text');
    const url = new URL(window.location.href);
    url.searchParams.set('conv', id);
    window.history.replaceState({}, '', url.toString());
  }

  function backToList() {
    setShowMobileList(true);
    setSelectedConvId(null);
    setShowEmoji(false);
    setInputMode('text');
    setAttachedFile(null);
    audioBlobRef.current = null;
    setVoiceReady(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('conv');
    window.history.replaceState({}, '', url.pathname);
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const msg = text.trim();
    if (!selectedConvId) return;

    if (attachedFile) {
      setText('');
      setInputMode('text');
      const uploaded = await uploadFile.mutateAsync(attachedFile);
      setAttachedFile(null);
      await sendMsg.mutateAsync({
        conversationId: selectedConvId,
        content: msg || undefined,
        fileUrl: uploaded.url,
        fileName: uploaded.name,
        fileType: uploaded.type,
        messageType: 'file',
      });
      return;
    }

    if (inputMode === 'voice' && audioBlobRef.current) {
      const blob = audioBlobRef.current;
      const dur = audioDurationRef.current;
      audioBlobRef.current = null;
      audioDurationRef.current = 0;
      setVoiceReady(false);
      setInputMode('text');
      const audioFile = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
      const uploaded = await uploadFile.mutateAsync(audioFile);
      await sendMsg.mutateAsync({
        conversationId: selectedConvId,
        content: msg || undefined,
        audioUrl: uploaded.url,
        duration: dur,
        messageType: 'voice',
      });
      return;
    }

    if (!msg) return;
    setText('');
    setShowEmoji(false);
    await sendMsg.mutateAsync({ conversationId: selectedConvId, content: msg });
  }

  function handleVoiceFinish(blob: Blob) {
    audioBlobRef.current = blob;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const onMetadata = () => {
      audioDurationRef.current = isFinite(audio.duration) ? Math.round(audio.duration) : 0;
      setVoiceReady(true);
    };
    audio.addEventListener('loadedmetadata', onMetadata, { once: true });
    audio.addEventListener('error', () => {
      audioDurationRef.current = 0;
      setVoiceReady(true);
    }, { once: true });
  }

  useEffect(() => {
    if (voiceReady && audioBlobRef.current) {
      handleSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceReady]);

  async function handlePollSend(question: string, options: string[]) {
    if (!selectedConvId) return;
    setInputMode('text');
    await sendMsg.mutateAsync({
      conversationId: selectedConvId,
      messageType: 'poll',
      pollData: { question, options, votes: {} },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const autoResizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, []);

  function startEdit(m: PrivateMessage) {
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

  function cancelEdit() { setEditingMsgId(null); setEditText(''); }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setAttachedFile(f);
    e.target.value = '';
  }

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-0.75rem)] sm:h-[calc(100vh-var(--header-height)-1.5rem)] rounded-2xl border border-border/60 overflow-hidden bg-card shadow-xl shadow-black/10">
      <NewConversationDialog open={showNewConv} onOpenChange={(v) => {
        setShowNewConv(v);
        if (!v) {
          const params = new URLSearchParams(window.location.search);
          const newId = params.get('conv');
          if (newId && newId !== selectedConvId) {
            setSelectedConvId(newId);
            setShowMobileList(false);
          }
        }
      }} />

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
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => {
              if (selectedConvId) deleteConv.mutate(selectedConvId);
              setDeleteConvConfirm(false);
              backToList();
            }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Sidebar ─── */}
      <div className={cn(
        'w-full sm:w-80 lg:w-96 border-r border-border/50 flex-shrink-0 flex flex-col',
        'transition-all duration-300 ease-in-out bg-muted/5',
        showMobileList ? 'flex opacity-100' : 'hidden sm:flex sm:opacity-100',
      )}>
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-border/40 flex-shrink-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h1 className="text-base font-black tracking-tight">Messagerie</h1>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {conversations ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}` : 'Chargement…'}
              </p>
            </div>
            <button
              onClick={() => setShowNewConv(true)}
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-md shadow-primary/25"
              title="Nouvelle conversation"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher une conversation…"
              className="pl-9 h-9 text-sm rounded-xl border-border/40 bg-background/50 focus-visible:ring-primary/30 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-1">
                  <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                <MessageSquare className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold">Aucune conversation</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[180px] leading-relaxed">
                Cliquez sur le bouton + pour démarrer une nouvelle conversation
              </p>
              <button
                onClick={() => setShowNewConv(true)}
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Nouvelle conversation
              </button>
            </div>
          ) : (
            <div className="py-1.5">
              {conversations.map((conv) => {
                const other = conv.participants.find((p) => p.id !== user?.id);
                const isSelected = selectedConvId === conv.id;
                const lastMsgPreview =
                  conv.last_message?.message_type === 'voice' ? '🎤 Message vocal'
                  : conv.last_message?.message_type === 'file' ? '📎 Fichier joint'
                  : conv.last_message?.message_type === 'poll' ? '📊 Sondage'
                  : conv.last_message?.content || 'Aucun message';

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 transition-all text-left relative group',
                      'border-l-2',
                      isSelected
                        ? 'bg-primary/8 border-l-primary'
                        : 'border-l-transparent hover:bg-muted/30 hover:border-l-border',
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <UserAvatar src={other?.avatar} name={other?.name || '?'} size="sm" />
                      {other?.is_online && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-card" />
                        </span>
                      )}
                      {conv.unread_count > 0 && !other?.is_online && (
                        <span className="absolute -top-1 -right-1 h-[18px] min-w-[18px] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1 shadow-sm shadow-primary/30">
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={cn('text-sm truncate leading-tight', conv.unread_count > 0 ? 'font-bold' : 'font-semibold')}>
                          {other?.name || conv.title || 'Conversation'}
                        </p>
                        {conv.last_message?.created_at && (
                          <span className={cn(
                            'text-[10px] flex-shrink-0 font-medium tabular-nums',
                            conv.unread_count > 0 ? 'text-primary' : 'text-muted-foreground',
                          )}>
                            {formatRelativeDate(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p className={cn(
                          'text-xs truncate flex-1',
                          conv.unread_count > 0 ? 'font-semibold text-foreground/80' : 'text-muted-foreground',
                        )}>
                          {lastMsgPreview}
                        </p>
                        {conv.unread_count > 0 && other?.is_online && (
                          <span className="h-[18px] min-w-[18px] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1 flex-shrink-0">
                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main chat area ─── */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0',
        'transition-all duration-300 ease-in-out',
        showMobileList ? 'hidden sm:flex' : 'flex',
      )}>
        {!selectedConvId ? (
          /* Empty / no selection state */
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-muted/20 to-transparent">
            <div className="text-center max-w-sm space-y-5">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative h-20 w-20 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-9 w-9 text-primary/60" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Vos messages</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
                  Sélectionnez une conversation ou cliquez sur le bouton{' '}
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary/15 text-primary text-xs font-bold">+</span>{' '}
                  pour en démarrer une nouvelle
                </p>
              </div>
              <button
                onClick={() => setShowNewConv(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all active:scale-95 shadow-md shadow-primary/25"
              >
                <UserPlus className="h-4 w-4" />
                Nouvelle conversation
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ─── Chat header ─── */}
            <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-border/40 flex-shrink-0 bg-background/60 backdrop-blur-md">
              <button
                onClick={backToList}
                className="sm:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors -ml-1 active:scale-95"
                aria-label="Retour"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="relative flex-shrink-0">
                <UserAvatar src={otherParticipant?.avatar} name={otherParticipant?.name || '?'} size="sm" />
                {otherOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{selectedConv?.title || otherParticipant?.name || 'Conversation'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', otherOnline ? 'bg-green-500' : 'bg-muted-foreground/40')} />
                  <p className={cn('text-[11px] font-medium', otherOnline ? 'text-green-500' : 'text-muted-foreground')}>
                    {otherOnline ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted/60">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setDeleteConvConfirm(true)} className="gap-2.5 text-destructive focus:text-destructive rounded-lg">
                    <Trash className="h-4 w-4" /> Supprimer la conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ─── Messages ─── */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 scroll-smooth bg-gradient-to-b from-transparent via-transparent to-muted/5">
              {msgsLoading ? (
                <div className="space-y-4 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn('flex gap-2.5', i % 2 === 0 ? 'flex-row-reverse' : '')}>
                      <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                      <Skeleton className={cn('h-12 rounded-2xl', i % 2 === 0 ? 'w-44' : 'w-56')} />
                    </div>
                  ))}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Aucun message</p>
                    <p className="text-xs text-muted-foreground mt-1">Soyez le premier à écrire !</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((m, i) => {
                    const isMe = m.sender_id === user?.id;
                    const showAvatar = i === 0 || messages[i - 1].sender_id !== m.sender_id;
                    const nextIsSame = i < messages.length - 1 && messages[i + 1].sender_id === m.sender_id;
                    const isVoice = m.message_type === 'voice';
                    const isPoll = m.message_type === 'poll';
                    const isFile = m.message_type === 'file' || (!!m.file_url && m.message_type !== 'voice');
                    const isEditing = editingMsgId === m.id;
                    const isDeleting = deleteConfirm === m.id;

                    return (
                      <div
                        key={m.id}
                        className={cn(
                          'flex gap-2 group items-end',
                          isMe ? 'flex-row-reverse' : 'flex-row',
                          nextIsSame ? 'mb-0.5' : 'mb-2',
                        )}
                      >
                        {/* Other sender avatar */}
                        {!isMe && (
                          <div className={cn('w-7 flex-shrink-0 flex items-end pb-0.5', showAvatar ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
                            {showAvatar && (
                              <UserAvatar src={m.sender_avatar} name={m.sender_name} size="sm" />
                            )}
                          </div>
                        )}

                        <div className={cn('flex flex-col max-w-[78%] sm:max-w-[68%] lg:max-w-[58%]', isMe ? 'items-end' : 'items-start')}>
                          {showAvatar && !isMe && (
                            <span className="text-[10px] font-bold text-muted-foreground/70 ml-1 mb-1">{m.sender_name}</span>
                          )}

                          {/* Edit/delete action buttons */}
                          {isMe && !isEditing && !isDeleting && (
                            <div className="flex gap-0.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              {m.message_type === 'text' && (
                                <button
                                  onClick={() => startEdit(m)}
                                  className="h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
                                  title="Modifier"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteConfirm(m.id)}
                                className="h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Delete confirmation inline */}
                          {isDeleting && (
                            <span className="flex gap-1.5 mb-1.5">
                              <button
                                onClick={() => { if (selectedConvId) deleteMsg.mutate({ conversationId: selectedConvId, messageId: m.id }); setDeleteConfirm(null); }}
                                className="h-7 px-3 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all active:scale-95"
                              >
                                Supprimer
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="h-7 px-3 text-xs font-semibold rounded-lg hover:bg-muted transition-colors"
                              >
                                Annuler
                              </button>
                            </span>
                          )}

                          {/* Edit mode */}
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 min-w-[220px] sm:min-w-[280px]">
                              <textarea
                                ref={editInputRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onInput={(e) => autoResizeTextarea(e.currentTarget)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirmEdit(); } if (e.key === 'Escape') cancelEdit(); }}
                                rows={2}
                                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={cancelEdit} className="h-8 px-3 text-xs font-semibold rounded-xl hover:bg-muted transition-colors">Annuler</button>
                                <button
                                  onClick={confirmEdit}
                                  disabled={!editText.trim() || editMsg.isPending}
                                  className="h-8 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1.5"
                                >
                                  {editMsg.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Enregistrer'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Message bubble */
                            <div className={cn(
                              'px-3.5 py-2.5 text-sm leading-relaxed break-words space-y-1.5',
                              isVoice
                                ? cn('border rounded-2xl', isMe ? 'border-white/15 bg-primary/90' : 'border-border/30 bg-muted/40')
                                : (isFile && !m.content)
                                  ? 'bg-transparent p-1.5'
                                  : isMe
                                    ? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/20 rounded-2xl rounded-tr-md'
                                    : 'bg-muted/50 border border-border/20 shadow-sm rounded-2xl rounded-tl-md',
                            )}>
                              {isVoice && m.audio_url && <AudioMessage url={m.audio_url} duration={m.audio_duration} isMe={isMe} />}
                              {isPoll && m.poll_data && <PollMessage poll={m.poll_data} messageId={m.id} conversationId={selectedConvId!} myUserId={user?.id} />}
                              {isFile && m.file_url && <FileMessage url={m.file_url} name={m.file_name} type={m.file_type} />}
                              {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                            </div>
                          )}

                          {/* Timestamp + status */}
                          {!isEditing && m.created_at && (
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mt-1 px-1">
                              {formatRelativeDate(m.created_at)}
                              {m.is_edited && <span className="italic opacity-70">(modifié)</span>}
                              {isMe && <CheckCheck className="h-3 w-3 text-primary/50" />}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* ─── Attached file preview ─── */}
            {attachedFile && (
              <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border/40 bg-muted/10">
                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/30">
                  {attachedFile.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={URL.createObjectURL(attachedFile)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary/70" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{attachedFile.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatBytes(attachedFile.size)}</p>
                </div>
                <button onClick={() => setAttachedFile(null)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* ─── Emoji picker ─── */}
            {showEmoji && (
              <div className="border-t border-border/40 flex-shrink-0">
                <div className="h-64 overflow-y-auto">
                  <EmojiPicker onEmojiClick={(e) => { setText((t) => t + e.emoji); inputRef.current?.focus(); }} lazyLoadEmojis width="100%" height="260px" skinTonesDisabled />
                </div>
              </div>
            )}

            {/* ─── Poll builder ─── */}
            {inputMode === 'poll' && (
              <div className="border-t border-border/40 flex-shrink-0 px-4 py-3">
                <PollBuilder onSend={handlePollSend} onCancel={() => setInputMode('text')} />
              </div>
            )}

            {/* ─── Voice recorder ─── */}
            {inputMode === 'voice' && !voiceReady && (
              <div className="border-t border-border/40 flex-shrink-0 px-4 py-3">
                <VoiceRecorder onFinish={handleVoiceFinish} onCancel={() => {
                  setInputMode('text');
                  audioBlobRef.current = null;
                  setVoiceReady(false);
                }} />
              </div>
            )}

            {/* ─── Input area ─── */}
            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 px-3 sm:px-4 py-3 border-t border-border/40 flex-shrink-0 bg-background/70 backdrop-blur-md"
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

              {/* Action buttons */}
              <div className="flex items-center gap-0.5 pb-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all active:scale-95"
                  title="Joindre un fichier"
                >
                  <Paperclip className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-95',
                    inputMode === 'voice'
                      ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                  title="Message vocal"
                >
                  {inputMode === 'voice' ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode(inputMode === 'poll' ? 'text' : 'poll')}
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-95',
                    inputMode === 'poll'
                      ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                  title="Créer un sondage"
                >
                  <BarChart3 className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmoji((e) => !e)}
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-95',
                    showEmoji
                      ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                  title="Émojis"
                >
                  <Smile className="h-[18px] w-[18px]" />
                </button>
              </div>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onInput={(e) => autoResizeTextarea(e.currentTarget)}
                onKeyDown={handleKeyDown}
                placeholder={inputMode === 'voice' ? 'Ajouter un message (optionnel)…' : 'Écrire un message…'}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-input/60 bg-muted/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 max-h-28 overflow-y-auto transition-all placeholder:text-muted-foreground/60"
                style={{ lineHeight: '1.5', minHeight: '40px' }}
              />

              {/* Send button */}
              <Button
                type="submit"
                size="icon"
                disabled={(!text.trim() && !attachedFile && !voiceReady) || sendMsg.isPending || uploadFile.isPending}
                className="h-10 w-10 flex-shrink-0 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/25 disabled:shadow-none"
              >
                {(sendMsg.isPending || uploadFile.isPending)
                  ? <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  : <Send className="h-[18px] w-[18px]" />
                }
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100dvh-var(--header-height)-0.75rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary/60" />
          <p className="text-xs text-muted-foreground font-medium">Chargement de la messagerie…</p>
        </div>
      </div>
    }>
      <MessagesInner />
    </Suspense>
  );
}
