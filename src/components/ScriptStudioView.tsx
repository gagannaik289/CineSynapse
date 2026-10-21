import React, { useState } from 'react';
import { ScriptProject, CharacterDossier, ScriptBeat, SciFiTopic, SceneSoundtrack, StoryboardImage } from '../types';
import { AudioPlayerWidget } from './AudioPlayerWidget';
import { VoiceDictationButton } from './VoiceDictationButton';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Film, 
  ListOrdered, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Edit3, 
  Loader2,
  ChevronRight,
  Eye,
  Play,
  Music,
  Image as ImageIcon,
  Check,
  Edit2
} from 'lucide-react';

interface ScriptStudioViewProps {
  project: ScriptProject;
  onUpdateProject: (updated: Partial<ScriptProject>) => void;
  onNavigateToScreenplay: () => void;
  onNavigateToTeleprompter: () => void;
  onSwitchTopic: () => void;
}

export const ScriptStudioView: React.FC<ScriptStudioViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToScreenplay,
  onNavigateToTeleprompter,
  onSwitchTopic,
}) => {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);

  // Loading states
  const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
  const [isGeneratingBeats, setIsGeneratingBeats] = useState(false);
  const [generatingBeatId, setGeneratingBeatId] = useState<string | null>(null);
  const [scoringBeatId, setScoringBeatId] = useState<string | null>(null);
  const [visualizingBeatId, setVisualizingBeatId] = useState<string | null>(null);
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New character draft state
  const [showAddCharModal, setShowAddCharModal] = useState(false);
  const [newChar, setNewChar] = useState<Partial<CharacterDossier>>({
    name: '',
    role: 'Protagonist',
    occupation: '',
    coreMotivation: '',
    fatalFlaw: '',
    techSymbiosis: '',
  });

  // Stage 2: Generate Characters with AI
  const handleAutoGenerateCharacters = async () => {
    setIsGeneratingCharacters(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/script/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: project.topic }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      onUpdateProject({ characters: data.characters });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate characters');
    } finally {
      setIsGeneratingCharacters(false);
    }
  };

  // Stage 3: Generate Beat Sheet with AI
  const handleAutoGenerateBeatSheet = async () => {
    setIsGeneratingBeats(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/script/beat-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          characters: project.characters,
          format: project.format,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      onUpdateProject({ beats: data.beats });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate beat sheet');
    } finally {
      setIsGeneratingBeats(false);
    }
  };

  // Stage 4: Generate Scene for a specific beat
  const handleGenerateSceneScript = async (beat: ScriptBeat) => {
    setGeneratingBeatId(beat.id);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/script/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          characters: project.characters,
          beat: beat,
          format: project.format,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Update specific beat with generated screenplay content
      const updatedBeats = project.beats.map((b) =>
        b.id === beat.id ? { ...b, content: data.scriptContent } : b
      );
      onUpdateProject({ beats: updatedBeats });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate scene script');
    } finally {
      setGeneratingBeatId(null);
    }
  };

  // Score a specific scene using Lyria
  const handleScoreScene = async (beat: ScriptBeat) => {
    setScoringBeatId(beat.id);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${beat.beatName}: ${beat.dramaticObjective}`,
          durationType: 'clip',
          mood: `${project.topic.subgenre} cinematic tension`,
          sceneId: beat.id,
        }),
      });
      const data = await response.json();
      if (!data.success || !data.audioData) throw new Error(data.error || 'Failed to generate soundtrack');

      const newTrack: SceneSoundtrack = {
        id: `track-${Date.now()}`,
        sceneId: beat.id,
        title: `${beat.beatName} Ambient Score`,
        mood: `${project.topic.subgenre} Score`,
        prompt: beat.dramaticObjective,
        audioUrl: data.audioData,
        duration: 12,
        createdAt: Date.now(),
      };

      const updatedBeats = project.beats.map((b) =>
        b.id === beat.id ? { ...b, soundtrack: newTrack } : b
      );
      const existingTracks = project.soundtracks || [];
      onUpdateProject({
        beats: updatedBeats,
        soundtracks: [newTrack, ...existingTracks.filter((t) => t.sceneId !== beat.id)],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate scene score');
    } finally {
      setScoringBeatId(null);
    }
  };

  // Generate Keyframe Concept Art using Nano Banana 2.1
  const handleGenerateKeyframe = async (beat: ScriptBeat) => {
    setVisualizingBeatId(beat.id);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${beat.sceneHeading}: ${beat.dramaticObjective}. ${beat.beatName}. Authentic sci-fi film still with cinematic lighting.`,
          aspectRatio: '16:9',
          sceneHeading: beat.sceneHeading,
        }),
      });
      const data = await response.json();
      if (!data.success || !data.imageUrl) throw new Error(data.error || 'Failed to generate concept keyframe');

      const newImage: StoryboardImage = {
        id: `storyboard-${Date.now()}`,
        sceneId: beat.id,
        sceneHeading: beat.sceneHeading,
        prompt: `${beat.beatName} - ${beat.dramaticObjective}`,
        imageUrl: data.imageUrl,
        createdAt: Date.now(),
      };

      const updatedBeats = project.beats.map((b) =>
        b.id === beat.id ? { ...b, storyboard: newImage } : b
      );
      const existingStoryboards = project.storyboards || [];
      onUpdateProject({
        beats: updatedBeats,
        storyboards: [newImage, ...existingStoryboards.filter((img) => img.sceneId !== beat.id)],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate keyframe');
    } finally {
      setVisualizingBeatId(null);
    }
  };

  // Append transcribed voice dictation directly to scene content
  const handleDictationForBeat = (beatId: string, transcribedText: string) => {
    if (!transcribedText.trim()) return;
    const updatedBeats = project.beats.map((b) => {
      if (b.id === beatId) {
        const separator = b.content && !b.content.endsWith('\n\n') ? '\n\n' : '';
        return {
          ...b,
          content: `${b.content || ''}${separator}${transcribedText.trim()}`,
        };
      }
      return b;
    });
    onUpdateProject({ beats: updatedBeats });
  };

  // Add custom character
  const handleSaveCustomCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name) return;
    const created: CharacterDossier = {
      id: `char-${Date.now()}`,
      name: newChar.name || 'Unnamed',
      role: (newChar.role as any) || 'Supporting Ally',
      occupation: newChar.occupation || '',
      coreMotivation: newChar.coreMotivation || '',
      fatalFlaw: newChar.fatalFlaw || '',
      techSymbiosis: newChar.techSymbiosis || '',
    };
    onUpdateProject({ characters: [...project.characters, created] });
    setShowAddCharModal(false);
    setNewChar({
      name: '',
      role: 'Protagonist',
      occupation: '',
      coreMotivation: '',
      fatalFlaw: '',
      techSymbiosis: '',
    });
  };

  const completedBeatsCount = project.beats.filter((b) => b.content && b.content.length > 50).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Script Studio Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={onSwitchTopic} className="hover:text-amber-400 transition-colors">
              Trending Radar
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-amber-400 font-semibold">{project.topic.title}</span>
            <span aria-hidden="true">/</span>
            <span>{project.format}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1 tracking-tight">
            {project.title}
          </h1>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToScreenplay}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Read Screenplay</span>
          </button>

          <button
            onClick={onNavigateToTeleprompter}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Table Read Teleprompter</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { step: 1, label: '1. Premise & Logline', desc: 'Core dramatic thesis' },
          { step: 2, label: '2. Dramatis Personae', desc: `${project.characters.length} Characters defined` },
          { step: 3, label: '3. Narrative Beat Sheet', desc: `${project.beats.length} Beats mapped` },
          { step: 4, label: '4. Full Script Draft', desc: `${completedBeatsCount}/${project.beats.length} Scenes written` },
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveStage(s.step as any)}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeStage === s.step
                ? 'bg-amber-400/10 border-amber-400/80 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${activeStage === s.step ? 'text-amber-400' : 'text-slate-300'}`}>
                {s.label}
              </span>
              {s.step === 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {s.step === 2 && project.characters.length > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {s.step === 3 && project.beats.length > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {s.step === 4 && completedBeatsCount > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{s.desc}</p>
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Stage 1: Premise & High-Concept Logline Lock */}
      {activeStage === 1 && (
        <section className="space-y-6">
          <div className="bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Premise &amp; Dramatic Foundation</h2>
                <p className="text-xs text-slate-400 mt-0.5">Define format, logline, and core philosophical inquiry.</p>
              </div>
              <button
                onClick={onSwitchTopic}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Change Topic
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Project Title</label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => onUpdateProject({ title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Format</label>
                <select
                  value={project.format}
                  onChange={(e) => onUpdateProject({ format: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Film Screenplay">Film Screenplay (Feature / Chamber Piece)</option>
                  <option value="Short Film">Short Film (10-25 mins)</option>
                  <option value="Narrative Fiction">Narrative Fiction (Speculative Novella)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Subgenre</label>
                <div className="px-3.5 py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg text-sm text-slate-300">
                  {project.topic.subgenre}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">High-Concept Logline</label>
              <textarea
                value={project.logline}
                onChange={(e) => onUpdateProject({ logline: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Real-World Tech Frontier</span>
                <p className="text-xs text-slate-300 leading-relaxed">{project.topic.realWorldBreakthrough}</p>
              </div>

              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Central Philosophical Paradox</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">{project.topic.centralPhilosophicalDilemma}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setActiveStage(2);
                  if (project.characters.length === 0) {
                    handleAutoGenerateCharacters();
                  }
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Proceed to Dramatis Personae</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stage 2: Character Dossiers */}
      {activeStage === 2 && (
        <section className="space-y-6">
          <div className="bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Dramatis Personae Dossiers</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Character motivations, fatal flaws, and their existential symbiosis with the AI technology.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoGenerateCharacters}
                  disabled={isGeneratingCharacters}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isGeneratingCharacters ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Regenerate with AI</span>
                </button>

                <button
                  onClick={() => setShowAddCharModal(true)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Character</span>
                </button>
              </div>
            </div>

            {/* Character Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.characters.map((char) => (
                <div
                  key={char.id}
                  className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Unboxed Metadata (NO PILLS) */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-amber-400">{char.role}</span>
                        <span aria-hidden="true">·</span>
                        <span>{char.occupation}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{char.name}</h3>
                    </div>
                    <button
                      onClick={() => {
                        const filtered = project.characters.filter((c) => c.id !== char.id);
                        onUpdateProject({ characters: filtered });
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Delete character"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Core Motivation</span>
                      <p className="text-slate-300 mt-0.5">{char.coreMotivation}</p>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Fatal Flaw</span>
                      <p className="text-slate-300 mt-0.5">{char.fatalFlaw}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                      <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-semibold block">Tech Symbiosis</span>
                      <p className="text-slate-300 mt-0.5">{char.techSymbiosis}</p>
                    </div>
                  </div>
                </div>
              ))}

              {project.characters.length === 0 && !isGeneratingCharacters && (
                <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-xl p-6">
                  <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No characters generated yet.</p>
                  <button
                    onClick={handleAutoGenerateCharacters}
                    className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg"
                  >
                    Generate Character Roster
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStage(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back to Premise
              </button>
              <button
                onClick={() => {
                  setActiveStage(3);
                  if (project.beats.length === 0) {
                    handleAutoGenerateBeatSheet();
                  }
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Proceed to Beat Sheet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stage 3: Narrative Beat Sheet (Treatment) */}
      {activeStage === 3 && (
        <section className="space-y-6">
          <div className="bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Three-Act Beat Sheet &amp; Treatment</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Five structural milestones ensuring tight dramatic tension and philosophical escalation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoGenerateBeatSheet}
                  disabled={isGeneratingBeats}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isGeneratingBeats ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Regenerate Beat Sheet</span>
                </button>
              </div>
            </div>

            {/* Beats List */}
            <div className="space-y-4">
              {project.beats.map((beat, idx) => (
                <div
                  key={beat.id}
                  className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-amber-400">{beat.act}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300 font-medium">Beat {idx + 1}: {beat.beatName}</span>
                    </div>

                    <div className="font-mono text-xs text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                      {beat.sceneHeading}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Dramatic Objective</span>
                      <p className="text-slate-300">{beat.dramaticObjective}</p>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Beat Summary</span>
                      <p className="text-slate-400 leading-relaxed">{beat.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {project.beats.length === 0 && !isGeneratingBeats && (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl p-6">
                  <ListOrdered className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No beats mapped yet.</p>
                  <button
                    onClick={handleAutoGenerateBeatSheet}
                    className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg"
                  >
                    Generate Beat Structure
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStage(2)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back to Characters
              </button>
              <button
                onClick={() => setActiveStage(4)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Proceed to Script Writer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stage 4: Scene-by-Scene Screenplay Writer */}
      {activeStage === 4 && (
        <section className="space-y-6">
          <div className="bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Screenplay Scene Drafting</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Draft individual scenes in standard industry screenplay typography, or write the full script.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onNavigateToScreenplay}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Screenplay View</span>
                </button>
              </div>
            </div>

            {/* Scenes Accordion / Generator List with Contextual AI Toolbars */}
            <div className="space-y-6">
              {project.beats.map((beat, idx) => {
                const isWriting = generatingBeatId === beat.id;
                const isScoring = scoringBeatId === beat.id;
                const isVisualizing = visualizingBeatId === beat.id;
                const isEditing = editingBeatId === beat.id;
                const hasScript = beat.content && beat.content.includes('\n');

                return (
                  <div
                    key={beat.id}
                    className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 transition-all"
                  >
                    {/* Scene Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-amber-400">{beat.act}</span>
                          <span aria-hidden="true">·</span>
                          <span>Scene {idx + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-300">{beat.sceneHeading}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{beat.beatName}</h4>
                      </div>

                      {/* Contextual AI Toolbar for this Scene */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Voice Dictation (Gemini 3.5 Transcribe) */}
                        <VoiceDictationButton
                          label="Dictate"
                          onTranscription={(txt) => handleDictationForBeat(beat.id, txt)}
                          className="bg-slate-950/80 text-xs py-1.5"
                        />

                        {/* Lyria Music Score Button */}
                        <button
                          onClick={() => handleScoreScene(beat)}
                          disabled={isScoring}
                          className="px-3 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-sky-400 border border-sky-400/20 hover:border-sky-400/40 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          title="Generate atmospheric 30s scene score with Lyria"
                        >
                          {isScoring ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Scoring...</span>
                            </>
                          ) : (
                            <>
                              <Music className="w-3.5 h-3.5" />
                              <span>{beat.soundtrack ? 'Rescore' : 'Score Scene'}</span>
                            </>
                          )}
                        </button>

                        {/* Nano Banana Keyframe Button */}
                        <button
                          onClick={() => handleGenerateKeyframe(beat)}
                          disabled={isVisualizing}
                          className="px-3 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-emerald-400 border border-emerald-400/20 hover:border-emerald-400/40 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          title="Generate concept storyboard keyframe with Gemini Nano Banana"
                        >
                          {isVisualizing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Rendering...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{beat.storyboard ? 'Re-render Art' : 'Keyframe Art'}</span>
                            </>
                          )}
                        </button>

                        {/* AI Screenplay Writer */}
                        <button
                          onClick={() => handleGenerateSceneScript(beat)}
                          disabled={isWriting}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 shadow-sm"
                        >
                          {isWriting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Writing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{hasScript ? 'Regenerate Scene' : 'Write Screenplay Scene'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      <strong className="text-slate-300">Objective: </strong>
                      {beat.dramaticObjective}
                    </div>

                    {/* Attached Storyboard Keyframe (if generated) */}
                    {beat.storyboard && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 max-w-xl">
                        <img
                          src={beat.storyboard.imageUrl}
                          alt={beat.sceneHeading}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono text-[11px] text-amber-400 truncate">{beat.sceneHeading}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Nano Banana Keyframe</span>
                        </div>
                      </div>
                    )}

                    {/* Attached Lyria Soundtrack (if generated) */}
                    {beat.soundtrack && (
                      <div className="max-w-xl">
                        <AudioPlayerWidget
                          audioUrl={beat.soundtrack.audioUrl}
                          title={beat.soundtrack.title}
                          mood={beat.soundtrack.mood}
                        />
                      </div>
                    )}

                    {/* Script draft box with inline edit toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500">Screenplay Draft</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              // Save edits
                              const updatedBeats = project.beats.map((b) =>
                                b.id === beat.id ? { ...b, content: editingContent } : b
                              );
                              onUpdateProject({ beats: updatedBeats });
                              setEditingBeatId(null);
                            } else {
                              setEditingBeatId(beat.id);
                              setEditingContent(beat.content || '');
                            }
                          }}
                          className="hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          {isEditing ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Done Editing</span>
                            </>
                          ) : (
                            <>
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Scene Lines</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isEditing ? (
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={10}
                          className="w-full p-4 bg-[#080a10] border border-amber-400/50 rounded-lg text-xs leading-relaxed font-mono text-slate-200 focus:outline-none resize-y"
                        />
                      ) : hasScript ? (
                        <div className="p-4 bg-[#080a10] border border-slate-800 rounded-lg screenplay-paper text-xs leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                          {beat.content}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                          Scene not written yet. Click "Write Screenplay Scene" or use the microphone "Dictate" button to speak scene action and dialogue.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveStage(3)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back to Beat Sheet
              </button>

              <button
                onClick={onNavigateToScreenplay}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Read &amp; Export Screenplay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modal: Add Custom Character */}
      {showAddCharModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0c101a] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-display">Add Character Dossier</h3>

            <form onSubmit={handleSaveCustomCharacter} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={newChar.name}
                  onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                  placeholder="e.g. Dr. Kaelen Cross"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Role</label>
                <select
                  value={newChar.role}
                  onChange={(e) => setNewChar({ ...newChar, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Protagonist">Protagonist</option>
                  <option value="Antagonist">Antagonist / Opposing Force</option>
                  <option value="Synthetic / AI">Synthetic / AI Entity</option>
                  <option value="Supporting Ally">Supporting Ally</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Occupation / Designation</label>
                <input
                  type="text"
                  value={newChar.occupation}
                  onChange={(e) => setNewChar({ ...newChar, occupation: e.target.value })}
                  placeholder="e.g. Memory Redaction Specialist"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Core Motivation</label>
                <textarea
                  value={newChar.coreMotivation}
                  onChange={(e) => setNewChar({ ...newChar, coreMotivation: e.target.value })}
                  rows={2}
                  placeholder="What do they desperately want?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Fatal Flaw</label>
                <input
                  type="text"
                  value={newChar.fatalFlaw}
                  onChange={(e) => setNewChar({ ...newChar, fatalFlaw: e.target.value })}
                  placeholder="e.g. Blind faith in algorithmic objectivity"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Relationship to AI Technology</label>
                <textarea
                  value={newChar.techSymbiosis}
                  onChange={(e) => setNewChar({ ...newChar, techSymbiosis: e.target.value })}
                  rows={2}
                  placeholder="How does this technology enhance or torment them?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCharModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg"
                >
                  Save Character
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
