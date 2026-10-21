import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceDictationButtonProps {
  onTranscription: (text: string) => void;
  label?: string;
  className?: string;
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscription,
  label = 'Dictate',
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const [micError, setMicError] = useState<string | null>(null);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access denied or error:', err);
      setMicError('Microphone permission required');
      setTimeout(() => setMicError(null), 4000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const sendAudioToTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const response = await fetch('/api/audio/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type || 'audio/webm',
          }),
        });

        const data = await response.json();
        if (data.success && data.transcription) {
          onTranscription(data.transcription);
        } else {
          console.warn('Transcription failed:', data.error);
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error('Transcription error:', error);
      setIsTranscribing(false);
    }
  };

  if (isTranscribing) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 text-amber-400 rounded-lg text-xs font-medium border border-amber-400/30 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Transcribing audio...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={stopRecording}
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-lg text-xs font-semibold animate-pulse ${className}`}
        title="Click to Stop Recording and Transcribe"
      >
        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span>Recording ({recordSeconds}s) · Click to Stop</span>
        <MicOff className="w-3.5 h-3.5 text-rose-400" />
      </button>
    );
  }

  if (micError) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-medium border border-rose-500/30 ${className}`}>
        <span>{micError}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-medium transition-colors ${className}`}
      title="Dictate scene action or dialogue with microphone (Gemini 3.5 Transcribe)"
    >
      <Mic className="w-3.5 h-3.5 text-amber-400" />
      <span>{label}</span>
    </button>
  );
};
