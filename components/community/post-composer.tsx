'use client';

import { useState, useRef } from 'react';
import { Image, Film, Mic, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/avatar';
import { MediaGrid } from '@/components/media/media-grid';
import { useAuthStore } from '@/stores/auth-store';
import { useCreatePost } from '@/hooks/use-community';
import { cn } from '@/lib/utils';
import type { PostMedia } from '@/types/community';

interface PostComposerProps {
  groupId: string;
  className?: string;
}

export function PostComposer({ groupId, className }: PostComposerProps) {
  const { user } = useAuthStore();
  const createPost = useCreatePost();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<PostMedia[]>([]);
  const [focused, setFocused] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: File[], type: PostMedia['type']) => {
    const newFiles = Array.from(files).slice(0, 10 - mediaFiles.length);
    setMediaFiles((prev) => [...prev, ...newFiles]);
    const previews: PostMedia[] = newFiles.map((f) => ({
      id: URL.createObjectURL(f),
      type,
      url: URL.createObjectURL(f),
      filename: f.name,
      size: f.size,
    }));
    setMediaPreviews((prev) => [...prev, ...previews]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    const fd = new FormData();
    fd.append('content', content);
    fd.append('group_id', groupId);
    mediaFiles.forEach((f) => fd.append('files', f));
    await createPost.mutateAsync(fd);
    setContent('');
    setMediaFiles([]);
    setMediaPreviews([]);
    setFocused(false);
  };

  if (!user) return null;

  return (
    <div className={cn('bg-card rounded-card border border-border p-4', className)}>
      <div className="flex gap-3">
        <UserAvatar src={user.avatar} name={user.name} size="sm" className="shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Partagez quelque chose avec le groupe..."
            autoResize
            className={cn(
              'border-0 bg-muted/50 rounded-xl resize-none transition-all',
              focused ? 'min-h-[80px]' : 'min-h-[40px]'
            )}
            aria-label="Contenu de la publication"
          />

          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className="mt-3">
              <MediaGrid media={mediaPreviews} />
            </div>
          )}

          {/* Media buttons + submit */}
          {focused && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(Array.from(e.target.files || []), 'image')} />
                <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => addFiles(Array.from(e.target.files || []), 'video')} />
                <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => addFiles(Array.from(e.target.files || []), 'audio')} />
                <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" className="hidden" onChange={(e) => addFiles(Array.from(e.target.files || []), 'document')} />

                {[
                  { icon: Image, ref: photoRef, label: 'Photo', color: 'hover:text-green-500' },
                  { icon: Film, ref: videoRef, label: 'Vidéo', color: 'hover:text-blue-500' },
                  { icon: Mic, ref: audioRef, label: 'Audio', color: 'hover:text-purple-500' },
                  { icon: FileText, ref: docRef, label: 'Document', color: 'hover:text-red-500' },
                ].map(({ icon: Icon, ref, label, color }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => ref.current?.click()}
                    className={cn('text-muted-foreground', color)}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() && mediaFiles.length === 0}
                loading={createPost.isPending}
                className="gap-2"
              >
                <Send className="h-3 w-3" />
                Publier
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
