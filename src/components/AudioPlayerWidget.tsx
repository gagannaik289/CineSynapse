import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Repeat } from 'lucide-react';

interface AudioPlayerWidgetProps {
  audioUrl: string;
  title: string;
  mood?: string;
  onDownload?: () => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  audioUrl,
  title,
  mood,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_score.wav`;
    a.click();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop={isLooping}
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => !isLooping && setIsPlaying(false)}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{title}</p>
          {mood && <p className="text-[11px] text-amber-400/90 truncate">{mood}</p>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded transition-colors text-xs ${
              isLooping ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isLooping ? 'Looping enabled' : 'Loop playback'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            title="Download .wav audio"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrub bar & playback button */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-sm"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
            {formatTime(currentTime)} / {formatTime(duration || 10)}
          </span>
        </div>
      </div>
    </div>
  );
};
