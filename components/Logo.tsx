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
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Main Z Shape - Fast and Sharp */}
      <path 
        d="M 25 30 L 75 30 L 35 70 L 85 70" 
        stroke="url(#logo-gradient)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      
      {/* Motion Lines */}
      <path 
        d="M 15 45 L 30 45" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.4"
      />
      <path 
        d="M 70 55 L 85 55" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.4"
      />
    </svg>
  );
};
