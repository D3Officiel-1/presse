'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Music, Play, Disc, Film, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VideoTrackMock = {
  id: string;
  audioName: string;
  creator: string;
  count: string;
  avatarSeed: string;
};

const AUDIO_MAP: Record<string, VideoTrackMock> = {
  'vid-1': { id: 'vid-1', audioName: 'Original Audio — Yannick VFX', creator: 'yannick_vfx', count: '1.2 K', avatarSeed: 'yannick' },
  'vid-2': { id: 'vid-2', audioName: 'Tech Talk — Innovation Hub', creator: 'amina_diop', count: '482', avatarSeed: 'amina' },
  'vid-3': { id: 'vid-3', audioName: 'Coupé Décalé Remix 2024', creator: 'marc_dance', count: '12.4 K', avatarSeed: 'marc' },
};

export default function DisqueAudioPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = React.use(props.params);
  const trackId = params?.id || 'vid-1';
  
  const currentTrack = AUDIO_MAP[trackId] || AUDIO_MAP['vid-1'];

  // Grid simulation matching TikTok look with beautiful placehold photos
  const gridThumbnails = [
    { id: 'g-1', seed: 'v1', count: '45.1K' },
    { id: 'g-2', seed: 'v2', count: '12.4K' },
    { id: 'g-3', seed: 'v3', count: '8.2K' },
    { id: 'g-4', seed: 'v4', count: '4.1K' },
    { id: 'g-5', seed: 'v5', count: '2.9K' },
    { id: 'g-6', seed: 'v6', count: '1.2K' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24 relative selection:bg-primary/30">
      {/* Top Header sticky */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md px-4 h-14 border-b border-white/5 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-xl text-white/80 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Piste Sonore</span>
        <div className="w-5" />
      </header>

      {/* Hero Track Identity Section */}
      <div className="p-4 flex gap-4 items-center">
        {/* Revolving / Animated Vinyl Record Artwork */}
        <div className="relative w-24 h-24 shrink-0 rounded-full border-2 border-white/10 bg-neutral-900 flex items-center justify-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 rounded-full border border-neutral-800 animate-spin" style={{ animationDuration: '3s' }}>
            <img 
              src={`https://picsum.photos/seed/${currentTrack.avatarSeed}/120/120`} 
              alt="Track Artwork" 
              className="w-full h-full object-cover opacity-70"
            />
          </div>
          <div className="absolute w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center z-10">
            <Disc className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>

        {/* Content detail */}
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-base font-black tracking-tight leading-tight truncate text-white">
            {currentTrack.audioName}
          </h1>
          <p className="text-xs text-neutral-400 font-medium truncate">
            par @{currentTrack.creator}
          </p>
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 pt-0.5">
            <Film className="w-3 h-3" /> {currentTrack.count} vidéos créées
          </p>
        </div>
      </div>

      {/* Grid Content section */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3 px-1">
          <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" /> Tendances avec ce son
        </div>

        <div className="grid grid-cols-3 gap-1">
          {gridThumbnails.map((thumb) => (
            <div 
              key={thumb.id} 
              onClick={() => router.push('/zap')}
              className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer group active:opacity-90 rounded-md"
            >
              <img 
                src={`https://picsum.photos/seed/${thumb.seed}/300/400`} 
                alt="Video thumbnail preview" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 left-1.5 text-[10px] font-black tracking-tight text-white flex items-center gap-0.5 drop-shadow-md">
                <Play className="w-2.5 h-2.5 fill-white stroke-none" /> {thumb.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky action button floating over everything */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
        <Button 
          onClick={() => {
            alert("Inspiration enregistrée ! Préparez votre caméra pour ZAP Studio.");
            router.push('/zap/studio');
          }}
          className="w-full max-w-sm h-12 bg-primary text-white font-black text-xs uppercase tracking-wider rounded-full shadow-[0_8px_30px_rgba(255,39,0,0.3)] hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <Music className="w-4 h-4" /> Utiliser ce son
        </Button>
      </div>
    </div>
  );
}
