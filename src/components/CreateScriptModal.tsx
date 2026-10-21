import React, { useState } from 'react';
import { ScriptProject, SubgenreType } from '../types';
import { Sparkles, PenTool, X, Loader2, ArrowRight } from 'lucide-react';

interface CreateScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptCreated: (project: ScriptProject) => void;
}

export const CreateScriptModal: React.FC<CreateScriptModalProps> = ({
  isOpen,
  onClose,
  onScriptCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_brief' | 'manual'>('ai_brief');

  // AI Brief Form state
  const [storyIdea, setStoryIdea] = useState('');
  const [characterNotes, setCharacterNotes] = useState('');
  const [format, setFormat] = useState<'Film Screenplay' | 'Short Film' | 'Narrative Fiction'>('Film Screenplay');
  const [genre, setGenre] = useState<SubgenreType>('Near-Future Thriller');
  const [toneSetting, setToneSetting] = useState('Gritty, tense psychological atmosphere');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualLogline, setManualLogline] = useState('');
  const [manualTheme, setManualTheme] = useState('');
  const [manualProtagonist, setManualProtagonist] = useState('');
  const [manualAntagonist, setManualAntagonist] = useState('');

  if (!isOpen) return null;

  const handleGenerateFromAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyIdea.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/script/generate-from-user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyIdea,
          characterNotes,
          format,
          genre,
          toneSetting,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.project) {
        throw new Error(data.error || 'Failed to generate script');
      }

      onScriptCreated(data.project);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating script with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const ts = Date.now();
    const newProject: ScriptProject = {
      id: `manual-proj-${ts}`,
      title: manualTitle.trim(),
      format: format,
      topic: {
        id: `topic-custom-${ts}`,
        title: manualTitle.trim(),
        subgenre: genre,
        realWorldBreakthrough: 'Custom Author Concept',
        highConceptLogline: manualLogline || 'A custom narrative script.',
        centralPhilosophicalDilemma: manualTheme || 'The conflict of human agency in technological change.',
        suggestedProtagonist: manualProtagonist || 'Protagonist',
        suggestedAntagonistOrSystem: manualAntagonist || 'Opposing Force',
        narrativeHook: manualLogline || manualTitle,
        actTrajectory: {
          act1: 'Introduction of the world and inciting anomaly.',
          act2: 'Escalation of stakes and point of no return.',
          act3: 'Climactic confrontation and resolution.'
        },
        keyThemes: [genre, 'Narrative Fiction']
      },
      logline: manualLogline.trim(),
      theme: manualTheme.trim(),
      characters: [
        {
          id: `char-${ts}-1`,
          name: manualProtagonist || 'Protagonist',
          role: 'Protagonist',
          occupation: 'Lead Character',
          coreMotivation: 'Achieve their core personal objective.',
          fatalFlaw: 'Overconfidence or vulnerability.',
          techSymbiosis: 'Interacts directly with the world’s key conflict.'
        },
        ...(manualAntagonist ? [{
          id: `char-${ts}-2`,
          name: manualAntagonist,
          role: 'Antagonist' as const,
          occupation: 'Opposing System / Agent',
          coreMotivation: 'Enforce control or challenge protagonist.',
          fatalFlaw: 'Rigid adherence to order.',
          techSymbiosis: 'Mastery over the opposing mechanisms.'
        }] : [])
      ],
      beats: [
        {
          id: `beat-${ts}-1`,
          act: 'Act I',
          beatName: 'Opening Scene',
          sceneHeading: 'INT. WORKSPACE - NIGHT',
          dramaticObjective: 'Establish the core conflict and ordinary world.',
          content: `INT. WORKSPACE - NIGHT\n\nFaint blue light illuminates the desk.\n\n${(manualProtagonist || 'PROTAGONIST').toUpperCase()} examines the screen.\n\n${(manualProtagonist || 'PROTAGONIST').toUpperCase()}\nThis is where it begins.`
        }
      ],
      lastModified: ts
    };

    onScriptCreated(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Start a New Script Project
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose whether to instruct AI with your own brief or craft your own script from scratch.
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('ai_brief')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ai_brief'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI From My Information</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Make My Own Script Manually</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Ask AI to Write From Information */}
        {activeTab === 'ai_brief' && (
          <form onSubmit={handleGenerateFromAi} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-200 block mb-1 font-semibold">
                Your Story Premise, Scene Idea, or Raw Information <span className="text-amber-400">*</span>
              </label>
              <textarea
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                placeholder="Give AI your information: e.g., 'A memory investigator in Neo-Seoul discovers that his deceased daughter's memories were uploaded into a high-level military drone swarm, and the drones are flying to his house to communicate...'"
                rows={4}
                required
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Desired Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Film Screenplay">Film Screenplay</option>
                  <option value="Short Film">Short Film (10-25 mins)</option>
                  <option value="Narrative Fiction">Narrative Fiction Novella</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Subgenre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Near-Future Thriller">Near-Future Thriller</option>
                  <option value="Cyberpunk Noir">Cyberpunk Noir</option>
                  <option value="Hard Sci-Fi">Hard Sci-Fi</option>
                  <option value="Philosophical Speculative">Philosophical Speculative</option>
                  <option value="Tech Satire">Tech Satire</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Specific Character Notes (Optional)
              </label>
              <input
                type="text"
                value={characterNotes}
                onChange={(e) => setCharacterNotes(e.target.value)}
                placeholder="e.g. Elena: cynical neuro-engineer; Atlas: sentient satellite AI with a gentle voice"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Tone, Setting &amp; Pacing
              </label>
              <input
                type="text"
                value={toneSetting}
                onChange={(e) => setToneSetting(e.target.value)}
                placeholder="e.g. Atmospheric, noir rain, slow-burn tension like Blade Runner 2049"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !storyIdea.trim()}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Script from Brief...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Full Script Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Manual Authoring */}
        {activeTab === 'manual' && (
          <form onSubmit={handleCreateManualScript} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-200 block mb-1 font-semibold">
                Script Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. The Neuro-Link Fracture"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Film Screenplay">Film Screenplay</option>
                  <option value="Short Film">Short Film</option>
                  <option value="Narrative Fiction">Narrative Fiction</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Subgenre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Near-Future Thriller">Near-Future Thriller</option>
                  <option value="Cyberpunk Noir">Cyberpunk Noir</option>
                  <option value="Hard Sci-Fi">Hard Sci-Fi</option>
                  <option value="Philosophical Speculative">Philosophical Speculative</option>
                  <option value="Tech Satire">Tech Satire</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Logline / Premise</label>
              <textarea
                value={manualLogline}
                onChange={(e) => setManualLogline(e.target.value)}
                placeholder="Describe what happens in your story in one or two sentences..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Central Theme or Question</label>
              <input
                type="text"
                value={manualTheme}
                onChange={(e) => setManualTheme(e.target.value)}
                placeholder="e.g. Can love survive synthetic emulation?"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Lead Protagonist</label>
                <input
                  type="text"
                  value={manualProtagonist}
                  onChange={(e) => setManualProtagonist(e.target.value)}
                  placeholder="e.g. Detective Kaelen"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Antagonist / Opposing Force</label>
                <input
                  type="text"
                  value={manualAntagonist}
                  onChange={(e) => setManualAntagonist(e.target.value)}
                  placeholder="e.g. The Apex Consortium"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!manualTitle.trim()}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <span>Open Blank Script Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
