import React from 'react';

import { motion } from 'motion/react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="glass group flex items-center p-3.5 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/10 shadow-sm"
    >
      <div className="p-2 rounded-lg bg-white/5 text-white/70 transition-all group-hover:scale-105" 
           style={{ color: color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : color === 'amber' ? '#f59e0b' : color === 'purple' ? '#a855f7' : 'rgb(var(--accent-primary))' }}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 16 }) : icon}
      </div>
      <div className="ml-3">
        <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 leading-none">{label}</p>
        <motion.p 
          key={value}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-base font-black text-white leading-none font-mono tracking-tighter"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default StatsCard;