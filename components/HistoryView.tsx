import React from 'react';
import { TypingResult } from '../types';
import HistoryChart from './HistoryChart';
import { Target, Activity, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import StatsCard from './StatsCard';

interface HistoryViewProps {
  history: TypingResult[];
  speedUnit: string;
  problemKeys: string[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, speedUnit, problemKeys }) => {
  const averageWpm = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / history.length) 
    : 0;
  
  const averageAccuracy = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length).toFixed(1)
    : "0.0";

  const totalTests = history.length;
  const bestWpm = history.length > 0 ? Math.max(...history.map(h => h.wpm)) : 0;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-300">
      <div className="glass rounded-[2rem] p-10 border border-white/10 shadow-2xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Activity size={22} />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-tighter">Performance Analytics</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Avg Speed" value={averageWpm.toString()} icon={<TrendingUp />} color="indigo" />
          <StatsCard label="Avg Accuracy" value={`${averageAccuracy}%`} icon={<Target />} color="emerald" />
          <StatsCard label="Total Tests" value={totalTests.toString()} icon={<Calendar />} color="amber" />
          <StatsCard label="Best Speed" value={bestWpm.toString()} icon={<TrophyIcon />} color="rose" />
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-400" /> Progression
          </h3>
          <div className="h-[300px] w-full">
            <HistoryChart history={history} speedUnit={speedUnit} />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={14} className="text-rose-400" /> Key Targets (Problem Keys)
          </h3>
          {problemKeys.length > 0 ? (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {problemKeys.map(k => (
                <div key={k} className="flex flex-col items-center justify-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <span className="text-2xl font-mono font-bold text-white">{k}</span>
                  <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest mt-1">Focus</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">No problem keys detected. Excellent precision!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

export default HistoryView;
