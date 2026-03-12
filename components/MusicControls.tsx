import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';

const MusicControls: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const LOFI_STREAM_URL = "https://stream.zeno.fm/0r0xa792kwzuv"; // A public lofi stream

  useEffect(() => {
    let isCancelled = false;
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            if (!isCancelled) {
              console.error("Playback failed:", err);
              setIsPlaying(false);
            }
          });
        }
      } else {
        audio.pause();
      }
    }
    return () => { isCancelled = true; };
  }, [isPlaying]);

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex items-center gap-3">
      <audio 
        ref={audioRef} 
        src={LOFI_STREAM_URL} 
        preload="none"
        crossOrigin="anonymous"
      />
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-2xl border border-white/20 ${isPlaying ? 'bg-emerald-600 text-white animate-pulse' : 'bg-black/50 text-slate-400 hover:text-white'}`}
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      
      <div className={`glass px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 transition-all ${isPlaying ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
        <Music size={12} className="text-indigo-400 animate-spin-slow" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Lofi Radio</span>
      </div>
    </div>
  );
};

export default MusicControls;
