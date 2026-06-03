'use client';

import { useState } from 'react';
import {
  Folder, FolderOpen, Image as ImageIcon, Film, Music, FileText, Archive,
  Grid, List, Upload, FolderPlus, MoreHorizontal, Download, Trash2, Move,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadZone } from '@/components/media/upload-zone';
import { ImageViewer } from '@/components/media/image-viewer';
import { VideoPlayer } from '@/components/media/video-player';
import { AudioPlayer } from '@/components/media/audio-player';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFolders, useFiles, useDeleteFile, useCreateFolder, useMoveFile } from '@/hooks/use-files';
import { Input } from '@/components/ui/input';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { formatFileSize, formatRelativeDate, cn } from '@/lib/utils';
import type { FileItem, Folder as FolderType } from '@/types/file';

const fileIcons: Record<string, React.ElementType> = {
  image: ImageIcon, video: Film, audio: Music, document: FileText,
  spreadsheet: FileText, presentation: FileText, archive: Archive, other: FileText,
};

const fileColors: Record<string, string> = {
  image: 'text-green-500', video: 'text-blue-500', audio: 'text-purple-500',
  document: 'text-red-500', spreadsheet: 'text-emerald-500', other: 'text-muted-foreground',
};

export function FileExplorer() {
  const [currentFolder, setCurrentFolder] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveFileId, setMoveFileId] = useState<string | null>(null);

  const { data: folders } = useFolders();
  const { data: files, isLoading } = useFiles(currentFolder);
  const deleteFile = useDeleteFile();
  const createFolder = useCreateFolder();
  const moveFile = useMoveFile();
  const { uploads, uploadFiles, removeUpload } = useMediaUpload({ endpoint: '/files/upload' });

  const foldersList = (Array.isArray(folders)
    ? folders
    : (folders && typeof folders === 'object' && Array.isArray((folders as unknown as Record<string, unknown>).folders))
    ? (folders as unknown as Record<string, unknown>).folders as FolderType[]
    : []) as FolderType[];

  const filesList = (Array.isArray(files)
    ? files
    : (files && typeof files === 'object' && Array.isArray((files as unknown as Record<string, unknown>).items))
    ? (files as unknown as Record<string, unknown>).items as FileItem[]
    : []) as FileItem[];

  const currentFolderData = foldersList?.find((f) => f.id === currentFolder);

  const renderPreview = () => {
    if (!previewFile) return null;
    if (previewFile.type === 'image') {
      return (
        <ImageViewer
          images={[{ src: previewFile.url, alt: previewFile.name }]}
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      );
    }
    return (
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{previewFile.name}</DialogTitle></DialogHeader>
          {previewFile.type === 'video' && <VideoPlayer src={previewFile.url} poster={previewFile.thumbnail} />}
          {previewFile.type === 'audio' && <AudioPlayer src={previewFile.url} />}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar — folder tree */}
      <aside className="w-56 shrink-0 space-y-1" aria-label="Arborescence des dossiers">
        <button
          onClick={() => setCurrentFolder(undefined)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-button text-sm transition-colors',
            !currentFolder ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <FolderOpen className="h-4 w-4" />
          Mes Fichiers
        </button>
        {foldersList.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            active={currentFolder === folder.id}
            onClick={() => setCurrentFolder(folder.id)}
          />
        ))}
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => setCurrentFolder(undefined)} className="hover:text-foreground">Mes Fichiers</button>
            {currentFolderData && (
              <>
                <span>/</span>
                <span className="text-foreground">{currentFolderData.name}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowUpload(!showUpload)}>
              <Upload className="h-4 w-4" />
              Uploader
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowNewFolder(true)}>
              <FolderPlus className="h-4 w-4" />
              Nouveau dossier
            </Button>
            <div className="flex border border-border rounded-button overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('grid')}
                aria-label="Vue grille"
              >
                <Grid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('list')}
                aria-label="Vue liste"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {showNewFolder && (
          <div className="flex gap-2 items-center p-3 rounded-card border border-border bg-muted/30">
            <Input
              placeholder="Nom du dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="max-w-xs"
            />
            <Button
              size="sm"
              disabled={!newFolderName.trim()}
              loading={createFolder.isPending}
              onClick={() =>
                createFolder.mutate(
                  { name: newFolderName.trim(), parent_id: currentFolder },
                  {
                    onSuccess: () => {
                      setNewFolderName('');
                      setShowNewFolder(false);
                    },
                  }
                )
              }
            >
              Créer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNewFolder(false)}>Annuler</Button>
          </div>
        )}

        {moveFileId && (
          <div className="flex gap-2 items-center flex-wrap p-3 rounded-card border border-primary/30 bg-primary/5">
            <span className="text-sm">Déplacer vers :</span>
            {foldersList.map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant="outline"
                loading={moveFile.isPending}
                onClick={() =>
                  moveFile.mutate(
                    { fileId: moveFileId, folderId: f.id },
                    { onSuccess: () => setMoveFileId(null) }
                  )
                }
              >
                {f.name}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setMoveFileId(null)}>Annuler</Button>
          </div>
        )}

        {/* Upload zone */}
        {showUpload && (
          <UploadZone
            onFiles={uploadFiles}
            uploads={uploads}
            onRemove={removeUpload}
            maxFiles={20}
          />
        )}

        {/* Files */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-card bg-muted animate-pulse" />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filesList.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onPreview={() => setPreviewFile(file)}
                onDelete={() => deleteFile.mutate(file.id)}
                onMove={() => setMoveFileId(file.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filesList.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onPreview={() => setPreviewFile(file)}
                onDelete={() => deleteFile.mutate(file.id)}
                onMove={() => setMoveFileId(file.id)}
              />
            ))}
          </div>
        )}
      </div>

      {renderPreview()}
    </div>
  );
}

