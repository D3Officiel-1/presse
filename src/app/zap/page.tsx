'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  X,
  Send,
  Music,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Video = {
  id: string;
  title: string;
  creator: string;
  fullName: string;
  institution: string;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  videoUrl: string;
  poster: string;
  audioName: string;
  description: string;
};

const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Court-métrage : "L’Énigme du Code 2027"',
    creator: 'yannick_vfx',
    fullName: 'Yannick Koffi',
    institution: 'Lycée Scientifique',
    likes: 12400,
    comments: 856,
    bookmarks: 2100,
    shares: 432,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://picsum.photos/seed/zap1/600/1000',
    audioName: 'Original Audio — Yannick VFX',
    description: 'Premier test de rendu 3D sur le campus de l\'école. #vfx #coding #zapstudio',
  },
  {
    id: 'vid-2',
    title: 'Pitch d’Avenir : Révolutionner le transport urbain',
    creator: 'amina_diop',
    fullName: 'Aminata Diop',
    institution: 'Espaces Créatifs CTI',
    likes: 8200,
    comments: 420,
    bookmarks: 1200,
    shares: 128,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://picsum.photos/seed/zap2/600/1000',
    audioName: 'Tech Talk — Innovation Hub',
    description: 'Comment nous allons changer la mobility des étudiants à Abidjan. #tech #startup',
  },
  {
    id: 'vid-3',
    title: 'Danse Urbaine réinventée sur le parvis',
    creator: 'marc_dance',
    fullName: 'Marc-Aurèle Yao',
    institution: 'Académie des Arts',
    likes: 45100,
    comments: 2300,
    bookmarks: 8400,
    shares: 1500,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://picsum.photos/seed/zap3/600/1000',
    audioName: 'Coupé Décalé Remix 2024',
    description: 'La fusion parfaite entre tradition et mouvements modernes. #dance #culture',
  },
];

