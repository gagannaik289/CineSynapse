import React, { useState, useEffect } from 'react';
import { ScriptProject } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { BookOpen, Trash2, Clock, Cloud, ArrowRight, X, LogIn, HardDrive } from 'lucide-react';

interface CloudLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ScriptProject) => void;
  currentProjectId: string;
}

export const CloudLibraryModal: React.FC<CloudLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  currentProjectId,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [cloudScripts, setCloudScripts] = useState<ScriptProject[]>([]);
  const [localScripts, setLocalScripts] = useState<ScriptProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load local storage scripts
    try {
      const savedProjectsRaw = localStorage.getItem('cinesynapse_saved_projects');
      if (savedProjectsRaw) {
        const parsed = JSON.parse(savedProjectsRaw);
        if (Array.isArray(parsed)) setLocalScripts(parsed);
      }
    } catch (e) {
      console.warn(e);
    }

    // Load cloud Firestore scripts if user is logged in
    if (user) {
      setIsLoading(true);
      const scriptsPath = `users/${user.uid}/scripts`;
      getDocs(collection(db, 'users', user.uid, 'scripts'))
        .then((snapshot) => {
          const scripts: ScriptProject[] = [];
          snapshot.forEach((docSnap) => {
            scripts.push(docSnap.data() as ScriptProject);
          });
          setCloudScripts(scripts);
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.LIST, scriptsPath);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleDeleteLocal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = localScripts.filter((s) => s.id !== id);
    setLocalScripts(updated);
    localStorage.setItem('cinesynapse_saved_projects', JSON.stringify(updated));
  };

  const handleDeleteCloud = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'scripts', id));
      setCloudScripts((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/scripts/${id}`);
    }
  };

  const displayedScripts = user && cloudScripts.length > 0 ? cloudScripts : localScripts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0c101a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            {user ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
            <span>{user ? 'Cloud Script Vault' : 'Local Script Vault'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
            My Screenplay Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {user
              ? `Logged in as ${user.displayName || user.email}. Scripts are securely synced to your cloud account.`
              : 'Scripts are stored locally on your device. Sign in with Google to sync across all your devices.'}
          </p>
        </div>

        {!user && (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              <span className="font-semibold text-white block">Save your work to the Cloud</span>
              <span>Sign in with Google to ensure your drafts and AI scripts are never lost.</span>
            </div>
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap shadow-sm shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        <div className="space-y-3">
          {displayedScripts.map((script) => (
            <div
              key={script.id}
              onClick={() => {
                onSelectProject(script);
                onClose();
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                script.id === currentProjectId
                  ? 'bg-amber-400/10 border-amber-400/70 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-400">{script.format}</span>
                  <span aria-hidden="true">·</span>
                  <span>{script.topic?.subgenre || 'Sci-Fi'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(script.lastModified).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white truncate font-display">
                  {script.title}
                </h3>

                <p className="text-xs text-slate-400 truncate max-w-lg">
                  {script.logline || 'No logline provided.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    if (user && cloudScripts.some((s) => s.id === script.id)) {
                      handleDeleteCloud(script.id, e);
                    } else {
                      handleDeleteLocal(script.id, e);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                  title="Delete script"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="p-1.5 text-slate-400 hover:text-white">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {displayedScripts.length === 0 && !isLoading && (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl p-6 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No saved scripts yet.</p>
              <p className="text-xs text-slate-500">
                Create a new script manually, pick from trending topics, or ask AI to write one from your ideas.
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
