import React, { useState, useEffect, useRef } from 'react';
import { ReplayEvent } from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ReplayPlayerProps {
  replayData: ReplayEvent[];
  text: string;
}

export const ReplayPlayer: React.FC<ReplayPlayerProps> = ({ replayData, text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(t => t + 100);
        // Find next event
        const nextEvent = replayData[currentIndex];
        if (nextEvent && nextEvent.timestamp <= currentTime + 100) {
          setCurrentIndex(i => i + 1);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentTime, currentIndex, replayData]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentIndex(0);
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-indigo-600 rounded-xl text-white">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={reset} className="p-3 bg-white/5 rounded-xl text-slate-400">
          <RotateCcw size={20} />
        </button>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${(currentTime / (replayData[replayData.length - 1]?.timestamp || 1)) * 100}%` }} />
        </div>
      </div>
      <div className="text-sm font-mono text-slate-400">
        {text.split('').map((char, i) => (
          <span key={i} className={i < currentIndex ? (replayData[i]?.isCorrect ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-700'}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};
