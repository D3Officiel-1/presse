'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Music,
  MoreHorizontal,
  Play,
  Volume2,
  VolumeX,
  Check,
  X,
  Send,
  AlertCircle,
  BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
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
    description: 'Comment nous allons changer la mobilité des étudiants à Abidjan. #tech #startup',
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

type CommentData = {
  id: string;
  user: string;
  text: string;
  time: string;
};

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

  // États pour les animations de double tap
  const [activeHeartAnimation, setActiveHeartAnimation] = useState<{ videoId: string; x: number; y: number } | null>(null);

  // Gestionnaire global de Bottom Sheets
  const [activeSheet, setActiveSheet] = useState<'comments' | 'menu' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // États de progression réelle par ID vidéo
  const [progressState, setProgressState] = useState<Record<string, number>>({});
  const [durationState, setDurationState] = useState<Record<string, number>>({});

  // Commentaires simulés en local (Structure prête pour Firestore)
  const [commentsStore, setCommentsStore] = useState<Record<string, CommentData[]>>({
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
  
  // Références pour la détection robuste du double tap sans conflits
  const lastTapRef = useRef<{ time: number; videoId: string }>({ time: 0, videoId: '' });
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  // Déclencheur du play/pause intelligent de la vidéo active
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
        video.currentTime = 0; // Reset pour économiser le CPU et la mémoire
      }
    });
  }, [activeVideo, paused]);

  // Observer natif hautement optimisé
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-video-id]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && visible.intersectionRatio >= 0.5) {
          const id = visible.target.getAttribute('data-video-id');
          if (id && id !== activeVideo) {
            setActiveVideo(id);
            setPaused(false);
          }
        }
      },
      {
        root: container,
        threshold: [0.5, 0.75, 0.9],
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

  const handleDoubleTapAction = (id: string, clientX: number, clientY: number, rect: DOMRect) => {
    if (!likedVideos.includes(id)) {
      handleToggleLike(id);
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setActiveHeartAnimation({ videoId: id, x, y });
    setTimeout(() => setActiveHeartAnimation(null), 900);
  };

  // Détecteur de geste hautement robuste pour distinguer simple tap et double tap
  const handleMediaGesture = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const delta = now - lastTapRef.current.time;
    const sameVideo = lastTapRef.current.videoId === id;
    const rect = e.currentTarget.getBoundingClientRect();

    if (delta > 0 && delta < 300 && sameVideo) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      handleDoubleTapAction(id, e.clientX, e.clientY, rect);
    } else {
      lastTapRef.current = { time: now, videoId: id };
      tapTimeoutRef.current = setTimeout(() => {
        setPaused((prev) => !prev);
        tapTimeoutRef.current = null;
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
    const shareData = {
      title: video.title,
      text: `Regardez la création de @${video.creator} sur ZAP! : ${video.description}`,
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/zap?video=${video.id}`,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: 'Lien copié !', description: 'Le lien unique de la vidéo est disponible dans votre presse-papier.' });
      }
      setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, shares: v.shares + 1 } : v));
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
    const newComment: CommentData = {
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
      {/* En-tête de navigation du flux */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 shadow-2xl backdrop-blur-xl">
          <button className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wide text-white/60 transition hover:text-white">Abonnements</button>
          <button className="rounded-full bg-white/10 px-5 py-1.5 text-[11px] font-black tracking-wide text-white shadow-inner">Pour toi</button>
        </div>
      </header>

      {/* Zone de défilement natif fluide et performante */}
      <main
        ref={feedRef}
        className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-black"
      >
        {videos.map((video, index) => {
          const isLiked = likedVideos.includes(video.id);
          const isBookmarked = bookmarkedVideos.includes(video.id);
          const isFollowed = followedCreators.includes(video.creator);
          const isActive = activeVideo === video.id;

          // Calcul intelligent de la distance pour le préchargement agressif
          const isNearActive = Math.abs(videos.findIndex(v => v.id === activeVideo) - index) <= 1;

          const currentTime = progressState[video.id] ?? 0;
          const duration = durationState[video.id] ?? 0;
          const currentProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

          return (
            <section
              key={video.id}
              data-video-id={video.id}
              className="relative h-[100dvh] min-h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
            >
              {/* Lecteur Média Vidéo Optimizé */}
              <div 
                className="absolute inset-0 bg-black cursor-pointer"
                onClick={(e) => handleMediaGesture(video.id, e)}
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
                    const t = e.currentTarget.currentTime;
                    setProgressState(prev => ({ ...prev, [video.id]: t }));
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-30% to-black/90 pointer-events-none" />
              </div>

              {/* Indicateur visuel d'état Pause discret */}
              <AnimatePresence>
                {paused && isActive && (
                  <div className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-sm pointer-events-none">
                    <Play className="ml-1 h-6 w-6 fill-white text-white" />
                  </div>
                )}
              </AnimatePresence>

              {/* Animation cinématique de coeur au double-clic */}
              <AnimatePresence>
                {activeHeartAnimation && activeHeartAnimation.videoId === video.id && (
                  <div 
                    className="pointer-events-none absolute z-40 flex items-center justify-center"
                    style={{ left: activeHeartAnimation.x - 56, top: activeHeartAnimation.y - 56 }}
                  >
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 1.7, opacity: [0, 0.4, 0] }}
                      transition={{ duration: 0.6 }}
                      className="absolute h-24 w-24 rounded-full bg-white/15 blur-2xl"
                    />
                    <motion.div
                      initial={{ scale: 0.1, rotate: -20, opacity: 0 }}
                      animate={{
                        scale: [0.1, 1.4, 0.9, 1.1, 1],
                        rotate: [-20, 12, -6, 2, 0],
                        opacity: [0, 1, 1, 1, 0],
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      <Heart className="h-24 w-24 fill-white text-white drop-shadow-2xl" strokeWidth={1.5} />
                    </motion.div>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-1.5 w-1.5 rounded-full bg-primary"
                        initial={{ x: 0, y: 0, scale: 0 }}
                        animate={{
                          x: Math.cos(i * 0.785) * 75,
                          y: Math.sin(i * 0.785) * 75,
                          scale: [0, 1, 0],
                        }}
                        transition={{ duration: 0.6, delay: 0.04 }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Rail latéral des boutons d'actions tactiles isolés */}
              <div 
                className="absolute bottom-[130px] right-3.5 z-30 flex flex-col items-center gap-4.5"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              >
                {/* Bouton Like */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleToggleLike(video.id)}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md",
                      isLiked && "text-primary border-primary/40 bg-primary/10"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-primary stroke-primary")} />
                  </motion.button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md">{formatCount(video.likes)}</span>
                </div>

                {/* Bouton Commentaires */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => openCommentsSheet(video)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </motion.button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md">{formatCount(video.comments)}</span>
                </div>

                {/* Bouton Favoris / Bookmark */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleToggleBookmark(video.id)}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md",
                      isBookmarked && "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
                    )}
                  >
                    <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-yellow-400 stroke-yellow-400")} />
                  </motion.button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md">{formatCount(video.bookmarks)}</span>
                </div>

                {/* Bouton Partage */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleNativeShare(video)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                  <span className="mt-1 text-[10px] font-bold text-white drop-shadow-md">{formatCount(video.shares)}</span>
                </div>

                {/* Bouton Options Menu */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => openMenuSheet(video)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </motion.button>

                {/* Bouton Son Mute / Unmute Global */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setMuted((prev) => !prev)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-sm",
                    !muted && "border-primary/30 text-primary"
                  )}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </motion.button>
              </div>

              {/* Bloc de description réinventé et placé idéalement au-dessus du menu inférieur */}
              <div 
                className="absolute bottom-[90px] left-4 right-16 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 rounded-2xl border border-white/5 backdrop-blur-[2px]"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Squircle Premium Avatar aux couleurs ZAP */}
                    <div className="relative h-11 w-11 shrink-0 p-0.5 rounded-[14px] bg-gradient-to-tr from-primary to-purple-600 shadow-md">
                      <div className="w-full h-full rounded-[11px] overflow-hidden bg-neutral-900">
                        <img 
                          src={`https://picsum.photos/seed/${video.creator}/100/100`} 
                          alt={video.fullName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">@{video.creator}</span>
                        <button
                          onClick={() => handleToggleFollow(video.creator)}
                          className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full transition-all tracking-tight shrink-0",
                            isFollowed ? "bg-white/20 text-white" : "bg-primary text-white shadow-sm"
                          )}
                        >
                          {isFollowed ? 'Suivi ✓' : 'Suivre'}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/60 font-medium truncate">{video.fullName} • {video.institution}</p>
                    </div>
                  </div>

                  <h2 className="text-xs font-black text-neutral-100 line-clamp-1">{video.title}</h2>
                  <p className="text-xs font-medium text-neutral-300 leading-relaxed line-clamp-2">{video.description}</p>

                  <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-primary font-black uppercase tracking-wider">
                    <Music className="h-3 w-3 shrink-0 animate-pulse" />
                    <span className="truncate font-mono">{video.audioName}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-white/40" />
                    <span className="text-white/50 lowercase font-sans font-normal">original</span>
                  </div>
                </div>
              </div>

              {/* Ligne de progression fine en temps réel basé sur timeupdate */}
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

      {/* SYSTÈME DE BOTTOM SHEETS PREMIUM ARCHITECTURÉ GLOBALEMENT */}
      <AnimatePresence>
        {activeSheet && selectedVideo && (
          <>
            {/* Voile arrière-plan transparent cliquable pour fermer */}
            <motion.div
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeGlobalSheet}
            />

            {/* Panneau coulissant */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[100] max-h-[75dvh] overflow-hidden rounded-t-[2.5rem] border-t border-white/10 bg-[#121214]/95 shadow-[0_-15px_40px_rgba(0,0,0,0.7)] backdrop-blur-3xl text-white flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            >
              {/* Barre supérieure ergonomique de fermeture tactille */}
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20 shrink-0 cursor-pointer" onClick={closeGlobalSheet} />

              {/* CONTENU OPTION 1 : COMMENTAIRES (Lazy Loaded au clic) */}
              {activeSheet === 'comments' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      Commentaires créatifs ({selectedVideo.comments})
                    </span>
                    <button onClick={closeGlobalSheet} className="p-1.5 rounded-xl bg-white/5 text-white/70 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Liste défilante des commentaires */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(commentsStore[selectedVideo.id] || []).length > 0 ? (
                      (commentsStore[selectedVideo.id] || []).map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start text-xs text-neutral-200">
                          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary border border-primary/20 font-black uppercase flex items-center justify-center shrink-0">
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
                      ))
                    ) : (
                      <div className="py-16 text-center text-xs text-neutral-500 font-bold uppercase tracking-wider">
                        Aucun commentaire pour le moment.
                      </div>
                    )}
                  </div>

                  {/* Zone fixe de saisie */}
                  <div className="p-3 border-t border-white/5 bg-neutral-900/60 flex gap-2 items-center pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
                    <Input
                      placeholder="Exprimer votre avis de créateur..."
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                      className="flex-1 h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-500 text-sm focus-visible:ring-primary/40"
                    />
                    <Button 
                      onClick={submitComment} 
                      disabled={!newCommentInput.trim()} 
                      size="icon" 
                      className="rounded-xl h-11 w-11 bg-primary text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* CONTENU OPTION 2 : MENU OPTIONS AVANCÉES ⋯ */}
              {activeSheet === 'menu' && (
                <div className="p-5 space-y-4 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
                  <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black truncate max-w-[280px]">{selectedVideo.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-medium">Créé par @{selectedVideo.creator}</p>
                    </div>
                    <button onClick={closeGlobalSheet} className="p-1.5 rounded-xl bg-white/5 text-white/70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => { handleToggleBookmark(selectedVideo.id); closeGlobalSheet(); }}
                      className="w-full h-12 bg-white/5 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-white/10 text-left transition-all"
                    >
                      <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                      {bookmarkedVideos.includes(selectedVideo.id) ? "Retirer de mes favoris" : "Enregistrer le projet"}
                    </button>

                    <button 
                      onClick={() => { handleNativeShare(selectedVideo); closeGlobalSheet(); }}
                      className="w-full h-12 bg-white/5 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-white/10 text-left transition-all"
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                      Partager via le système natif
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button 
                      onClick={() => { toast({ title: 'Contenu masqué', description: 'Nous adapterons vos suggestions.' }); closeGlobalSheet(); }}
                      className="w-full h-12 bg-white/5 text-neutral-400 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-white/10 text-left transition-all"
                    >
                      Pas intéressé par ce thème
                    </button>

                    <button 
                      onClick={() => { toast({ title: 'Signalement transmis', description: 'Merci pour votre contribution à la sécurité.' }); closeGlobalSheet(); }}
                      className="w-full h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-rose-500/20 text-left transition-all"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Signaler ce contenu inapproprié
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
