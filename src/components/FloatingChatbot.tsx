import React, { useState, useRef, useEffect } from 'react';
import { ScriptProject, ChatMessage } from '../types';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowDownToLine, 
  Loader2, 
  Bot, 
  User, 
  RotateCcw,
  Zap,
  Brain
} from 'lucide-react';

interface FloatingChatbotProps {
  project: ScriptProject;
  activeBeatIndex?: number;
  onInsertIntoScene?: (text: string) => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  project,
  activeBeatIndex = 0,
  onInsertIntoScene,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [modelTier, setModelTier] = useState<'general' | 'complex' | 'fast'>('general');
  const [systemRole, setSystemRole] = useState<'doctor' | 'dialogue' | 'worldbuilder' | 'plotter'>('doctor');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello! I'm your Gemini Screenplay Co-Pilot primed on "${project.title}". Ask me to diagnose scene tension, craft punchy dialogue, audit sci-fi logic, or workshop plot twists.`,
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const activeBeat = project.beats[activeBeatIndex] || project.beats[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread,
          systemRole,
          modelTier,
          scriptContext: {
            title: project.title,
            logline: project.logline,
            format: project.format,
            activeBeat: activeBeat ? `${activeBeat.beatName} (${activeBeat.sceneHeading})` : 'General Overview',
            characters: project.characters.map((c) => ({ name: c.name, role: c.role, flaw: c.fatalFlaw })),
          },
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to get AI reply');

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages([...newThread, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Trouble connecting: ${err.message}. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages([...newThread, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Punch up dialogue with more subtext',
    'Audit scientific/AI realism in this scene',
    'Suggest 2 unexpected plot reversals',
    'Deepen the ethical dilemma for Elena',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-full shadow-2xl shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
        title="Open Gemini Writer's Room Chatbot"
      >
        <Bot className="w-5 h-5" />
        <span className="text-xs pr-1 font-semibold hidden md:inline">Writer's Room AI</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 bg-[#0c101a] border border-slate-800 rounded-2xl shadow-2xl transition-all duration-200 flex flex-col ${
        isMinimized ? 'w-80 h-14 overflow-hidden' : 'w-[92vw] sm:w-[460px] h-[580px] max-h-[85vh]'
      }`}
    >
      {/* Top Chatbot Bar */}
      <div className="px-4 py-3 bg-[#0a0d14] border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-white font-display truncate">
            Writer's Room AI
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[120px]">
            {project.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Persona and Model Controls */}
          <div className="px-4 py-2.5 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {/* System Role Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Persona:</span>
              <select
                value={systemRole}
                onChange={(e) => setSystemRole(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-slate-200 focus:outline-none focus:border-amber-400 text-[11px]"
              >
                <option value="doctor">Senior Script Doctor</option>
                <option value="dialogue">Dialogue Stylist</option>
                <option value="worldbuilder">Sci-Fi Worldbuilder</option>
                <option value="plotter">Plot Twist Architect</option>
              </select>
            </div>

            {/* Model Tier Selector */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800">
              <button
                onClick={() => setModelTier('fast')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  modelTier === 'fast' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="gemini-3.1-flash-lite (Ultra-Fast Brainstorming)"
              >
                Lite
              </button>
              <button
                onClick={() => setModelTier('general')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  modelTier === 'general' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="gemini-3.8-flash (General Creative Tasks)"
              >
                Flash
              </button>
              <button
                onClick={() => setModelTier('complex')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  modelTier === 'complex' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="gemini-4-argon (Complex Plot Reasoning & Structural Analysis)"
              >
                Argon
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl max-w-[85%] space-y-1.5 ${
                    m.role === 'user'
                      ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {m.role === 'model' && (
                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-end gap-2 text-[10px] text-slate-400">
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-white flex items-center gap-1"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onInsertIntoScene && (
                        <button
                          onClick={() => onInsertIntoScene(m.content)}
                          className="hover:text-amber-400 flex items-center gap-1 text-slate-300 font-medium"
                          title="Insert dialogue or notes into active scene"
                        >
                          <ArrowDownToLine className="w-3 h-3 text-amber-400" />
                          <span>Insert to Scene</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Screenplay Doctor is analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            {quickPrompts.map((qp) => (
              <button
                key={qp}
                onClick={() => handleSendMessage(qp)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0a0d14] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask ${systemRole === 'dialogue' ? 'for dialogue lines...' : 'about your scene...'}`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
