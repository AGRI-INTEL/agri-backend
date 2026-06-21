'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Film, Mic, FileText, Send, BarChart2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { useCreatePost } from '@/hooks/use-community';
import { cn } from '@/lib/utils';
import type { PostMedia } from '@/types/community';

type ComposerTab = 'text' | 'media' | 'poll';

interface PostComposerProps {
  groupId: string;
  className?: string;
}

export function PostComposer({ groupId, className }: PostComposerProps) {
  const { user } = useAuthStore();
  const createPost = useCreatePost();
  const [content, setContent] = useState('');
  const [tab, setTab] = useState<ComposerTab>('text');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<PostMedia[]>([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [focused, setFocused] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  function addFiles(files: File[], type: PostMedia['type']) {
    const newFiles = Array.from(files).slice(0, 10 - mediaFiles.length);
    setMediaFiles(p => [...p, ...newFiles]);
    const previews: PostMedia[] = newFiles.map(f => ({
      id: URL.createObjectURL(f),
      type,
      url: URL.createObjectURL(f),
      filename: f.name,
      size: f.size,
    }));
    setMediaPreviews(p => [...p, ...previews]);
    setTab('media');
    setFocused(true);
  }

  function removeMedia(id: string) {
    setMediaPreviews(p => p.filter(m => m.id !== id));
    setMediaFiles(p => {
      const idx = mediaPreviews.findIndex(m => m.id === id);
      return p.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit() {
    const hasContent = content.trim() || mediaFiles.length > 0 || (tab === 'poll' && pollQuestion.trim());
    if (!hasContent) return;

    const fd = new FormData();
    fd.append('content', content);
    fd.append('group_id', groupId);
    if (tab === 'poll' && pollQuestion.trim()) {
      fd.append('poll_question', pollQuestion);
      pollOptions.filter(o => o.trim()).forEach(o => fd.append('poll_options', o));
    }
    mediaFiles.forEach(f => fd.append('files', f));

    await createPost.mutateAsync(fd);
    setContent('');
    setMediaFiles([]);
    setMediaPreviews([]);
    setPollQuestion('');
    setPollOptions(['', '']);
    setFocused(false);
    setTab('text');
  }

  if (!user) return null;

  const TABS: { id: ComposerTab; icon: React.ElementType; label: string }[] = [
    { id: 'text',  icon: Send,      label: 'Texte' },
    { id: 'media', icon: ImageIcon, label: 'Média' },
    { id: 'poll',  icon: BarChart2, label: 'Sondage' },
  ];

  return (
    <div className={cn('bg-card rounded-2xl border border-border overflow-hidden', className)}>
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setFocused(true); }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors flex-1 justify-center',
              tab === t.id
                ? 'border-b-2 border-[#D97706] text-[#D97706] bg-amber-50/50 dark:bg-amber-950/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <UserAvatar src={user.avatar} name={user.name} size="sm" className="shrink-0 mt-1" />
          <div className="flex-1 min-w-0 space-y-3">

            {/* Text input */}
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder={
                tab === 'poll' ? 'Contexte du sondage (optionnel)...' :
                'Partagez une information, une question, une expérience...'
              }
              autoResize
              className={cn(
                'border-0 bg-muted/40 rounded-xl resize-none transition-all placeholder:text-muted-foreground/60',
                focused ? 'min-h-[80px]' : 'min-h-[42px]'
              )}
            />

            {/* Poll builder */}
            {tab === 'poll' && focused && (
              <div className="space-y-2 p-3 bg-muted/40 rounded-xl border border-border">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question du sondage</label>
                <input
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  placeholder="Quelle est votre question ?"
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Options</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={opt}
                        onChange={e => setPollOptions(p => p.map((o, j) => j === i ? e.target.value : o))}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 px-3 py-1.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {pollOptions.length > 2 && (
                        <button onClick={() => setPollOptions(p => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 5 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPollOptions(p => [...p, ''])} className="w-full gap-2 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Ajouter une option
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Media previews */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaPreviews.map(m => (
                  <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                    {m.type === 'image' && <img src={m.url} alt={m.filename ?? ''} className="w-full h-full object-cover" />}
                    {m.type !== 'image' && (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(m.id)}
                      className="absolute top-1 right-1 h-5 w-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {mediaPreviews.length < 9 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}

            {/* Toolbar + submit */}
            {focused && (
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  <input ref={fileRef}  type="file" accept="image/*"   multiple className="hidden" onChange={e => addFiles(Array.from(e.target.files ?? []), 'image')} />
                  <input ref={videoRef} type="file" accept="video/*"           className="hidden" onChange={e => addFiles(Array.from(e.target.files ?? []), 'video')} />
                  <input ref={audioRef} type="file" accept="audio/*"           className="hidden" onChange={e => addFiles(Array.from(e.target.files ?? []), 'audio')} />
                  <input ref={docRef}   type="file" accept=".pdf,.doc,.docx,.csv,.xls,.xlsx" className="hidden" onChange={e => addFiles(Array.from(e.target.files ?? []), 'document')} />

                  {[
                    { icon: ImageIcon, ref: fileRef,  label: 'Photo',    color: 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30' },
                    { icon: Film,      ref: videoRef, label: 'Vidéo',    color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
                    { icon: Mic,       ref: audioRef, label: 'Audio',    color: 'hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30' },
                    { icon: FileText,  ref: docRef,   label: 'Document', color: 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' },
                  ].map(({ icon: Icon, ref, label, color }) => (
                    <button
                      key={label}
                      type="button"
                      title={label}
                      onClick={() => ref.current?.click()}
                      className={cn('h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground transition-colors', color)}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setFocused(false); setContent(''); setMediaFiles([]); setMediaPreviews([]); }}
                    className="text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    Annuler
                  </button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={(!content.trim() && mediaFiles.length === 0 && !pollQuestion.trim()) || createPost.isPending}
                    loading={createPost.isPending}
                    className="gap-2 bg-[#064E3B] hover:bg-[#065f46] h-8 px-4"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Publier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
