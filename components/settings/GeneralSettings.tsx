import React from 'react';
import { Volume2, Layout, Globe } from 'lucide-react';
import { SoundProfile, KeyboardLayout } from '../../types';

interface GeneralSettingsProps {
  soundProfile: SoundProfile;
  setSoundProfile: (p: SoundProfile) => void;
  keyboardLayout: KeyboardLayout;
  setKeyboardLayout: (l: KeyboardLayout) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  soundProfile,
  setSoundProfile,
  keyboardLayout,
  setKeyboardLayout
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Volume2 size={14} className="text-indigo-400" /> Sound Profile
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(SoundProfile).map(p => (
            <button
              key={p}
              onClick={() => setSoundProfile(p)}
              className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${soundProfile === p ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-black/20 text-slate-500 border-white/5 hover:border-white/10'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Layout size={14} className="text-purple-400" /> Keyboard Layout
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(KeyboardLayout).map(l => (
            <button
              key={l}
              onClick={() => setKeyboardLayout(l)}
              className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${keyboardLayout === l ? 'bg-purple-600 text-white border-purple-500 shadow-lg' : 'bg-black/20 text-slate-500 border-white/5 hover:border-white/10'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
