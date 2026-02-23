
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard as KeyboardIcon, ChevronDown, Monitor, Laptop, Apple, Search, X, Settings2, Zap, RotateCcw, Layout } from 'lucide-react';
import { KeyboardLayout } from '../types';

type Platform = 'mac' | 'windows' | 'chromebook';

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode }[] = [
  { id: 'mac', label: 'macOS', icon: <Apple size={14} /> },
  { id: 'windows', label: 'Windows', icon: <Monitor size={14} /> },
  { id: 'chromebook', label: 'ChromeOS', icon: <Laptop size={14} /> },
];

interface KeyboardTesterProps {
  testedKeys: Set<string>;
  onTestedKeysChange: (keys: Set<string>) => void;
  mappings: Record<string, string>;
  onMappingChange: (mappings: Record<string, string>) => void;
  problemKeys?: string[];
  onResetProblemKeys?: () => void;
  layout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
}

const KeyboardTester: React.FC<KeyboardTesterProps> = ({ 
  testedKeys, 
  onTestedKeysChange, 
  mappings, 
  onMappingChange,
  problemKeys = [],
  onResetProblemKeys,
  layout,
  onLayoutChange
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastTypedKey, setLastTypedKey] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('mac');
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [remappingKey, setRemappingKey] = useState<string | null>(null);
  const [backspaceHoldTimer, setBackspaceHoldTimer] = useState<number | null>(null);
  const [successAnimationKey, setSuccessAnimationKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (remappingKey) {
        e.preventDefault();
        if (key === 'backspace') {
          if (!backspaceHoldTimer) {
            const timer = window.setTimeout(() => {
              setRemappingKey(null);
              setBackspaceHoldTimer(null);
            }, 2000);
            setBackspaceHoldTimer(timer);
          }
          return;
        }
        
        // Map the key
        const newMappings = { ...mappings, [remappingKey]: key };
        onMappingChange(newMappings);
        setSuccessAnimationKey(remappingKey);
        // Also highlight the target key
        const targetKey = key;
        setSuccessAnimationKey(prev => prev ? `${prev},${targetKey}` : targetKey);
        setTimeout(() => setSuccessAnimationKey(null), 1000);
        setRemappingKey(null);
        return;
      }

      setActiveKeys(prev => new Set(prev).add(key));
      setLastTypedKey(key);
      setTimeout(() => setLastTypedKey(null), 250);
      const nextTested = new Set(testedKeys);
      if (!nextTested.has(key)) {
        nextTested.add(key);
        onTestedKeysChange(nextTested);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (remappingKey && key === 'backspace') {
        if (backspaceHoldTimer) {
          clearTimeout(backspaceHoldTimer);
          setBackspaceHoldTimer(null);
        }
      }

      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [testedKeys, onTestedKeysChange, remappingKey, mappings, onMappingChange, backspaceHoldTimer]);

  const getRows = () => {
    const ansi = [
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
      ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
      ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
      ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
      ['control', 'option', 'command', ' ', 'command', 'option']
    ];

    const iso = [
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
      ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 'enter'],
      ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '#'],
      ['shift', '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
      ['control', 'option', 'command', ' ', 'command', 'option']
    ];

    const jis = [
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
      ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 'enter'],
      ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
      ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
      ['control', 'option', 'command', 'muhenkan', ' ', 'henkan', 'kana', 'command', 'option']
    ];

    if (layout === KeyboardLayout.ISO) return iso;
    if (layout === KeyboardLayout.JIS) return jis;
    return ansi;
  };

  const getLabel = (key: string) => {
    if (key === ' ') return 'SPACE';
    if (key === 'muhenkan') return '無変換';
    if (key === 'henkan') return '変換';
    if (key === 'kana') return 'かな';
    return key.toUpperCase();
  };

  const currentPlatformInfo = PLATFORMS.find(p => p.id === platform);

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-white/5"><KeyboardIcon size={20} /></div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1.5">Hardware Tactical Lab</h2>
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowPlatformMenu(!showPlatformMenu)} 
                  className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={showPlatformMenu}
                >
                  System: <span className="text-indigo-400">{currentPlatformInfo?.label}</span>
                  <ChevronDown size={12} />
                </button>
                {showPlatformMenu && (
                  <div className="absolute top-full left-0 mt-2 w-32 glass border border-white/10 rounded-xl p-1 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setPlatform(p.id); setShowPlatformMenu(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${platform === p.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="relative" ref={layoutRef}>
            <button 
              onClick={() => setShowLayoutMenu(!showLayoutMenu)} 
              className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group"
              aria-haspopup="listbox"
              aria-expanded={showLayoutMenu}
            >
              <Layout size={14} className="text-slate-500 group-hover:text-indigo-400" />
              <div className="text-left">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Layout</p>
                <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none">{layout}</p>
              </div>
              <ChevronDown size={12} className="text-slate-600" />
            </button>
            {showLayoutMenu && (
              <div className="absolute top-full left-0 mt-2 w-32 glass border border-white/10 rounded-xl p-1 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                {Object.values(KeyboardLayout).map(l => (
                  <button
                    key={l}
                    onClick={() => { onLayoutChange(l); setShowLayoutMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${layout === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {problemKeys.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20 animate-in fade-in slide-in-from-right-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10} /> Neuro-Adaptive Targets</span>
              <div className="flex gap-1.5">
                {problemKeys.map(k => (
                  <span key={k} className="px-2 py-0.5 bg-rose-500/20 rounded text-rose-400 font-mono text-[10px] font-bold uppercase">{k}</span>
                ))}
              </div>
            </div>
            <button 
              onClick={onResetProblemKeys}
              className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all group"
              title="Reset Adaptive History"
              aria-label="Clear all problem keys"
            >
              <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1000px] p-4 md:p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden ring-1 ring-white/5 relative">
          <div className="scanline" />
          
          {remappingKey && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setRemappingKey(null)}
            >
              <div 
                className="glass border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-3xl text-center space-y-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl animate-bounce">
                    <Settings2 size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">Remapping Key</h3>
                  <p className="text-[11px] font-medium text-slate-400">
                    Click any key you want to map <span className="text-indigo-400 font-bold">{remappingKey.toUpperCase()}</span> to.
                  </p>
                  <div className="pt-4 space-y-2">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      Press and hold <span className="text-rose-500">BACKSPACE</span> for 2 seconds to cancel
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      or click anywhere on the screen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 md:gap-3 items-center relative z-10" role="grid" aria-label="Keyboard Layout Tester">
            {getRows().map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 md:gap-2 w-full" role="row">
                {row.map((key, kIdx) => {
                  const keyId = key.toLowerCase();
                  const isActive = activeKeys.has(keyId);
                  const isTested = testedKeys.has(keyId);
                  const isProblem = problemKeys.includes(keyId);
                  const isRemapping = remappingKey === keyId;
                  const isSuccess = successAnimationKey?.split(',').includes(keyId);
                  
                  let keyWidthClass = 'flex-1 min-w-0 max-w-[60px]';
                  if (key === ' ') keyWidthClass = 'flex-[6] min-w-[200px]';
                  else if (['backspace', 'tab', 'caps', 'search', 'shift', 'enter'].includes(keyId)) keyWidthClass = 'flex-[1.8] min-w-[60px]';
                  
                  const stateLabel = isActive ? 'active' : isProblem ? 'problem' : isTested ? 'tested' : 'untested';
                  
                  return (
                    <button key={`${key}-${kIdx}`}
                      onClick={() => setRemappingKey(keyId)}
                      aria-label={`Key ${getLabel(key)}, state: ${stateLabel}`}
                      aria-pressed={isActive}
                      role="gridcell"
                      tabIndex={0}
                      className={`h-10 md:h-14 flex flex-col items-center justify-center rounded-lg md:rounded-xl font-black transition-all duration-150 border-b-[3px] md:border-b-[5px] shadow-lg relative group
                        ${keyWidthClass}
                        ${isActive ? 'bg-indigo-500 text-white border-indigo-800 translate-y-1 border-b-0 mb-[3px] md:mb-[5px] z-20' : 
                          isRemapping ? 'bg-amber-500 text-white border-amber-700 animate-pulse z-30 scale-110' :
                          isSuccess ? 'bg-emerald-500 text-white border-emerald-700 scale-105 z-30' :
                          isProblem ? 'bg-rose-950/40 text-rose-400 border-rose-900' :
                          isTested ? 'bg-indigo-950/60 text-indigo-300 border-indigo-900/80' : 
                          'bg-slate-900 text-slate-500 border-slate-950'}`}
                    >
                      <span className="truncate w-full px-1 md:px-2 text-[6px] md:text-[9px] uppercase tracking-tighter">{getLabel(key)}</span>
                      {mappings[keyId] && <span className="text-[5px] md:text-[7px] text-emerald-400 mt-0.5 font-mono">→ {mappings[keyId].toUpperCase()}</span>}
                      {isProblem && <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardTester;
