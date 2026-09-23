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
        <linearGradient id="zap-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>

      {/* Main Dynamic Geometric Lightning Star (ZAP Shape) */}
      <path 
        d="M50 5 L63 35 L95 38 L70 58 L78 90 L50 72 L22 90 L30 58 L5 38 L37 35 Z" 
        fill="url(#zap-star-grad)" 
        stroke="white"
        strokeWidth="1.5"
      />

      {/* Lightning Bolt integrated inside the monogram N look */}
      <path 
        d="M42 35 L58 48 L42 55 L58 70" 
        stroke="white" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Stardust particles representing creative energy */}
      <circle cx="18" cy="22" r="1.5" fill="white" className="animate-pulse" />
      <circle cx="82" cy="24" r="2" fill="#FFD700" className="animate-pulse" />
      <circle cx="50" cy="85" r="1.2" fill="white" />
    </svg>
  );
}
