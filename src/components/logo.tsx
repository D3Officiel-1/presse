
'use client';

import React from 'react';

export function Logo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="nova-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
        <filter id="nova-glow" x="-20%" y="-20%" width="140%" height="140%">
          <blur stdDeviation="2" />
        </filter>
      </defs>

      {/* Main Geometric Star */}
      <path 
        d="M50 5L62 38H95L68 57L78 90L50 70L22 90L32 57L5 38H38L50 5Z" 
        fill="url(#nova-star-grad)" 
        stroke="white"
        strokeWidth="1.5"
      />

      {/* Stylized Monogram N integrated into the Star */}
      <path 
        d="M38 60V38L50 55L62 38V60" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Stardust particles */}
      <circle cx="20" cy="20" r="1.5" fill="white" className="animate-pulse" />
      <circle cx="80" cy="25" r="2" fill="#FFD700" className="animate-pulse" />
      <circle cx="50" cy="85" r="1" fill="white" />
    </svg>
  );
}
