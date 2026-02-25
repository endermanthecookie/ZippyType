
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TypingResult } from '../types';

interface HistoryChartProps {
  history: TypingResult[];
  speedUnit: string;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history, speedUnit }) => {
  const data = [...history].reverse().map((item, idx) => ({
    name: idx + 1,
    wpm: speedUnit === 'cpm' ? item.wpm * 5 : item.wpm,
    accuracy: item.accuracy
  }));

  if (history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 italic border border-white/5 rounded-xl bg-black/20">
        <p className="text-xs font-black uppercase tracking-widest">Complete a race to see analytics</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full min-h-[256px] bg-black/20 rounded-xl border border-white/5 p-4 relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}
            itemStyle={{ color: '#f8fafc' }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="wpm" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWpm)" 
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
