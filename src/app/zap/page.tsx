'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Bookmark, Share2, Plus, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const router = useRouter();
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<string[]>([]);

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const [videos, setVideos] = useState([
    {
      id: 'vid-1',
      title: 'Court-métrage : "L\'Énigme du Code 2027"',
      creator: 'yannick_vfx',
      fullName: 'Yannick Koffi',
      institution: 'Lycée Scientifique',
      likes: 12400,
      comments: 856,
      bookmarks: 2100,
      shares: 432,
      image: 'https://picsum.photos/seed/zap1/600/1000',
      hint: 'cyberpunk student coding movie',
      audioName: 'Original Audio - Yannick VFX',
      description: 'Premier test de rendu 3D sur le campus. #vfx #coding #zapstudio'
    },
    {
      id: 'vid-2',
      title: 'Pitch d\'Avenir : Révolutionner le transport',
      creator: 'amina_diop',
      fullName: 'Aminata Diop',
      institution: 'Espaces Créatifs CTI',
      likes: 8200,
      comments: 420,
      bookmarks: 1200,
      shares: 128,
      image: 'https://picsum.photos/seed/zap2/600/1000',
      hint: 'african young woman speech presentation',
      audioName: 'Tech Talk - Innovation Hub',
      description: 'Comment nous allons changer la mobilité à Abidjan. #tech #startup #ivorycoast'
    },
    {
      id: 'vid-3',
      title: 'Danse Urbaine réinventée',
      creator: 'marc_dance',
      fullName: 'Marc-Aurèle Yao',
      institution: 'Académie des Arts',
      likes: 45100,
      comments: 2300,
      bookmarks: 8400,
      shares: 1500,
      image: 'https://picsum.photos/seed/zap3/600/1000',
      hint: 'urban artistic modern dance',
      audioName: 'Coupé Décalé Remix 2024',
      description: 'La fusion entre tradition et modernité. #dance #culture #zap'
    }
  ]);

  const handleToggleLike = (id: string) => {
    if (likedVideos.includes(id)) {
      setLikedVideos(prev => prev.filter(v => v !== id));
      setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: v.likes - 1 } : v));
    } else {
      setLikedVideos(prev => [...prev, id]);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: v.likes + 1 } : v));
    }
  };

  const handleToggleBookmark = (id: string) => {
    if (bookmarkedVideos.includes(id)) {
      setBookmarkedVideos(prev => prev.filter(v => v !== id));
    } else {
      setBookmarkedVideos(prev => [...prev, id]);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-center h-16 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto bg-black/60 px-5 py-2 rounded-full backdrop-blur-md mt-2 border border-white/5">
          <button className="text-xs font-black opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest text-white">Abonnements</button>
          <button className="text-xs font-black border-b-2 border-primary pb-0.5 uppercase tracking-widest text-white">Pour toi</button>
        </div>
      </header>

      <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {videos.map((video) => (
          <section 
            key={video.id} 
            className="h-screen w-full snap-start relative flex flex-col items-center justify-center overflow-hidden bg-black"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={video.image} 
                alt={video.title} 
                className="w-full h-full object-cover opacity-95"
                data-ai-hint={video.hint}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95" />
            </div>

            <div className="absolute right-3 bottom-[110px] md:right-4 md:bottom-[120px] z-20 flex flex-col items-center gap-4 md:gap-5 max-w-[60px]">
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center mb-1"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden bg-neutral-800 shadow-[0_8px_25px_rgba(0,0,0,0.3)]">
                  <img src={`https://picsum.photos/seed/${video.creator}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  className="absolute -bottom-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg border border-white"
                >
                  <Plus className="w-3 h-3 text-white" />
                </motion.button>
              </motion.div>

              <div className="flex flex-col items-center">
                <motion.button 
                  onClick={() => handleToggleLike(video.id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  animate={{ 
                    scale: likedVideos.includes(video.id) ? [1, 1.3, 1] : 1
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={cn(
                    "w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-white transition-colors duration-200",
                    likedVideos.includes(video.id) && "border-primary/40 bg-primary/10 text-primary"
                  )}
                >
                  <Heart className={cn("w-5 h-5 md:w-6 md:h-6 transition-all", likedVideos.includes(video.id) && "fill-primary stroke-primary")} />
                </motion.button>
                <motion.span 
                  key={video.likes}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] md:text-[11px] font-black mt-1 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  {video.likes.toLocaleString()}
                </motion.span>
              </div>

              <div className="flex flex-col items-center">
                <motion.button 
                  onClick={() => router.push('/zap/chat')}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-white"
                >
                  <MessageSquare className="w-5 h-5" />
                </motion.button>
                <span className="text-[10px] md:text-[11px] font-black mt-1 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{video.comments}</span>
              </div>

              <div className="flex flex-col items-center">
                <motion.button 
                  onClick={() => handleToggleBookmark(video.id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  animate={{ 
                    rotate: bookmarkedVideos.includes(video.id) ? [0, -15, 10, 0] : 0 
                  }}
                  className={cn(
                    "w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-white transition-colors duration-200",
                    bookmarkedVideos.includes(video.id) && "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                  )}
                >
                  <Bookmark className={cn("w-5 h-5 transition-all", bookmarkedVideos.includes(video.id) && "fill-yellow-400 stroke-yellow-400")} />
                </motion.button>
                <span className="text-[10px] md:text-[11px] font-black mt-1 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{video.bookmarks}</span>
              </div>

              <div className="flex flex-col items-center">
                <motion.button 
                  whileHover={{ scale: 1.15, rotate: 15 }}
                  whileTap={{ scale: 0.85 }}
                  className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-white"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                <span className="text-[10px] md:text-[11px] font-black mt-1 tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{video.shares}</span>
              </div>

              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white/30 bg-neutral-950 flex items-center justify-center overflow-hidden p-1.5 shadow-[0_4px_20px_rgba(255,39,0,0.3)] mt-1"
              >
                 <Music className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </motion.div>
            </div>

            <div className="absolute left-4 bottom-[120px] right-20 z-20 text-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white drop-shadow">@{video.creator}</span>
                <Badge className="bg-primary text-white border-none font-bold text-[9px] px-2 py-0.5">
                  {video.institution}
                </Badge>
              </div>
              <p className="text-xs font-semibold leading-snug drop-shadow-md text-white/90">
                {video.description}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
                <Music className="w-3 h-3 text-primary animate-pulse" />
                <span className="truncate w-48 font-mono">{video.audioName}</span>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
