import React, { useState } from 'react';
import { ScriptProject, CharacterDossier } from '../types';
import { UserCheck, Sparkles, Plus, Trash2, Edit2, ShieldAlert, Cpu, HeartHandshake, ArrowRight } from 'lucide-react';

interface CharacterLabViewProps {
  project: ScriptProject;
  onUpdateProject: (updated: Partial<ScriptProject>) => void;
  onNavigateToStudio: () => void;
  onNavigateToScreenplay: () => void;
}

export const CharacterLabView: React.FC<CharacterLabViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStudio,
  onNavigateToScreenplay,
}) => {
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCharacters = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/script/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: project.topic }),
      });
      const data = await response.json();
      if (data.success && data.characters) {
        onUpdateProject({ characters: data.characters });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Protagonist':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'Antagonist':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Synthetic / AI':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Dossier Lab</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">{project.title}</span>
            <span aria-hidden="true">·</span>
            <span>{project.characters.length} Active Dossiers</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Dramatis Personae &amp; Tech Symbiosis
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateCharacters}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Regenerate Roster</span>
          </button>

          <button
            onClick={onNavigateToStudio}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Open Script Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Narrative Context Card */}
      <div className="p-5 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
        <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">Story Logline</span>
        <p className="text-sm text-slate-200 leading-relaxed">{project.logline}</p>
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">Underlying Frontier:</span>
          <span>{project.topic.realWorldBreakthrough}</span>
        </div>
      </div>

      {/* Characters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.characters.map((char) => (
          <article
            key={char.id}
            className="p-6 bg-[#0c101a] border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {getRoleIcon(char.role)}
                  <span className="font-semibold text-white">{char.role}</span>
                  <span aria-hidden="true">·</span>
                  <span>{char.occupation}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-display mt-1.5">{char.name}</h3>
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

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                  Core Motivation
                </span>
                <p className="text-slate-200 leading-relaxed">{char.coreMotivation}</p>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-rose-400/90 font-semibold block mb-0.5">
                  Fatal Flaw / Blindspot
                </span>
                <p className="text-slate-200 leading-relaxed">{char.fatalFlaw}</p>
              </div>

              <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-900/30">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block mb-0.5">
                  Existential Symbiosis with Technology
                </span>
                <p className="text-slate-200 leading-relaxed">{char.techSymbiosis}</p>
              </div>
            </div>
          </article>
        ))}

        {project.characters.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-xl p-8 space-y-3">
            <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-300 text-sm font-medium">No character dossiers found.</p>
            <p className="text-slate-500 text-xs">Generate a tailored character roster from your chosen premise.</p>
            <button
              onClick={handleGenerateCharacters}
              className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg"
            >
              Generate Character Roster
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
