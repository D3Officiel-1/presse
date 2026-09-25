'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MediaItem {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
}

interface ProfileVideoGridProps {
  items: MediaItem[];
}

export function ProfileVideoGrid({ items }: ProfileVideoGridProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-2">
      {items.map((img) => (
        <div 
          key={img.id} 
          className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer"
          onClick={() => router.push('/zap')}
        >
          <img 
            src={img.imageUrl} 
            alt={img.description} 
            className="w-full h-full object-cover"
            data-ai-hint={img.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <span className="absolute bottom-2 left-2 text-[10px] md:text-xs font-black text-white flex items-center gap-0.5 drop-shadow-sm">
            <Play className="w-2.5 h-2.5 md:w-3 md:h-3 fill-white stroke-none" /> 2.4 K
          </span>
        </div>
      ))}
      
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <div 
          key={`fallback-grid-${num}`}
          className="relative aspect-[3/4] bg-neutral-950 overflow-hidden cursor-pointer"
          onClick={() => router.push('/zap')}
        >
          <img 
            src={`https://picsum.photos/seed/tiktok-grid-${num}/300/400`} 
            alt="Miniature" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <span className="absolute bottom-2 left-2 text-[10px] md:text-xs font-black text-white flex items-center gap-0.5 drop-shadow-sm">
            <Play className="w-2.5 h-2.5 fill-white stroke-none" /> {num * 342}
          </span>
        </div>
      ))}
    </div>
  );
}
