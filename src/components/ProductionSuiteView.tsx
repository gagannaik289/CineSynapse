import React, { useState } from 'react';
import { ScriptProject, SceneSoundtrack, StoryboardImage } from '../types';
import { AudioPlayerWidget } from './AudioPlayerWidget';
import { VoiceDictationButton } from './VoiceDictationButton';
import { 
  Music, 
  Image as ImageIcon, 
  Mic, 
  Sparkles, 
  Wand2, 
  Loader2, 
  Download, 
  Layers, 
  Plus, 
  Check, 
  Maximize2,
  X,
  Play
} from 'lucide-react';

interface ProductionSuiteViewProps {
  project: ScriptProject;
  onUpdateProject: (updated: Partial<ScriptProject>) => void;
  onNavigateToStudio: () => void;
}

export const ProductionSuiteView: React.FC<ProductionSuiteViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'soundtrack' | 'storyboard' | 'dictation'>('soundtrack');

  // Music state
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicMood, setMusicMood] = useState('Cyberpunk Noir Drone');
  const [musicDuration, setMusicDuration] = useState<'clip' | 'full'>('clip');
  const [targetSceneForMusic, setTargetSceneForMusic] = useState<string>(project.beats[0]?.id || '');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicList, setMusicList] = useState<SceneSoundtrack[]>(project.soundtracks || []);

  // Storyboard state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<'16:9' | '4:3'>('16:9');
  const [targetSceneForImage, setTargetSceneForImage] = useState<string>(project.beats[0]?.id || '');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageList, setImageList] = useState<StoryboardImage[]>(project.storyboards || []);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<StoryboardImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  // Dictation state
  const [dictatedText, setDictatedText] = useState('');
  const [targetSceneForDictation, setTargetSceneForDictation] = useState<string>(project.beats[0]?.id || '');
  const [dictationAppended, setDictationAppended] = useState(false);

  // 1. Generate Music
  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim() && !musicMood) return;

    setIsGeneratingMusic(true);
    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt || `Atmospheric sci-fi score for ${project.title}`,
          durationType: musicDuration,
          mood: musicMood,
          sceneId: targetSceneForMusic,
        }),
      });

      const data = await response.json();
      if (data.success && data.audioData) {
        const newTrack: SceneSoundtrack = {
          id: `track-${Date.now()}`,
          sceneId: targetSceneForMusic,
          title: musicPrompt.slice(0, 32) || `${musicMood} Theme`,
          mood: musicMood,
          prompt: musicPrompt,
          audioUrl: data.audioData,
          duration: musicDuration === 'full' ? 24 : 12,
          createdAt: Date.now(),
        };

        const updated = [newTrack, ...musicList];
        setMusicList(updated);
        onUpdateProject({ soundtracks: updated });
        setMusicPrompt('');
      }
    } catch (err) {
      console.error('Music generation error:', err);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // 2. Generate Concept Art / Storyboard
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    try {
      const targetBeat = project.beats.find((b) => b.id === targetSceneForImage);
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          sceneHeading: targetBeat?.sceneHeading || '',
        }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        const newImage: StoryboardImage = {
          id: `storyboard-${Date.now()}`,
          sceneId: targetSceneForImage,
          sceneHeading: targetBeat?.sceneHeading || 'CONCEPT ART',
          prompt: imagePrompt,
          imageUrl: data.imageUrl,
          createdAt: Date.now(),
        };

        const updated = [newImage, ...imageList];
        setImageList(updated);
        onUpdateProject({ storyboards: updated });
        setImagePrompt('');
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. Edit Existing Image
  const handleEditImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageForEdit || !editPrompt.trim()) return;

    setIsEditingImage(true);
    try {
      const response = await fetch('/api/images/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64ImageData: selectedImageForEdit.imageUrl,
          editPrompt: editPrompt,
        }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        const updated = imageList.map((img) =>
          img.id === selectedImageForEdit.id
            ? { ...img, imageUrl: data.imageUrl, prompt: `${img.prompt} [Edited: ${editPrompt}]` }
            : img
        );
        setImageList(updated);
        onUpdateProject({ storyboards: updated });
        setSelectedImageForEdit(null);
        setEditPrompt('');
      }
    } catch (err) {
      console.error('Image edit error:', err);
    } finally {
      setIsEditingImage(false);
    }
  };

  // 4. Append Dictated Text to Scene
  const handleAppendDictationToScene = () => {
    if (!dictatedText.trim() || !targetSceneForDictation) return;

    const updatedBeats = project.beats.map((b) => {
      if (b.id === targetSceneForDictation) {
        const separator = b.content && !b.content.endsWith('\n\n') ? '\n\n' : '';
        return {
          ...b,
          content: `${b.content || ''}${separator}${dictatedText}`,
        };
      }
      return b;
    });

    onUpdateProject({ beats: updatedBeats });
    setDictationAppended(true);
    setTimeout(() => {
      setDictationAppended(false);
      setDictatedText('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Production Suite</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-semibold">{project.title}</span>
            <span aria-hidden="true">·</span>
            <span>Multimodal AI Deck</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Soundtrack, Storyboards &amp; Dictation
          </h1>
        </div>

        <button
          onClick={onNavigateToStudio}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Back to Script Studio</span>
        </button>
      </div>

      {/* 3-Section Segmented Mode Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 max-w-fit">
        <button
          onClick={() => setActiveTab('soundtrack')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'soundtrack'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Lyria Film Score ({musicList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storyboard')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'storyboard'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Nano Banana Storyboards ({imageList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dictation')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            activeTab === 'dictation'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Gemini 3.5 Dictation</span>
        </button>
      </div>

      {/* 1. Soundtrack Section (Lyria) */}
      {activeTab === 'soundtrack' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Generator Card */}
            <div className="lg:col-span-5 bg-[#0c101a] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Music className="w-4 h-4" />
                <span>Lyria Soundtrack Engine</span>
              </div>
              <h2 className="text-lg font-bold text-white font-display">Generate Ambient Scene Score</h2>
              <p className="text-xs text-slate-400">
                Synthesize customized cinematic score cues tailored to the emotional tension of your scenes.
              </p>

              <form onSubmit={handleGenerateMusic} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Acoustic Prompt</label>
                  <textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    placeholder="e.g. Ominous low-frequency synthesizer drone with distorted metallic reverb for orbital airlock breach..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Mood Preset</label>
                    <select
                      value={musicMood}
                      onChange={(e) => setMusicMood(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Cyberpunk Noir Drone">Cyberpunk Noir Drone</option>
                      <option value="Zero-Gravity Solitude">Zero-Gravity Solitude</option>
                      <option value="High-Tension Pursuit">High-Tension Pursuit</option>
                      <option value="Quantum Reversal Unease">Quantum Reversal Unease</option>
                      <option value="Melancholic Synthetic Theme">Melancholic Synthetic Theme</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Duration &amp; Model</label>
                    <select
                      value={musicDuration}
                      onChange={(e) => setMusicDuration(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="clip">Short Clip (Lyria 3 Clip)</option>
                      <option value="full">Full Theme (Lyria 3 Pro)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Attach to Scene Beat</label>
                  <select
                    value={targetSceneForMusic}
                    onChange={(e) => setTargetSceneForMusic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {project.beats.map((b, idx) => (
                      <option key={b.id} value={b.id}>
                        Scene {idx + 1}: {b.beatName} ({b.sceneHeading})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingMusic}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isGeneratingMusic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Cinematic Score...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Soundscape Track</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Soundtracks List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-white font-display">
                Scene Audio Cues ({musicList.length} Tracks)
              </h3>

              <div className="space-y-3">
                {musicList.map((track) => (
                  <AudioPlayerWidget
                    key={track.id}
                    title={track.title}
                    mood={track.mood}
                    audioUrl={track.audioUrl}
                  />
                ))}

                {musicList.length === 0 && !isGeneratingMusic && (
                  <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl p-6 text-slate-500 text-xs space-y-2">
                    <Music className="w-8 h-8 mx-auto text-slate-600" />
                    <p>No soundtrack tracks generated yet.</p>
                    <p className="text-slate-600">Enter a mood prompt on the left to score your scenes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Storyboard & Concept Art Section (Nano Banana 2.1) */}
      {activeTab === 'storyboard' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Image Generator Card */}
            <div className="lg:col-span-5 bg-[#0c101a] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <ImageIcon className="w-4 h-4" />
                <span>Gemini Nano Banana 2.1 Studio</span>
              </div>
              <h2 className="text-lg font-bold text-white font-display">
                Create &amp; Edit Keyframes
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-resolution cinematic concept stills or edit existing storyboards using text instructions.
              </p>

              <form onSubmit={handleGenerateImage} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Visual Concept Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="e.g. Cinematic wide-angle view of a zero-gravity quantum server core with floating bronze sphere and amber telemetry reflections..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Aspect Ratio</label>
                    <select
                      value={imageAspectRatio}
                      onChange={(e) => setImageAspectRatio(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="16:9">16:9 (Cinematic Widescreen)</option>
                      <option value="4:3">4:3 (Classic Academy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Scene Heading</label>
                    <select
                      value={targetSceneForImage}
                      onChange={(e) => setTargetSceneForImage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      {project.beats.map((b, idx) => (
                        <option key={b.id} value={b.id}>
                          Scene {idx + 1}: {b.sceneHeading}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rendering Concept Art (Nano Banana)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Render Keyframe Still</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Storyboard Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-white font-display">
                Storyboard Gallery ({imageList.length} Keyframes)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageList.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedImageForEdit(img)}
                          className="p-1.5 bg-slate-950/80 hover:bg-amber-400 hover:text-slate-950 text-white rounded-lg backdrop-blur-sm text-xs flex items-center gap-1"
                          title="Edit this image with text prompt"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold pr-1">Edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 text-xs space-y-1">
                      <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">
                        {img.sceneHeading}
                      </span>
                      <p className="text-slate-300 text-[11px] line-clamp-2">{img.prompt}</p>
                    </div>
                  </div>
                ))}

                {imageList.length === 0 && !isGeneratingImage && (
                  <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-xl p-6 text-slate-500 text-xs space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                    <p>No storyboard keyframes rendered yet.</p>
                    <p className="text-slate-600">Enter a prompt on the left to visualize your script scenes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Image Modal */}
          {selectedImageForEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="relative w-full max-w-lg bg-[#0c101a] border border-slate-800 rounded-2xl p-6 space-y-4">
                <button
                  onClick={() => setSelectedImageForEdit(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-base font-bold text-white font-display">
                  Edit Concept Art (Gemini Nano Banana 2.1)
                </h3>

                <div className="aspect-video rounded-lg overflow-hidden border border-slate-800">
                  <img
                    src={selectedImageForEdit.imageUrl}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>

                <form onSubmit={handleEditImage} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Text Edit Instruction</label>
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. Add glowing holographic circuits and thick rain reflections..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedImageForEdit(null)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isEditingImage || !editPrompt.trim()}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isEditingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Applying Nano Banana Edit...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Apply Edit</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3. Dictation Section (Gemini 3.5 Transcribe) */}
      {activeTab === 'dictation' && (
        <section className="space-y-6">
          <div className="max-w-2xl bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Mic className="w-4 h-4" />
                <span>Gemini 3.5 Speech-to-Text Transcribe</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display">
                Microphone Screenplay Dictation Chamber
              </h2>
              <p className="text-xs text-slate-400">
                Speak action descriptions, scene beats, or dialogue lines aloud. Gemini 3.5 Transcribe will transcribe it and allow you to insert it straight into your manuscript.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-center">
              <VoiceDictationButton
                onTranscription={(text) => setDictatedText((prev) => (prev ? `${prev} ${text}` : text))}
                label="Click to Start Microphone Dictation"
                className="py-2.5 px-5 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Uses browser microphone input streamed to Gemini 3.5 Transcribe.
              </p>
            </div>

            {dictatedText && (
              <div className="space-y-3 text-xs">
                <label className="text-slate-300 block font-medium">Transcribed Speech Output</label>
                <textarea
                  value={dictatedText}
                  onChange={(e) => setDictatedText(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 font-screenplay leading-relaxed resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Target Scene:</span>
                    <select
                      value={targetSceneForDictation}
                      onChange={(e) => setTargetSceneForDictation(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                    >
                      {project.beats.map((b, idx) => (
                        <option key={b.id} value={b.id}>
                          Scene {idx + 1}: {b.beatName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDictatedText('')}
                      className="px-3 py-1.5 text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>

                    <button
                      onClick={handleAppendDictationToScene}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      {dictationAppended ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>Appended to Scene!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Append into Scene</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
