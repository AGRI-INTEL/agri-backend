'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { drawWaveform } from '@/lib/media-utils';

interface UseVoiceRecorderOptions {
  maxDuration?: number; // seconds
  onStop?: (blob: Blob, duration: number, waveform: number[]) => void;
}

interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  waveform: number[];
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}) {
  const { maxDuration = 300, onStop } = options;

  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    waveform: [],
    audioBlob: null,
    audioUrl: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const waveformRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Calculate amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    const amplitude = sum / dataArray.length / 128;
    waveformRef.current = [...waveformRef.current.slice(-49), amplitude];

    setState((s) => ({ ...s, waveform: [...waveformRef.current] }));
    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for waveform
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      waveformRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;

        setState((s) => ({
          ...s,
          isRecording: false,
          audioBlob: blob,
          audioUrl: url,
          duration,
        }));

        onStop?.(blob, duration, waveformRef.current);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start(100);

      // Timer
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setState((s) => ({ ...s, duration: elapsed }));

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

      // Waveform animation
      animFrameRef.current = requestAnimationFrame(updateWaveform);

      setState((s) => ({ ...s, isRecording: true, error: null, audioBlob: null, audioUrl: null }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Microphone non disponible';
      setState((s) => ({ ...s, error }));
    }
  }, [maxDuration, onStop, updateWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioContextRef.current?.close();
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      waveform: [],
      audioBlob: null,
      audioUrl: null,
      error: null,
    });
  }, [stopRecording]);

  const reset = useCallback(() => {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      waveform: [],
      audioBlob: null,
      audioUrl: null,
      error: null,
    });
  }, [state.audioUrl]);

  // Draw waveform on canvas
  const drawOnCanvas = useCallback(
    (canvas: HTMLCanvasElement, progress = 0) => {
      drawWaveform(canvas, state.waveform, { progress });
    },
    [state.waveform]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    drawOnCanvas,
  };
}
