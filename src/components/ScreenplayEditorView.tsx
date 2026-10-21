import React, { useState } from 'react';
import { ScriptProject } from '../types';
import { AudioPlayerWidget } from './AudioPlayerWidget';
import { 
  Download, 
  Copy, 
  Check, 
  Wand2, 
  Play, 
  BookOpen, 
  FileText, 
  Clock, 
  Layers, 
  Loader2, 
  Sparkles,
  Edit2,
  Music
} from 'lucide-react';

interface ScreenplayEditorViewProps {
  project: ScriptProject;
  onUpdateProject: (updated: Partial<ScriptProject>) => void;
  onLaunchTeleprompter: () => void;
  onBackToStudio: () => void;
}

export const ScreenplayEditorView: React.FC<ScreenplayEditorViewProps> = ({
  project,
  onUpdateProject,
  onLaunchTeleprompter,
  onBackToStudio,
}) => {
  const [viewMode, setViewMode] = useState<'screenplay' | 'narrative' | 'treatment'>('screenplay');
  const [copied, setCopied] = useState(false);

  // Script doctor polish modal
  const [isPolishModalOpen, setIsPolishModalOpen] = useState(false);
  const [selectedBeatIndex, setSelectedBeatIndex] = useState<number>(0);
  const [polishDirective, setPolishDirective] = useState<string>('Heighten psychological suspense and dialogue subtext');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishSuccess, setPolishSuccess] = useState(false);

  // Assemble full script
  const assembledScript = project.beats
    .map((beat) => beat.content || `[SCENE NOT YET WRITTEN: ${beat.beatName}]`)
    .join('\n\n\n');

  // Stats calculation
  const totalWords = assembledScript.split(/\s+/).filter(Boolean).length;
  // Standard screenplay rule: ~250 words = 1 page = 1 minute screen time
  const estimatedPages = Math.max(1, Math.round(totalWords / 250));
  const estimatedMinutes = estimatedPages;

  const handleCopy = () => {
    navigator.clipboard.writeText(assembledScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFountain = () => {
    const header = `Title: ${project.title}\nCredit: Written with CineSynapse\nFormat: ${project.format}\n\n`;
    const blob = new Blob([header + assembledScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}.fountain`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# ${project.title}\n\n**Format:** ${project.format}\n**Subgenre:** ${project.topic.subgenre}\n**Logline:** ${project.logline}\n\n---\n\n${assembledScript}`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePolishScene = async () => {
    const targetBeat = project.beats[selectedBeatIndex];
    if (!targetBeat) return;

    setIsPolishing(true);
    try {
      const response = await fetch('/api/script/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentContent: targetBeat.content,
          polishDirective: polishDirective,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      const updatedBeats = [...project.beats];
      updatedBeats[selectedBeatIndex] = {
        ...targetBeat,
        content: data.polishedContent,
      };
      onUpdateProject({ beats: updatedBeats });
      setPolishSuccess(true);
      setTimeout(() => {
        setPolishSuccess(false);
        setIsPolishModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Top Header & Actions Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={onBackToStudio} className="hover:text-amber-400 transition-colors">
              Script Studio
            </button>
            <span aria-hidden="true">·</span>
            <span>{project.format}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">{project.topic.subgenre}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            {project.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPolishModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Script Doctor Polish</span>
          </button>

          <button
            onClick={onLaunchTeleprompter}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Rehearse in Teleprompter</span>
          </button>
        </div>
      </div>

      {/* Production Telemetry Strip (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="space-y-0.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Est. Screen Time</span>
          <p className="text-lg font-bold text-white font-screenplay tabular-nums">~{estimatedMinutes} min</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Script Length</span>
          <p className="text-lg font-bold text-white font-screenplay tabular-nums">{estimatedPages} pages</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Word Count</span>
          <p className="text-lg font-bold text-white font-screenplay tabular-nums">{totalWords.toLocaleString()}</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Scenes / Beats</span>
          <p className="text-lg font-bold text-white font-screenplay tabular-nums">{project.beats.length} mapped</p>
        </div>
      </div>

      {/* Control Bar: View Toggle + Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('screenplay')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'screenplay'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Industry Screenplay
          </button>

          <button
            onClick={() => setViewMode('narrative')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'narrative'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Narrative Prose
          </button>

          <button
            onClick={() => setViewMode('treatment')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'treatment'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Treatment Outline
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Script'}</span>
          </button>

          <button
            onClick={handleDownloadFountain}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs rounded-lg transition-colors flex items-center gap-1.5"
            title="Download in Fountain industry format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.Fountain</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs rounded-lg transition-colors flex items-center gap-1.5"
            title="Download Markdown manuscript"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>
        </div>
      </div>

      {/* Screenplay Content Canvas */}
      {viewMode === 'screenplay' && (
        <main className="screenplay-paper rounded-2xl border border-slate-800 p-8 sm:p-14 shadow-2xl space-y-8 min-h-[600px] overflow-x-auto">
          {/* Script Title Header */}
          <div className="text-center pb-8 border-b border-slate-800/80 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-white">
              {project.title}
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              A {project.format} by CineSynapse
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto italic mt-2">
              "{project.logline}"
            </p>
          </div>

          {/* Render individual beat scenes with screenplay styling */}
          <div className="space-y-10 text-xs sm:text-sm font-screenplay">
            {project.beats.map((beat, idx) => (
              <section key={beat.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                  <div className="font-bold text-amber-400 tracking-wider">
                    {beat.sceneHeading || `SCENE ${idx + 1}`}
                  </div>
                  {beat.soundtrack && (
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-sans">
                      <Music className="w-3.5 h-3.5" />
                      <span>{beat.soundtrack.title}</span>
                    </div>
                  )}
                </div>

                {beat.storyboard && (
                  <div className="rounded-lg overflow-hidden border border-slate-800 max-w-lg my-3 font-sans">
                    <img src={beat.storyboard.imageUrl} alt={beat.sceneHeading} className="w-full aspect-video object-cover" />
                  </div>
                )}

                {beat.soundtrack && (
                  <div className="my-3 font-sans max-w-lg">
                    <AudioPlayerWidget
                      audioUrl={beat.soundtrack.audioUrl}
                      title={beat.soundtrack.title}
                      mood={beat.soundtrack.mood}
                    />
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {beat.content || `[SCENE ${idx + 1} - NOT WRITTEN YET. Go to Script Studio to draft this scene.]`}
                </div>
              </section>
            ))}

            {project.beats.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                No script beats found. Return to the Script Studio to generate your narrative beat sheet.
              </div>
            )}
          </div>
        </main>
      )}

      {/* Narrative Prose View */}
      {viewMode === 'narrative' && (
        <main className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-8 sm:p-14 space-y-8 min-h-[600px] font-sans">
          <div className="max-w-2xl mx-auto space-y-8">
            <header className="space-y-2 pb-6 border-b border-slate-800">
              <h2 className="text-3xl font-extrabold text-white font-display">
                {project.title}
              </h2>
              <p className="text-sm text-slate-400 italic">
                {project.logline}
              </p>
            </header>

            <article className="space-y-6 text-sm text-slate-300 leading-relaxed">
              {project.beats.map((beat, idx) => (
                <div key={beat.id} className="space-y-3">
                  <h3 className="text-base font-bold text-amber-400 font-display">
                    Chapter {idx + 1}: {beat.beatName}
                  </h3>
                  <div className="whitespace-pre-wrap font-serif text-slate-200 text-base leading-loose">
                    {beat.content}
                  </div>
                </div>
              ))}
            </article>
          </div>
        </main>
      )}

      {/* Treatment Outline View */}
      {viewMode === 'treatment' && (
        <main className="bg-[#0c101a] rounded-2xl border border-slate-800 p-8 space-y-6 min-h-[600px]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white font-display">
              Production Treatment &amp; Structural Architecture
            </h2>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">Story Logline</span>
              <p className="text-sm text-white">{project.logline}</p>
              <div className="pt-2 border-t border-slate-800 text-slate-400">
                <strong>Core Dilemma: </strong> {project.topic.centralPhilosophicalDilemma}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {project.beats.map((beat, idx) => (
                <div key={beat.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400">{beat.act} · Beat {idx + 1}</span>
                    <span className="font-mono text-slate-400">{beat.sceneHeading}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{beat.beatName}</h4>
                  <p className="text-slate-300">{beat.dramaticObjective}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Polish / Script Doctor Modal */}
      {isPolishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Script Doctor Polish</span>
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Elevate Dramatic Resonance
            </h3>
            <p className="text-xs text-slate-400">
              Select a scene and apply targeted cinematic directorial feedback.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Select Scene to Polish</label>
                <select
                  value={selectedBeatIndex}
                  onChange={(e) => setSelectedBeatIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {project.beats.map((b, idx) => (
                    <option key={b.id} value={idx}>
                      Scene {idx + 1}: {b.beatName} ({b.sceneHeading})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Quick Directorial Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Heighten subtext & unspoken tension in dialogue',
                    'Increase visceral sensory dread & lighting cues',
                    'Sharpen tempo for fast-paced action beats',
                    'Amplify philosophical clash between human & AI',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPolishDirective(preset)}
                      className="p-2 text-left bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Custom Director's Note</label>
                <textarea
                  value={polishDirective}
                  onChange={(e) => setPolishDirective(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {polishSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Scene polished and updated successfully!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPolishModalOpen(false)}
                  disabled={isPolishing}
                  className="px-3.5 py-2 text-slate-400 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePolishScene}
                  disabled={isPolishing}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPolishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Polishing Scene...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Polish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
