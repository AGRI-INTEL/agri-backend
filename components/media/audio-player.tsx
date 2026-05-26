'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { drawWaveform } from '@/lib/media-utils';
import { formatDuration, cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  waveform?: number[];
  duration?: number;
  className?: string;
  compact?: boolean;
}

export function AudioPlayer({ src, waveform, duration: initialDuration, className, compact }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  const progress = duration > 0 ? currentTime / duration : 0;

  const draw = useCallback(() => {
    if (!canvasRef.current || !waveform?.length) return;
    drawWaveform(canvasRef.current, waveform, {
      progress,
      color: '#94A3B8',
      progressColor: '#16A34A',
      barWidth: 3,
      gap: 2,
    });
  }, [waveform, progress]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => { setPlaying(false); setCurrentTime(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0] * duration;
    setCurrentTime(audio.currentTime);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  return (
    <div className={cn('flex items-center gap-3 bg-muted/50 rounded-xl p-3', className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <Button variant="ghost" size="icon" onClick={togglePlay} className="h-9 w-9 shrink-0 rounded-full bg-primary text-white hover:bg-primary-700">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </Button>

      <div className="flex-1 min-w-0">
        {waveform?.length ? (
          <canvas
            ref={canvasRef}
            className="w-full h-8 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek([ratio]);
            }}
            aria-label="Forme d'onde audio"
          />
        ) : (
          <Slider
            value={[progress]}
            min={0} max={1} step={0.001}
            onValueChange={seek}
            className="w-full"
            aria-label="Progression audio"
          />
        )}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span className="font-data">{formatDuration(currentTime)}</span>
          <span className="font-data">{formatDuration(duration)}</span>
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={cycleSpeed} className="h-7 px-2 text-xs font-data">
            {speed}x
          </Button>
          <div className="flex items-center gap-1">
            <Volume2 className="h-3 w-3 text-muted-foreground" />
            <Slider
              value={[volume]}
              min={0} max={1} step={0.1}
              onValueChange={([v]) => {
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-16"
              aria-label="Volume"
            />
          </div>
        </div>
      )}
    </div>
  );
}
