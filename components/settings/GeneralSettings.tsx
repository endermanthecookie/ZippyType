import React, { useState } from 'react';
import { Volume2, Layout, Globe, X, Sparkles, Link2, CheckCircle2 } from 'lucide-react';
import { SoundProfile, KeyboardLayout } from '../../types';
import { useTranslation } from '../../src/LanguageContext';

interface GeneralSettingsProps {
  soundProfile: SoundProfile;
  setSoundProfile: (p: SoundProfile) => void;
  keyboardLayout: KeyboardLayout;
  setKeyboardLayout: (l: KeyboardLayout) => void;
  musicVolume: number;
  setMusicVolume: (v: number) => void;
  musicEnabled: boolean;
  setMusicEnabled: (v: boolean) => void;
  sfxVolume: number;
  setSfxVolume: (v: number) => void;
  userId?: string;
  discordId?: string;
  onDiscordLinked?: (id: string) => void;
  zenMode: boolean;
  setZenMode: (v: boolean) => void;
  focusPenalty: boolean;
  setFocusPenalty: (v: boolean) => void;
  ghostRacing: boolean;
  setGhostRacing: (v: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (v: boolean) => void;
  blindMode: boolean;
  setBlindMode: (v: boolean) => void;
  streamerMode: boolean;
  setStreamerMode: (v: boolean) => void;
  triggerError: () => void;
  triggerPayment: () => void;
  resetTutorial: () => void;
  triggerOldBrowser: () => void;
}

const languages = [
  { code: 'english', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ko', label: '한국어' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'da', label: 'Dansk' },
  { code: 'es', label: 'Español' }
];

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  soundProfile,
  setSoundProfile,
  keyboardLayout,
  setKeyboardLayout,
  musicVolume,
  setMusicVolume,
  musicEnabled,
  setMusicEnabled,
  sfxVolume,
  setSfxVolume,
  userId,
  discordId,
  onDiscordLinked,
  zenMode,
  setZenMode,
  focusPenalty,
  setFocusPenalty,
  ghostRacing,
  setGhostRacing,
  showHeatmap,
  setShowHeatmap,
  blindMode,
  setBlindMode,
  streamerMode,
  setStreamerMode,
  triggerError,
  triggerPayment,
  resetTutorial,
  triggerOldBrowser
}) => {
  const { t, currentLang, setLanguage, loading } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [isLinkingDiscord, setIsLinkingDiscord] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showDevSettings, setShowDevSettings] = useState(false);

  const handleInvisibleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setShowDevSettings(true);
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 1000);
  };

  const currentLangLabel = languages.find(l => l.code === currentLang)?.label || 'English';

  const handleLinkDiscord = () => {
    if (!userId) {
      alert(t('loginToLinkDiscord') || "Please sign in first to link your Discord account.");
      return;
    }
    
    setIsLinkingDiscord(true);
    
    // Open popup for Discord OAuth
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `/api/auth/discord/url?userId=${userId}`,
      'Discord Link',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const messageListener = (event: MessageEvent) => {
      if (event.data?.type === 'DISCORD_LINK_SUCCESS') {
        if (onDiscordLinked) onDiscordLinked(event.data.discordId);
        setIsLinkingDiscord(false);
        window.removeEventListener('message', messageListener);
      } else if (event.data?.type === 'DISCORD_LINK_ERROR') {
        alert(t('discordLinkFailed') || "Failed to link Discord account.");
        setIsLinkingDiscord(false);
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    // Check if popup closed
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setIsLinkingDiscord(false);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Globe size={14} className="text-cyan-400" /> {t('language')}
        </h3>
        <button
          onClick={() => setShowLangModal(true)}
          className="w-full py-4 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-between px-6"
        >
          <span>{currentLangLabel}</span>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest">{t('change')}</span>
        </button>
      </div>

      <div className="p-6 glass border border-white/10 rounded-2xl space-y-6">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Volume2 size={14} className="text-indigo-400" /> {t('volumeControl')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Enable Music</span>
              <p className="text-[9px] text-slate-500">Toggle in-game background music</p>
            </div>
            <button 
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`w-10 h-5 rounded-full transition-all relative ${musicEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${musicEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('musicVolume')}</span>
              <span className="text-[10px] font-mono text-indigo-400">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('sfxVolume')}</span>
              <span className="text-[10px] font-mono text-indigo-400">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Volume2 size={14} className="text-indigo-400" /> {t('soundProfile')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(SoundProfile).map(p => (
            <button
              key={p}
              onClick={() => setSoundProfile(p)}
              className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${soundProfile === p ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-black/20 text-slate-500 border-white/5 hover:border-white/10'}`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" /> Game Experience
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Zen Mode</span>
              <p className="text-[9px] text-slate-500">Hide UI elements during race</p>
            </div>
            <button 
              onClick={() => setZenMode(!zenMode)}
              className={`w-10 h-5 rounded-full transition-all relative ${zenMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${zenMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Focus Penalty</span>
              <p className="text-[9px] text-slate-500">Shake screen on low accuracy</p>
            </div>
            <button 
              onClick={() => setFocusPenalty(!focusPenalty)}
              className={`w-10 h-5 rounded-full transition-all relative ${focusPenalty ? 'bg-rose-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${focusPenalty ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Ghost Racing</span>
              <p className="text-[9px] text-slate-500">Race against your personal best</p>
            </div>
            <button 
              onClick={() => setGhostRacing(!ghostRacing)}
              className={`w-10 h-5 rounded-full transition-all relative ${ghostRacing ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${ghostRacing ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Interactive Heatmap</span>
              <p className="text-[9px] text-slate-500">Show key speed data in stats</p>
            </div>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`w-10 h-5 rounded-full transition-all relative ${showHeatmap ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showHeatmap ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Blind Mode</span>
              <p className="text-[9px] text-slate-500">Text fades out as you type</p>
            </div>
            <button 
              onClick={() => setBlindMode(!blindMode)}
              className={`w-10 h-5 rounded-full transition-all relative ${blindMode ? 'bg-red-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${blindMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Streamer Mode</span>
              <p className="text-[9px] text-slate-500">Hide sensitive information</p>
            </div>
            <button 
              onClick={() => setStreamerMode(!streamerMode)}
              className={`w-10 h-5 rounded-full transition-all relative ${streamerMode ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${streamerMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Layout size={14} className="text-purple-400" /> {t('keyboardLayout')}
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

      <div className="p-6 glass border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Link2 size={14} className="text-[#5865F2]" /> {t('discordIntegration')}
        </h3>
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            {t('discordIntegrationDesc')}
          </p>
          {discordId ? (
            <div className="w-full py-4 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl text-sm font-bold text-[#5865F2] flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> {t('discordLinked')}
            </div>
          ) : (
            <button
              onClick={handleLinkDiscord}
              disabled={isLinkingDiscord}
              className="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLinkingDiscord ? t('linking') : t('linkDiscordAccount')}
            </button>
          )}
        </div>
      </div>

      <div 
        onClick={handleInvisibleClick}
        className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('secretTip')}</span>
        </div>
        <p className="text-xs text-slate-400 italic">
          {t('secretTipDesc')}
        </p>
      </div>

      {showDevSettings && (
        <div className="p-6 glass border border-rose-500/20 rounded-2xl space-y-4 animate-in zoom-in-95 duration-300">
          <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest">Developer Settings</h3>
          <button onClick={triggerError} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">
            Trigger "Something went wrong"
          </button>
          <button onClick={triggerPayment} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">
            Trigger Test Payment
          </button>
          <button onClick={resetTutorial} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">
            Reset Tutorial
          </button>
          <button onClick={triggerOldBrowser} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">
            Simulate Old Browser
          </button>
        </div>
      )}

      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <Globe className="text-cyan-400" /> {t('selectLanguage')}
              </h2>
              <button onClick={() => setShowLangModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangModal(false);
                  }}
                  disabled={loading}
                  className={`p-4 rounded-xl text-sm font-bold transition-all border text-left ${currentLang === lang.code ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50' : 'bg-black/40 text-slate-300 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralSettings;
