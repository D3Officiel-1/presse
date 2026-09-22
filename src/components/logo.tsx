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
      {/* Background glowing circle */}
      <circle cx="50" cy="50" r="40" fill="url(#nova-gradient-bg)" opacity="0.15" />
      
      {/* Abstract Modern 'N' and Starburst for NOVA */}
      <path 
        d="M30 75V25L48 55L66 25V75" 
        stroke="url(#nova-gradient-primary)" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Glowing core spark */}
      <path 
        d="M50 15L53 27L65 30L53 33L50 45L47 33L35 30L47 27L50 15Z" 
        fill="#FFD700" 
        className="animate-pulse"
      />

      <defs>
        <linearGradient id="nova-gradient-primary" x1="30" y1="25" x2="66" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="#FF6B00" />
        </linearGradient>
        <radialGradient id="nova-gradient-bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" transform="translate(50 50) rotate(90) scale(40)">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