function FolderItem({ folder, active, onClick }: { folder: FolderType; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-button text-sm transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      <Folder className="h-4 w-4 shrink-0" />
      <span className="truncate">{folder.name}</span>
      <Badge variant="outline" className="ml-auto text-xs px-1">{folder.files_count}</Badge>
    </button>
  );
}

function FileCard({ file, onPreview, onDelete, onMove }: { file: FileItem; onPreview: () => void; onDelete: () => void; onMove: () => void }) {
  const Icon = fileIcons[file.type] || FileText;
  const color = fileColors[file.type] || 'text-muted-foreground';

  return (
    <div className="group relative rounded-card border border-border bg-card overflow-hidden hover:shadow-card-hover transition-all">
      {/* Preview area */}
      <button onClick={onPreview} className="w-full aspect-square flex items-center justify-center bg-muted/30 overflow-hidden relative">
        {file.type === 'image' && file.thumbnail ? (
          <Image
            src={file.thumbnail}
            alt={file.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : file.type === 'video' && file.thumbnail ? (
          <div className="relative w-full h-full">
            <Image
              src={file.thumbnail}
              alt={file.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Film className="h-8 w-8 text-white drop-shadow" />
            </div>
          </div>
        ) : (
          <Icon className={cn('h-10 w-10', color)} />
        )}
      </button>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="bg-black/50 text-white hover:bg-black/70 h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={file.url} download={file.name}><Download className="h-4 w-4" />Télécharger</a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMove}><Move className="h-4 w-4" />Déplacer</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function FileRow({ file, onPreview, onDelete, onMove }: { file: FileItem; onPreview: () => void; onDelete: () => void; onMove: () => void }) {
  const Icon = fileIcons[file.type] || FileText;
  const color = fileColors[file.type] || 'text-muted-foreground';

  return (
    <div className="flex items-center gap-3 p-2 rounded-button hover:bg-muted/50 transition-colors group">
      <button onClick={onPreview} className="shrink-0 relative h-10 w-10">
        {file.thumbnail ? (
          <Image
            src={file.thumbnail}
            alt=""
            fill
            unoptimized
            sizes="40px"
            className="rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
            <Icon className={cn('h-5 w-5', color)} />
          </div>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} · {formatRelativeDate(file.created_at)}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Télécharger">
          <a href={file.url} download={file.name}><Download className="h-3.5 w-3.5" /></a>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onMove} aria-label="Déplacer">
          <Move className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} className="text-destructive" aria-label="Supprimer">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
