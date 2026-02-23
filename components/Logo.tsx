import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Hexagon */}
    <path 
      d="M60 10 L103.3 35 V85 L60 110 L16.7 85 V35 Z" 
      fill="url(#logoGradient)" 
      fillOpacity="0.1" 
      stroke="url(#logoGradient)" 
      strokeWidth="2"
    />
    
    {/* Lightning Bolt Z */}
    <path 
      d="M45 35 H85 L65 60 H80 L40 95 L55 65 H40 L45 35 Z" 
      fill="url(#logoGradient)" 
      filter="url(#glow)"
      transform="translate(0, -2)"
    />
    
    {/* Speed Lines */}
    <path d="M95 45 H110" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M100 60 H115" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    <path d="M90 75 H105" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" opacity="0.2" />
  </svg>
);
