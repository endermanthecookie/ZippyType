
import React, { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { TypingResult } from '../types';
import { Zap, Target, Trophy } from 'lucide-react';

interface HistoryChartProps {
  history: TypingResult[];
  speedUnit: string;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history, speedUnit }) => {
  const [activeMetric, setActiveMetric] = useState<'wpm' | 'accuracy' | 'score'>('wpm');

  const data = [...history].reverse().map((item, idx) => ({
    name: idx + 1,
    wpm: speedUnit === 'cpm' ? item.wpm * 5 : item.wpm,
    accuracy: item.accuracy,
    score: Math.floor(item.wpm * (item.accuracy / 100) * 10)
  }));

  if (history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 italic border border-white/5 rounded-xl bg-black/20">
        <p className="text-xs font-black uppercase tracking-widest">Complete a race to see analytics</p>
      </div>
    );
  }

  const metrics = [
    { id: 'wpm', label: speedUnit.toUpperCase(), color: '#6366f1', icon: <Zap size={14} /> },
    { id: 'accuracy', label: 'ACCURACY', color: '#10b981', icon: <Target size={14} /> },
    { id: 'score', label: 'SCORE', color: '#f59e0b', icon: <Trophy size={14} /> },
  ];

  const currentMetric = metrics.find(m => m.id === activeMetric)!;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {metrics.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
              activeMetric === m.id 
                ? `bg-white/10 border-white/20 text-white shadow-lg` 
                : 'bg-black/20 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
            }`}
          >
            <span style={{ color: activeMetric === m.id ? m.color : 'inherit' }}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="h-64 w-full min-h-[256px] bg-black/20 rounded-xl border border-white/5 p-4 relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `${val}${activeMetric === 'accuracy' ? '%' : ''}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              formatter={(value: any) => [`${value}${activeMetric === 'accuracy' ? '%' : ''}`, currentMetric.label]}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={currentMetric.color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
