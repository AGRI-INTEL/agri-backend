'use client';

import { useRef, useEffect } from 'react';
import { Mic, Square, X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from './audio-player';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { formatDuration, cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number, waveform: number[]) => void;
  onCancel?: () => void;
  className?: string;
}

export function VoiceRecorder({ onSend, onCancel, className }: VoiceRecorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    isRecording, duration, waveform, audioBlob, audioUrl,
    startRecording, stopRecording, cancelRecording, reset, drawOnCanvas,
  } = useVoiceRecorder({
    onStop: () => {
      // auto-preview after stop
    },
  });

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      drawOnCanvas(canvasRef.current);
    }
  }, [isRecording, waveform, drawOnCanvas]);

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration, waveform);
      reset();
    }
  };

  // Idle state
  if (!isRecording && !audioBlob) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={startRecording}
        className={cn('text-muted-foreground hover:text-primary', className)}
        aria-label="Enregistrer un message vocal"
      >
        <Mic className="h-5 w-5" />
      </Button>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <div className={cn('flex items-center gap-3 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2', className)}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="text-red-600 text-sm font-data font-semibold">{formatDuration(duration)}</span>
        </div>

        <canvas
          ref={canvasRef}
          width={120}
          height={32}
          className="flex-1"
          aria-label="Forme d'onde en cours d'enregistrement"
        />

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={cancelRecording}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Annuler l'enregistrement"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white"
            aria-label="Arrêter l'enregistrement"
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
        </div>
      </div>
    );
  }

  // Preview state
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {audioUrl && (
        <AudioPlayer
          src={audioUrl}
          waveform={waveform}
          duration={duration}
          compact
          className="flex-1"
        />
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => { reset(); onCancel?.(); }}
        className="text-muted-foreground hover:text-destructive shrink-0"
        aria-label="Supprimer l'enregistrement"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon-sm"
        onClick={handleSend}
        className="bg-primary text-white hover:bg-primary-700 shrink-0"
        aria-label="Envoyer le message vocal"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
