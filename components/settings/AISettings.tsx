
import React from 'react';
import { Globe, Github, HelpCircle, Lock, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIProvider, Difficulty } from '../../types';

interface AISettingsProps {
  provider: AIProvider;
  setProvider: (p: AIProvider) => void;
  githubToken: string;
  setGithubToken: (t: string) => void;
  showGithubHelp: boolean;
  setShowGithubHelp: (s: boolean) => void;
  aiOpponentCount: number;
  setAiOpponentCount: (c: number) => void;
  aiOpponentDifficulty: Difficulty;
  setAiOpponentDifficulty: (d: Difficulty) => void;
  speedUnit: 'wpm' | 'cpm';
  setSpeedUnit: (u: 'wpm' | 'cpm') => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const AISettings: React.FC<AISettingsProps> = ({
  provider,
  setProvider,
  githubToken,
  setGithubToken,
  showGithubHelp,
  setShowGithubHelp,
  aiOpponentCount,
  setAiOpponentCount,
  aiOpponentDifficulty,
  setAiOpponentDifficulty,
  speedUnit,
  setSpeedUnit,
  saveStatus
}) => {
  return (
    <div className="glass rounded-[2rem] p-10 space-y-10 border border-white/10 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
      {saveStatus !== 'idle' && (
          <div className={`absolute top-10 right-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2
            ${saveStatus === 'saving' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
              saveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {saveStatus === 'saving' ? <Activity size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Synced' : 'Sync Error'}
          </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Globe size={22} />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-tighter">Advanced AI Config</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Text Generator</label>
            <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setProvider(AIProvider.GEMINI)} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${provider === AIProvider.GEMINI ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <Globe size={12}/> Gemini
              </button>
              <button 
                onClick={() => setProvider(AIProvider.GITHUB)} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${provider === AIProvider.GITHUB ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <Github size={12}/> GPT-4o (GitHub)
              </button>
            </div>
          </div>
          
          {provider === AIProvider.GITHUB && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">GitHub Token</label>
                <button onClick={() => setShowGithubHelp(!showGithubHelp)} className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                  <HelpCircle size={10} /> How to get?
                </button>
              </div>
              <div className="relative group/token">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/token:text-indigo-400 transition-colors" size={14} />
                <input 
                  type="password" 
                  placeholder="ghp_xxxxxxxxxxxx" 
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-[10px] font-mono text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                />
              </div>
              {showGithubHelp && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2 animate-in fade-in zoom-in-95">
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    1. Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-400 underline">GitHub Settings</a><br/>
                    2. Generate a <span className="text-white">Classic Token</span>.<br/>
                    3. Set <span className="text-white">Models</span> permission to <span className="text-white">On</span> and <span className="text-white">Read-only</span>.<br/>
                    4. Paste it here to enable GPT-4o mini text generation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Speed Unit</label>
            <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setSpeedUnit('wpm')} 
                className={`flex-1 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${speedUnit === 'wpm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                WPM
              </button>
              <button 
                onClick={() => setSpeedUnit('cpm')} 
                className={`flex-1 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${speedUnit === 'cpm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                CPM
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">AI Competitors (1-5)</label>
            <div className="flex items-center px-1">
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={aiOpponentCount} 
                onChange={e => setAiOpponentCount(parseInt(e.target.value))} 
                className="flex-1 accent-indigo-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer" 
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Bot Difficulty</label>
            <div className="flex flex-wrap bg-black/50 p-1.5 rounded-xl border border-white/5 gap-2 shadow-inner">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.PRO, Difficulty.INSANE].map(d => (
                <button 
                  key={d} 
                  onClick={() => setAiOpponentDifficulty(d)} 
                  className={`flex-1 py-3 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${aiOpponentDifficulty === d ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
