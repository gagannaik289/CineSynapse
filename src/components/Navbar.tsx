import React, { useState } from 'react';
import { PlusCircle, BookOpen, LogIn, LogOut, User as UserIcon, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'radar' | 'studio' | 'production' | 'screenplay' | 'characters' | 'teleprompter';
  onSelectTab: (tab: 'radar' | 'studio' | 'production' | 'screenplay' | 'characters' | 'teleprompter') => void;
  onOpenNewProjectModal: () => void;
  onOpenLibraryModal: () => void;
  activeProjectTitle?: string;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewProjectModal,
  onOpenLibraryModal,
  activeProjectTitle,
  isCloudSynced,
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onSelectTab('radar')}
        className="cursor-pointer text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display flex items-center gap-2 hover:text-amber-400 transition-colors"
      >
        <span>CineSynapse</span>
        <span className="text-xs text-slate-500 font-normal font-sans hidden sm:inline">· AI Sci-Fi Script Studio</span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('radar')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'radar' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Trending Radar
        </button>

        <button
          onClick={() => onSelectTab('studio')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'studio' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Script Studio
        </button>

        <button
          onClick={() => onSelectTab('production')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'production' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Production Suite
        </button>

        <button
          onClick={() => onSelectTab('screenplay')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'screenplay' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Screenplay Reader
        </button>

        <button
          onClick={() => onSelectTab('characters')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'characters' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Dossier Lab
        </button>

        <button
          onClick={() => onSelectTab('teleprompter')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'teleprompter' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Teleprompter
        </button>
      </nav>

      {/* Zone 3: 1 primary action + User Account */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Library Button */}
        <button
          onClick={onOpenLibraryModal}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Open Screenplay Vault"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">My Scripts</span>
        </button>

        {/* User Authentication Profile or Sign In */}
        {!loading && (
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <span className="hidden xl:inline text-slate-300 font-medium truncate max-w-[100px]">
                    {user.displayName?.split(' ')[0] || 'Author'}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0c101a] border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{user.displayName || 'Author'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenLibraryModal();
                      }}
                      className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2"
                    >
                      <Cloud className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cloud Library</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        signOut();
                      }}
                      className="w-full px-3 py-2 text-left text-rose-400 hover:bg-slate-900 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewProjectModal}
          className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Script Draft</span>
        </button>
      </div>
    </header>
  );
};