function formatCount(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.0', '')} M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.0', '')} K`;
  return value.toString();
}

export default function FeedPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  
  const [activeVideo, setActiveVideo] = useState('vid-1');
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  const [activeHeartAnimation, setActiveHeartAnimation] = useState<{ videoId: string; x: number; y: number } | null>(null);
  const [activeSheet, setActiveSheet] = useState<'comments' | 'menu' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [progressState, setProgressState] = useState<Record<string, number>>({});
  const [durationState, setDurationState] = useState<Record<string, number>>({});

  const [commentsStore, setCommentsStore] = useState<Record<string, any[]>>({
    'vid-1': [
      { id: 'c1', user: 'fatim_creative', text: 'Incroyable les effets de lumière ! 🔥', time: 'Il y a 2h' },
      { id: 'c2', user: 'gilles_art', text: 'Quel logiciel pour le tracking ? Beau travail !', time: 'Il y a 1h' }
    ],
    'vid-2': [
      { id: 'c3', user: 'yannick_vfx', text: 'Très bon pitch, clair, ambitieux et inspirant.', time: 'Il y a 30 min' }
    ]
  });
  const [newCommentInput, setNewCommentInput] = useState('');

  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const pointerStartRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const doubleTapStateRef = useRef<{ lastTap: number; lastTapVideo: string }>({ lastTap: 0, lastTapVideo: '' });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const originalBg = document.body.style.backgroundColor;
      document.body.style.backgroundColor = '#000000';
      return () => {
        document.body.style.backgroundColor = originalBg;
      };
    }
  }, []);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === activeVideo) {
        if (!paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeVideo, paused]);

  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-video-id]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && visible.intersectionRatio >= 0.7) {
          const id = visible.target.getAttribute('data-video-id');
          if (id && id !== activeVideo) {
            setActiveVideo(id);
            setPaused(false);
          }
        }
      },
      {
        root: container,
        threshold: [0.5, 0.7, 0.9],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activeVideo]);

  const handleToggleLike = (id: string) => {
    const alreadyLiked = likedVideos.includes(id);
    setLikedVideos((prev) => alreadyLiked ? prev.filter((item) => item !== id) : [...prev, id]);
    setVideos((prev) =>
      prev.map((v) => v.id === id ? { ...v, likes: alreadyLiked ? v.likes - 1 : v.likes + 1 } : v)
    );
  };

  const handlePointerDownGesture = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY
    };
  };

  const handlePointerUpGesture = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    const now = Date.now();
    const diffX = Math.abs(e.clientX - start.x);
    const diffY = Math.abs(e.clientY - start.y);

    if (diffX > 12 || diffY > 12) {
      return; 
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const state = doubleTapStateRef.current;
    const delta = now - state.lastTap;

    if (delta < 300 && state.lastTapVideo === id) {
      if (!likedVideos.includes(id)) {
        handleToggleLike(id);
      }
      setActiveHeartAnimation({ videoId: id, x, y });
      setTimeout(() => setActiveHeartAnimation(null), 850);
      state.lastTap = 0;
    } else {
      state.lastTap = now;
      state.lastTapVideo = id;
      setTimeout(() => {
        if (doubleTapStateRef.current.lastTapVideo === id && doubleTapStateRef.current.lastTap !== 0) {
          setPaused((prev) => !prev);
        }
      }, 250);
    }
  };

  const handleToggleBookmark = (id: string) => {
    const alreadyBookmarked = bookmarkedVideos.includes(id);
    setBookmarkedVideos((prev) => alreadyBookmarked ? prev.filter((item) => item !== id) : [...prev, id]);
    setVideos((prev) =>
      prev.map((v) => v.id === id ? { ...v, bookmarks: alreadyBookmarked ? v.bookmarks - 1 : v.bookmarks + 1 } : v)
    );
    toast({
      title: alreadyBookmarked ? 'Retiré des favoris' : 'Enregistré dans vos favoris !',
      description: alreadyBookmarked ? 'Le projet a été retiré.' : 'Retrouvez ce projet à tout moment.'
    });
  };

  const handleToggleFollow = (creator: string) => {
    const isFollowing = followedCreators.includes(creator);
    setFollowedCreators((prev) => isFollowing ? prev.filter((c) => c !== creator) : [...prev, creator]);
    toast({
      title: isFollowing ? 'Désabonné' : 'Abonnement activé !',
      description: isFollowing ? `Vous ne suivez plus @${creator}` : `Vous suivez désormais les créations de @${creator}`
    });
  };

  const handleNativeShare = async (video: Video) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareData = {
      title: video.title,
      text: `Regardez la création de @${video.creator} sur ZAP! : ${video.description}`,
      url: `${origin}/zap?video=${video.id}`,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: 'Lien copié !', description: 'Le lien unique de la vidéo est disponible dans votre presse-papier.' });
      }
    } catch (err) {}
  };

  const openCommentsSheet = (video: Video) => {
    setSelectedVideo(video);
    setActiveSheet('comments');
  };

  const openMenuSheet = (video: Video) => {
    setSelectedVideo(video);
    setActiveSheet('menu');
  };

  const closeGlobalSheet = () => {
    setActiveSheet(null);
    setSelectedVideo(null);
    setNewCommentInput('');
  };

  const submitComment = () => {
    if (!newCommentInput.trim() || !selectedVideo) return;
    const newComment = {
      id: `c-custom-${Date.now()}`,
      user: 'moi_createur',
      text: newCommentInput.trim(),
      time: 'À l\'instant'
    };

    setCommentsStore((prev) => ({
      ...prev,
      [selectedVideo.id]: [...(prev[selectedVideo.id] || []), newComment]
    }));

    setVideos((prev) => prev.map((v) => v.id === selectedVideo.id ? { ...v, comments: v.comments + 1 } : v));
    setNewCommentInput('');
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white select-none">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 shadow-2xl backdrop-blur-xl">
          <button className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wide text-white/60 transition hover:text-white outline-none">Abonnements</button>
          <button className="rounded-full bg-white/10 px-5 py-1.5 text-[11px] font-black tracking-wide text-white shadow-inner outline-none">Pour toi</button>
        </div>
      </header>

      <main
        ref={feedRef}
        className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-black"
      >
        {videos.map((video, index) => {
          const isLiked = likedVideos.includes(video.id);
          const isBookmarked = bookmarkedVideos.includes(video.id);
          const isFollowed = followedCreators.includes(video.creator);
          const isActive = activeVideo === video.id;
          const isNearActive = Math.abs(videos.findIndex(v => v.id === activeVideo) - index) <= 1;

          const currentTime = progressState[video.id] ?? 0;
          const duration = durationState[video.id] ?? 0;
          const currentProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

          return (
            <section
              key={video.id}
              data-video-id={video.id}
              className="relative h-[100dvh] min-h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black touch-pan-y"
            >
              <div 
                className="absolute inset-0 bg-black cursor-pointer"
                onPointerDown={handlePointerDownGesture}
                onPointerUp={(e) => handlePointerUpGesture(video.id, e)}
              >
                <video
                  ref={(el) => { videoRefs.current[video.id] = el; }}
                  src={video.videoUrl}
                  poster={video.poster}
                  muted={muted}
                  playsInline
                  loop
                  preload={isActive ? 'auto' : isNearActive ? 'metadata' : 'none'}
                  className="h-full w-full object-cover pointer-events-none"
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration;
                    if (Number.isFinite(d)) {
                      setDurationState(prev => ({ ...prev, [video.id]: d }));
                    }
                  }}
                  onTimeUpdate={(e) => {
                    const timeVal = e.currentTarget.currentTime;
                    setProgressState(prev => {
                      if (prev[video.id] === timeVal) return prev;
                      return { ...prev, [video.id]: timeVal };
                    });
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-50% to-black/80 pointer-events-none" />
              </div>

              <AnimatePresence>
                {paused && isActive && (
                  <div className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-sm pointer-events-none">
                    <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                  </div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {activeHeartAnimation && activeHeartAnimation.videoId === video.id && (
                  <div 
                    className="pointer-events-none absolute z-40 flex items-center justify-center"
                    style={{ left: activeHeartAnimation.x - 48, top: activeHeartAnimation.y - 48 }}
                  >
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                      transition={{ duration: 0.5 }}
                      className="absolute h-20 w-20 rounded-full bg-white/10 blur-xl"
                    />
                    <motion.div
                      initial={{ scale: 0.1, rotate: -15, opacity: 0 }}
                      animate={{
                        scale: [0.1, 1.3, 0.95, 1.05, 1],
                        rotate: [-15, 10, -5, 2, 0],
                        opacity: [0, 1, 1, 1, 0],
                      }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                      <Heart className="h-20 w-20 fill-white text-white drop-shadow-2xl" strokeWidth={1.5} />
                    </motion.div>
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        className="absolute h-2 w-2 rounded-full bg-white/80"
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos(idx * 0.785) * 80,
                          y: Math.sin(idx * 0.785) * 80,
                          scale: [0, 1.2, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{ duration: 0.6, delay: 0.02 }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Action Side Rail */}
              <div className="absolute bottom-[130px] right-3 z-30 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleToggleLike(video.id)}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-md active:scale-90 transition-all outline-none duration-150 select-none",
                      isLiked && "text-primary border-primary/40 bg-primary/10"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-primary stroke-primary")} />
                  </button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md select-none">{formatCount(video.likes)}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => openCommentsSheet(video)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-md active:scale-90 transition-all outline-none duration-150 select-none"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md select-none">{formatCount(video.comments)}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleToggleBookmark(video.id)}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-md active:scale-90 transition-all outline-none duration-150 select-none",
                      isBookmarked && "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
                    )}
                  >
                    <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-yellow-400 stroke-yellow-400")} />
                  </button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md select-none">{formatCount(video.bookmarks)}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => openMenuSheet(video)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-md active:scale-90 transition-all outline-none duration-150 select-none"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col items-center pt-1">
                  <button
                    onClick={() => setMuted((prev) => !prev)}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-neutral-900 shadow-xl overflow-hidden active:scale-90 transition-all outline-none duration-150 select-none",
                      isActive && !paused ? "animate-spin-slow" : ""
                    )}
                  >
                    <div className="absolute inset-1 rounded-full border border-neutral-700/60 pointer-events-none" />
                    <div className="absolute inset-2 rounded-full border border-neutral-800 pointer-events-none" />
                    <div className="absolute w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10 shadow-sm">
                      {muted ? (
                        <VolumeX className="h-2 w-2 text-white" />
                      ) : (
                        <Volume2 className="h-2 w-2 text-white animate-pulse" />
                      )}
                    </div>
                    <img 
                      src={`https://picsum.photos/seed/${video.creator}/40/40`} 
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity pointer-events-none" 
                      alt="Disc"
                    />
                  </button>
                </div>
              </div>

              {/* Minimal Text Content Overlay Stack */}
              <div className="absolute bottom-[125px] left-4 right-16 z-20 text-left pointer-events-none">
                <div className="space-y-1.5 pointer-events-auto max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-white/30 overflow-hidden shrink-0 shadow-md">
                      <img 
                        src={`https://picsum.photos/seed/${video.creator}/48/48`} 
                        alt={video.fullName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white drop-shadow-md">@{video.creator}</span>
                      <button
                        onClick={() => handleToggleFollow(video.creator)}
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full transition-all shrink-0 uppercase tracking-tight active:scale-95 outline-none select-none",
                          isFollowed ? "bg-white/20 text-white/90" : "bg-primary text-white"
                        )}
                      >
                        {isFollowed ? 'Suivi ✓' : 'Suivre'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-white">
                    <h3 className="text-xs font-black drop-shadow-sm leading-tight truncate">
                      {video.title}
                    </h3>
                    <p className="text-[11px] font-medium text-white/90 drop-shadow-sm leading-snug line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-semibold pt-0.5">
                      <Music className="w-3 h-3 text-white/70 animate-pulse shrink-0" />
                      <span className="truncate max-w-[180px] drop-shadow-sm font-mono tracking-tight">{video.audioName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Video Stream Synchronized Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 z-40 h-[3px] bg-white/10">
                <div 
                  className="h-full bg-primary transition-[width] duration-100 origin-left" 
                  style={{ width: `${currentProgressPercent}%` }} 
                />
              </div>
            </section>
          );
        })}
      </main>

      <AnimatePresence>
        {activeSheet && selectedVideo && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeGlobalSheet}
            />

            <motion.div
              className="fixed inset-x-0 bottom-0 z-[100] max-h-[75dvh] overflow-hidden rounded-t-[2.5rem] border-t border-white/10 bg-[#121214]/95 shadow-2xl backdrop-blur-3xl text-white flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20 shrink-0 cursor-pointer" onClick={closeGlobalSheet} />

              {activeSheet === 'comments' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      Commentaires créatifs ({selectedVideo.comments})
                    </span>
                    <button onClick={closeGlobalSheet} className="p-1.5 rounded-xl bg-white/5 text-white/70 active:scale-95 transition-transform outline-none">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(commentsStore[selectedVideo.id] || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3 items-start text-xs text-neutral-200">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary border border-primary/20 font-black uppercase flex items-center justify-center shrink-0 select-none">
                          {comment.user.substring(0, 2)}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-white">@{comment.user}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">{comment.time}</span>
                          </div>
                          <p className="font-medium text-neutral-300 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-white/5 bg-neutral-900/60 flex gap-2 items-center pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
                    <Input
                      placeholder="Commenter..."
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                      className="flex-1 h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-500 text-sm focus-visible:ring-primary/40"
                    />
                    <Button onClick={submitComment} disabled={!newCommentInput.trim()} size="icon" className="rounded-xl h-11 w-11 bg-primary active:scale-90 transition-transform outline-none">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {activeSheet === 'menu' && (
                <div className="p-5 space-y-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-2 mb-2">Options du projet</p>
                  
                  <button 
                    onClick={() => { handleToggleBookmark(selectedVideo.id); closeGlobalSheet(); }}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 text-sm font-bold rounded-2xl flex items-center gap-3 transition-colors outline-none active:scale-[0.99]"
                  >
                    <Bookmark className="w-4 h-4 text-yellow-400" />
                    {bookmarkedVideos.includes(selectedVideo.id) ? "Retirer des favoris" : "Enregistrer dans mes favoris"}
                  </button>

                  <button 
                    onClick={() => { handleNativeShare(selectedVideo); closeGlobalSheet(); }}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 text-sm font-bold rounded-2xl flex items-center gap-3 transition-colors outline-none active:scale-[0.99]"
                  >
                    <Music className="w-4 h-4 text-primary" />
                    Partager le projet créatif
                  </button>

                  <div className="h-px bg-white/5 my-2" />

                  <button 
                    onClick={() => { toast({ title: 'Signalement enregistré', description: 'Merci de maintenir la communauté saine.' }); closeGlobalSheet(); }}
                    className="w-full p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-black rounded-2xl flex items-center gap-3 transition-colors outline-none active:scale-[0.99]"
                  >
                    Signaler ce contenu
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
