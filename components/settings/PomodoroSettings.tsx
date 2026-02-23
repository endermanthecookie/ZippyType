
import React from 'react';
import { Timer, Activity, CheckCircle2, AlertCircle, Maximize2, Minimize2, Move } from 'lucide-react';
import { PomodoroSettings as PomodoroSettingsType } from '../../types';

interface PomodoroSettingsProps {
  settings: PomodoroSettingsType;
  setSettings: (s: PomodoroSettingsType) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  settings,
  setSettings,
  saveStatus
}) => {
  const updateSetting = (key: keyof PomodoroSettingsType, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

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
          <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
            <Timer size={22} />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-tighter">Focus Engine (Pomodoro)</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Status</label>
            <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => updateSetting('enabled', true)} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${settings.enabled ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Active
              </button>
              <button 
                onClick={() => updateSetting('enabled', false)} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${!settings.enabled ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                Disabled
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Work Duration (Minutes)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="60" 
                value={settings.defaultMinutes} 
                onChange={e => updateSetting('defaultMinutes', parseInt(e.target.value))} 
                className="flex-1 accent-orange-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer" 
              />
              <span className="text-xl font-black text-white w-12 text-center">{settings.defaultMinutes}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Widget Scale</label>
            <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 gap-2 shadow-inner">
              {(['small', 'medium', 'large'] as const).map(s => (
                <button 
                  key={s} 
                  onClick={() => updateSetting('size', s)} 
                  className={`flex-1 py-3 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${settings.size === s ? 'bg-white/10 text-white shadow-lg border border-white/20' : 'text-slate-500 hover:text-white'}`}
                >
                  {s === 'small' && <Minimize2 size={14} />}
                  {s === 'medium' && <Move size={14} />}
                  {s === 'large' && <Maximize2 size={14} />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "The Focus Engine helps you maintain high-intensity typing sessions by alternating between deep work and short recovery periods. Your stats are tracked separately during focus blocks."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroSettings;
