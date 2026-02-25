
import React from 'react';
import { BookOpen, Target, Zap, ShieldCheck, Keyboard, MousePointer2, Info, Sparkles } from 'lucide-react';

const TUTORIALS = [
  {
    id: 'posture',
    title: 'Tactical Posture',
    icon: <ShieldCheck className="text-emerald-400" />,
    description: 'The foundation of elite speed is ergonomic stability. Your body is a precision instrument.',
    tips: [
      'Elbows at a 90-degree angle, floating above the desk.',
      'Feet flat on the floor to ground your kinetic energy.',
      'Top of screen at eye level to prevent neck fatigue.'
    ]
  },
  {
    id: 'touch-typing',
    title: 'Neural Touch Mapping',
    icon: <Keyboard className="text-indigo-400" />,
    description: 'Eliminate the visual feedback loop. Trust your muscle memory to map the grid.',
    tips: [
      'Index fingers on F and J (the tactical bumps).',
      'Each finger owns a specific vertical lane.',
      'Eyes locked on the target text, never the hardware.'
    ]
  },
  {
    id: 'accuracy',
    title: 'Precision Over Velocity',
    icon: <Target className="text-rose-400" />,
    description: 'Speed is a byproduct of perfect accuracy. Slow is smooth, and smooth is fast.',
    tips: [
      'Maintain 98%+ accuracy to reinforce neural pathways.',
      'Decelerate for complex character combinations.',
      'Correct errors instantly to maintain rhythm.'
    ]
  },
  {
    id: 'rhythm',
    title: 'Kinetic Rhythm',
    icon: <Zap className="text-amber-400" />,
    description: 'Typing is a flow state. Maintain a steady cadence to minimize cognitive load.',
    tips: [
      'Type to a consistent internal metronome.',
      'Buffer 3-4 words ahead in your visual cortex.',
      'Minimize finger travel distance for maximum efficiency.'
    ]
  }
];

const Tutorials: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Tactical Academy</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Master the art of high-velocity data entry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TUTORIALS.map((t) => (
          <div key={t.id} className="glass p-8 rounded-[2.5rem] border border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              {t.icon}
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                {t.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-black text-white uppercase tracking-tighter">{t.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">{t.description}</p>
                <ul className="space-y-2">
                  {t.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2rem] border border-white/10 bg-slate-900/40">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Info size={20} /></div>
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Pro Tip</h4>
        </div>
        <p className="text-slate-400 text-xs italic leading-relaxed">
          "Don't just practice often, practice correctly. Muscle memory is indiscriminate—it will learn bad habits just as easily as good ones. Use the 'Hardware Tactical Lab' in settings to ensure your physical inputs are clean and calibrated."
        </p>
      </div>
    </div>
  );
};

export default Tutorials;
