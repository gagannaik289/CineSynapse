import React, { useState } from 'react';
import { SciFiTopic, SubgenreType } from '../types';
import { Search, Sparkles, ArrowRight, Compass, Film, BookOpen, Layers, X, Loader2 } from 'lucide-react';

interface TopicRadarViewProps {
  topics: SciFiTopic[];
  onSelectTopicForScript: (topic: SciFiTopic) => void;
  onAddNewGeneratedTopics: (newTopics: SciFiTopic[]) => void;
}

export const TopicRadarView: React.FC<TopicRadarViewProps> = ({
  topics,
  onSelectTopicForScript,
  onAddNewGeneratedTopics,
}) => {
  const [selectedSubgenre, setSelectedSubgenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingTopic, setInspectingTopic] = useState<SciFiTopic | null>(null);

  // AI Generator Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genSubgenre, setGenSubgenre] = useState<string>('Near-Future Thriller');
  const [genFocusArea, setGenFocusArea] = useState<string>('Autonomous Swarms & AI Alignment');
  const [genTone, setGenTone] = useState<string>('Cinematic & High-Stakes');
  const [genCustomPrompt, setGenCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const subgenres: { id: string; label: string }[] = [
    { id: 'all', label: 'All Subgenres' },
    { id: 'Near-Future Thriller', label: 'Near-Future Thriller' },
    { id: 'Cyberpunk Noir', label: 'Cyberpunk Noir' },
    { id: 'Hard Sci-Fi', label: 'Hard Sci-Fi' },
    { id: 'Philosophical Speculative', label: 'Philosophical Speculative' },
    { id: 'Tech Satire', label: 'Tech Satire' },
  ];

  const filteredTopics = topics.filter((t) => {
    const matchesGenre = selectedSubgenre === 'all' || t.subgenre === selectedSubgenre;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.highConceptLogline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.realWorldBreakthrough.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.centralPhilosophicalDilemma.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleGenerateTopics = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratorError(null);

    try {
      const response = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subgenre: genSubgenre,
          focusArea: genFocusArea,
          tone: genTone,
          customPrompt: genCustomPrompt,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate topics');
      }

      onAddNewGeneratedTopics(data.topics);
      setIsGeneratorOpen(false);
      setGenCustomPrompt('');
    } catch (err: any) {
      setGeneratorError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isAnalyzingBreakthroughs, setIsAnalyzingBreakthroughs] = useState(false);
  const [breakthroughSuccessMsg, setBreakthroughSuccessMsg] = useState<string | null>(null);

  const handleAnalyzeBreakthroughs = async () => {
    setIsAnalyzingBreakthroughs(true);
    setBreakthroughSuccessMsg(null);
    try {
      const response = await fetch('/api/topics/analyze-breakthroughs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!data.success || !data.topics) {
        throw new Error(data.error || 'Failed to analyze breakthroughs');
      }

      onAddNewGeneratedTopics(data.topics);
      setBreakthroughSuccessMsg(`Analyzed breakthroughs: ${data.topics.length} new high-concept topics added to your radar!`);
      setTimeout(() => setBreakthroughSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Breakthrough analysis error:', err);
    } finally {
      setIsAnalyzingBreakthroughs(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Toast feedback notification */}
      {breakthroughSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{breakthroughSuccessMsg}</span>
          </div>
          <button onClick={() => setBreakthroughSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Banner with Generated Cinematic Asset and Fallback */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#090d16] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px]">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
                <span>Speculative Fiction Radar</span>
                <span aria-hidden="true">·</span>
                <span>AI &amp; Tech Breakthroughs</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{topics.length} Narrative Seeds</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display leading-tight text-balance">
                Frontier AI Reimagined for the Screen
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                Synthesize high-concept speculative sci-fi storylines grounded in real-world neural interfaces, AGI safety dilemmas, and quantum frontiers.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAnalyzeBreakthroughs}
                disabled={isAnalyzingBreakthroughs}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-950/20 active:scale-95 disabled:opacity-75"
              >
                {isAnalyzingBreakthroughs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Frontiers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Scan Breakthroughs (Gemini)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Custom Seed</span>
              </button>

              <a
                href="#topic-catalog"
                className="px-3.5 py-2.5 text-slate-400 hover:text-slate-200 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Explore ({filteredTopics.length})</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset with Fallback */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800/80">
            <img
              src="/src/assets/images/scifi_neural_lab_1792574798243.jpg"
              alt="Near-future neurotechnology laboratory visual"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#090d16]/90 lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 z-10 text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-800/80">
              <p className="font-medium text-white text-xs">Neuro-Connectome Lab · Concept Keyframe</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Grounding speculative cinema in emerging science</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section id="topic-catalog" className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Subgenre Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
            {subgenres.map((sg) => (
              <button
                key={sg.id}
                onClick={() => setSelectedSubgenre(sg.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedSubgenre === sg.id
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sg.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search concepts, dilemmas, technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter results count */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Showing <strong className="text-slate-300 font-semibold tabular-nums">{filteredTopics.length}</strong> concepts</span>
          {selectedSubgenre !== 'all' && (
            <>
              <span aria-hidden="true">·</span>
              <span>{selectedSubgenre}</span>
            </>
          )}
        </div>
      </section>

      {/* Grid of Trending Topics - Clean, Decluttered, Breathing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <article
            key={topic.id}
            className="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#0a0e17]/80 hover:bg-[#0e1322] hover:border-slate-700/80 p-6 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/40"
          >
            <div className="space-y-3">
              {/* Unboxed Metadata (NO PILLS) */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-amber-400">{topic.subgenre}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[200px] text-slate-400">{topic.realWorldBreakthrough}</span>
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors font-display leading-snug">
                {topic.title}
              </h2>

              {/* High Concept Logline - Concise and Breathing */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {topic.highConceptLogline}
              </p>
            </div>

            {/* Bottom Card Actions: Sleek & Intentional */}
            <div className="pt-5 mt-5 border-t border-slate-800/70 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingTopic(topic)}
                className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors flex items-center gap-1"
              >
                <span>Pitch Details</span>
                <span aria-hidden="true">&rarr;</span>
              </button>

              <button
                onClick={() => onSelectTopicForScript(topic)}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Develop Script</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}

        {filteredTopics.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-xl p-8 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-300 text-sm font-medium">No topics found matching your criteria.</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Try adjusting your search terms, select a different subgenre, or generate fresh topics with Gemini AI.
            </p>
            <button
              onClick={() => { setSelectedSubgenre('all'); setSearchQuery(''); }}
              className="mt-3 px-4 py-1.5 text-xs text-amber-400 border border-amber-400/30 rounded-md hover:bg-amber-400/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Deep Dive Inspect Modal */}
      {inspectingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectingTopic(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <span>{inspectingTopic.subgenre}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{inspectingTopic.realWorldBreakthrough}</span>
              </div>
              <h2 className="text-2xl font-bold text-white font-display">
                {inspectingTopic.title}
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">High-Concept Logline</span>
                <p className="text-slate-200 leading-relaxed">{inspectingTopic.highConceptLogline}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Philosophical Dilemma</span>
                  <p className="text-slate-300 italic">{inspectingTopic.centralPhilosophicalDilemma}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold block">Suggested Protagonist</span>
                    <p className="text-xs text-slate-300 mt-1">{inspectingTopic.suggestedProtagonist}</p>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold block">Antagonist or System</span>
                    <p className="text-xs text-slate-300 mt-1">{inspectingTopic.suggestedAntagonistOrSystem}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs uppercase font-semibold text-slate-400 block mb-2">Three-Act Narrative Trajectory</span>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                      <strong className="text-amber-400 mr-1.5">Act I:</strong>
                      <span className="text-slate-300">{inspectingTopic.actTrajectory.act1}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                      <strong className="text-amber-400 mr-1.5">Act II:</strong>
                      <span className="text-slate-300">{inspectingTopic.actTrajectory.act2}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                      <strong className="text-amber-400 mr-1.5">Act III:</strong>
                      <span className="text-slate-300">{inspectingTopic.actTrajectory.act3}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setInspectingTopic(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const topic = inspectingTopic;
                  setInspectingTopic(null);
                  onSelectTopicForScript(topic);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Open in Script Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live AI Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <button
              onClick={() => !isGenerating && setIsGeneratorOpen(false)}
              disabled={isGenerating}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 3.8 Flash Speculative Engine</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display mt-1">
                Synthesize Breakthrough Story Topics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Generate fresh, grounded narrative premises based on real-world AI dilemmas.
              </p>
            </div>

            <form onSubmit={handleGenerateTopics} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Target Subgenre</label>
                <select
                  value={genSubgenre}
                  onChange={(e) => setGenSubgenre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Near-Future Thriller">Near-Future Thriller</option>
                  <option value="Cyberpunk Noir">Cyberpunk Noir</option>
                  <option value="Hard Sci-Fi">Hard Sci-Fi</option>
                  <option value="Philosophical Speculative">Philosophical Speculative</option>
                  <option value="Tech Satire">Tech Satire</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">AI / Technology Frontier</label>
                <input
                  type="text"
                  value={genFocusArea}
                  onChange={(e) => setGenFocusArea(e.target.value)}
                  placeholder="e.g. Cognitive Digital Twins, Neuromorphic Chips, Swarm Pacifism..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Tone &amp; Cinematic Texture</label>
                <select
                  value={genTone}
                  onChange={(e) => setGenTone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Cinematic & High-Stakes">Cinematic &amp; High-Stakes (e.g. Ex Machina, Devs)</option>
                  <option value="Gritty Neo-Noir">Gritty Neo-Noir (e.g. Blade Runner 2049, Minority Report)</option>
                  <option value="Intimate Psychological Drama">Intimate Psychological Drama (e.g. Her, After Yang)</option>
                  <option value="Biting Sharp Satire">Biting Sharp Satire (e.g. Severance, Don't Look Up)</option>
                  <option value="Cerebral Hard Sci-Fi">Cerebral Hard Sci-Fi (e.g. Primer, Arrival, 2001)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Custom Narrative Constraint (Optional)
                </label>
                <textarea
                  value={genCustomPrompt}
                  onChange={(e) => setGenCustomPrompt(e.target.value)}
                  placeholder="e.g. Single-location chamber piece; focus on the legal defense of an autonomous surgical agent..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {generatorError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
                  {generatorError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Premises...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate 3 Topics</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
