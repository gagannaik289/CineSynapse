import React, { useState, useEffect, useRef } from 'react';
import { ScriptProject } from '../types';
import { Play, Pause, RotateCcw, X, Type, FastForward, Maximize2, Minimize2 } from 'lucide-react';

interface TeleprompterModalProps {
  project: ScriptProject;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  project,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(2); // 1 to 5
  const [fontSize, setFontSize] = useState<number>(22); // in px
  const [mirrorMode, setMirrorMode] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Full raw script text
  const scriptContent = project.beats
    .map((b) => `${b.sceneHeading}\n\n${b.content}`)
    .join('\n\n---\n\n');

  // Spacebar play/pause listener & ESC close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Smooth scroll loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const scroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed * 0.75;
      }
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    animationFrameRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, scrollSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a] text-white flex flex-col">
      {/* Top Teleprompter HUD Bar */}
      <header className="px-6 py-4 bg-[#0a0d14] border-b border-slate-800 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-amber-400 font-display uppercase tracking-wider">
            Table Read Teleprompter
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-sm">
            {project.title}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause [Space]</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Scroll [Space]</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset to Top"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Speed:</span>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono tabular-nums text-amber-400">{scrollSpeed}x</span>
          </div>

          {/* Font Size slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs hidden sm:flex">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="16"
              max="36"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono tabular-nums text-slate-300">{fontSize}px</span>
          </div>

          <button
            onClick={() => setMirrorMode(!mirrorMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hidden md:inline-block ${
              mirrorMode ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Mirror Glass
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Exit Teleprompter (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Script Viewing Stage */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-6 sm:px-16 py-20 font-screenplay leading-relaxed transition-all ${
          mirrorMode ? 'scale-x-[-1]' : ''
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-3xl mx-auto space-y-12">
          {project.beats.map((beat, idx) => (
            <div key={beat.id} className="space-y-6">
              <div className="text-amber-400 font-bold tracking-wider border-b border-amber-400/20 pb-2">
                {beat.sceneHeading || `SCENE ${idx + 1}`}
              </div>

              <div className="whitespace-pre-wrap text-slate-200">
                {beat.content || `[SCENE ${idx + 1} NOT GENERATED YET]`}
              </div>
            </div>
          ))}

          <div className="text-center pt-24 pb-48 text-slate-600 text-sm tracking-widest uppercase">
            — END OF SCRIPT REHEARSAL —
          </div>
        </div>
      </div>
    </div>
  );
};
