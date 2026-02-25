import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="z-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g filter="url(#glow)">
        {/* Main Z Shape - Sharp, Geometric, Fast */}
        <path 
          d="M 40 20 L 100 20 L 60 60 L 80 60 L 60 80 L 0 80 L 40 40 L 20 40 Z" 
          fill="url(#z-grad)" 
        />
        
        {/* Speed Lines */}
        <path d="M 5 30 L 20 30" stroke="url(#z-grad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 80 70 L 95 70" stroke="url(#z-grad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 15 20 L 25 20" stroke="url(#z-grad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 75 80 L 85 80" stroke="url(#z-grad)" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
};
