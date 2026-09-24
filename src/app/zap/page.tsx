'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Music,
  Play,
  Check,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Send,
  X,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    description: 'Premier test de rendu 3D sur le campus. #vfx #coding #zapstudio',
  },
  {
    id: 'vid-2',
    title: 'Pitch d’Avenir : Révolutionner le transport',
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
    description: 'Comment nous allons changer la mobilité à Abidjan. #tech #startup #ivorycoast',
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
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://picsum.photos/seed/zap3/600/1000',
    audioName: 'Coupé Décalé Remix 2024',
    description: 'La fusion entre tradition et modernité. #dance #culture #zap',
  },
];

type Comment = {
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
  
  // États d'animations
  const [heartAnim, setHeartAnim] = useState<{ id: string; x: number; y: number } | null>(null);

  // Bottom Sheets globales
  const [activeSheet, setActiveSheet] = useState<'comments' | 'menu' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Commentaires simulés
  const [commentsList, setCommentsList] = useState<Record<string, Comment[]>>({
    'vid-1': [
      { id: '1', user: 'fatim_creative', text: 'Incroyable les effets de lumière ! 🔥', time: 'Il y a 2h' },
      { id: '2', user: 'gilles_art', text: 'Quel logiciel as-tu utilisé pour le tracking ?', time: 'Il y a 1h' }
    ],
    'vid-2': [
      { id: '1', user: 'yannick_vfx', text: 'Trés bon pitch, clair et ambitieux ! 🙌', time: 'Il y a 30 min' }
    ]
  });
  const [newCommentText, setNewCommentText] = useState('');
  
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [videoDuration, setVideoDuration] = useState<Record<string, number>>({});

  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const handleToggleLike = (id: string) => {
    const alreadyLiked = likedVideos.includes(id);
    setLikedVideos((prev) => alreadyLiked ? prev.filter((item) => item !== id) : [...prev, id]);
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, likes: alreadyLiked ? video.likes - 1 : video.likes + 1 } : video
      )
    );
  };

  const handleDoubleTap = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!likedVideos.includes(id)) handleToggleLike(id);
    
    // Obtenir coordonnées relatives
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setHeartAnim({ id, x, y });
    setTimeout(() => setHeartAnim(null), 900);
  };

  const togglePlayback = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const handleVideoTap = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta > 0 && delta < 300) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      handleDoubleTap(id, e);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        togglePlayback(id);
        tapTimeoutRef.current = null;
      }, 280);
    }
    lastTapRef.current = now;
  };

  const handleToggleBookmark = (id: string) => {
    const alreadyBookmarked = bookmarkedVideos.includes(id);
    setBookmarkedVideos((prev) => alreadyBookmarked ? prev.filter((item) => item !== id) : [...prev, id]);
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, bookmarks: alreadyBookmarked ? video.bookmarks - 1 : video.bookmarks + 1 } : video
      )
    );
    toast({
      title: alreadyBookmarked ? 'Retiré des favoris' : 'Ajouté aux favoris !',
      description: alreadyBookmarked ? 'Le projet a été retiré.' : 'Retrouvez-le dans votre profil.'
    });
  };

  const handleToggleFollow = (creator: string) => {
    const isFollowing = followedCreators.includes(creator);
    setFollowedCreators((prev) =>
      isFollowing ? prev.filter((item) => item !== creator) : [...prev, creator]
    );
    toast({
      title: isFollowing ? 'Abonnement retiré' : 'Abonné !',
      description: isFollowing ? `Vous ne suivez plus @${creator}` : `Vous suivez maintenant @${creator}`
    });
  };

  const handleShare = async (video: Video) => {
    const shareData = { title: video.title, text: `${video.title} — @${video.creator}`, url: window.location.href };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Lien copié !', description: 'Le lien de la vidéo a été copié dans votre presse-papier.' });
      }
      setVideos((prev) => prev.map((item) => item.id === video.id ? { ...item, shares: item.shares + 1 } : item));
    } catch {}
  };

  const openComments = (video: Video) => {
    setSelectedVideo(video);
    setActiveSheet('comments');
  };

  const openMenu = (video: Video) => {
    setSelectedVideo(video);
    setActiveSheet('menu');
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setSelectedVideo(null);
    setNewCommentText('');
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedVideo) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'moi_createur',
      text: newCommentText.trim(),
      time: 'À l\'instant'
    };
    
    setCommentsList(prev => ({
      ...prev,
      [selectedVideo.id]: [...(prev[selectedVideo.id] || []), newComment]
    }));
    
    setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, comments: v.comments + 1 } : v));
    setNewCommentText('');
  };

  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;
    const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-video-id]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (!videoId) return;
          const video = videoRefs.current[videoId];
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            setActiveVideo(videoId);
            video.play().catch(() => {});
            setPaused(false);
          } else {
            video.pause();
          }
        });
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center pt-3 md:pt-5">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 shadow-2xl backdrop-blur-xl">
          <button className="rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wide text-white/60 transition hover:text-white">Abonnements</button>
          <button className="rounded-full bg-white/10 px-5 py-1.5 text-[11px] font-black tracking-wide text-white shadow-inner">Pour toi</button>
        </div>
      </header>

      <main 
        ref={feedRef} 
        className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video) => {
          const isLiked = likedVideos.includes(video.id);
          const isBookmarked = bookmarkedVideos.includes(video.id);
          const isFollowed = followedCreators.includes(video.creator);
          const isActive = activeVideo === video.id;
          const currentTime = videoProgress[video.id] ?? 0;
          const duration = videoDuration[video.id] ?? 0;
          const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

          return (
            <section
              key={video.id}
              data-video-id={video.id}
              className="relative h-[100dvh] w-full snap-start overflow-hidden bg-black touch-pan-y"
              onClick={(e) => handleVideoTap(video.id, e)}
            >
              {/* Vidéo véritable */}
              <div className="absolute inset-0 pointer-events-none">
                <video
                  ref={(el) => { videoRefs.current[video.id] = el; }}
                  src={video.videoUrl}
                  poster={video.poster}
                  muted={muted}
                  playsInline
                  loop
                  preload={isActive ? 'auto' : 'metadata'}
                  className="h-full w-full object-cover"
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration;
                    setVideoDuration(prev => ({ ...prev, [video.id]: d }));
                  }}
                  onTimeUpdate={(e) => {
                    const t = e.currentTarget.currentTime;
                    setVideoProgress(prev => ({ ...prev, [video.id]: t }));
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent via-30% to-black/90" />
              </div>

              {/* Bouton muet/son en haut à gauche */}
              <div className="absolute left-4 top-4 z-30">
                <button
                  onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all active:scale-90"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

              {/* Bouton Plus Option en haut à droite */}
              <div className="absolute right-4 top-4 z-30">
                <button
                  onClick={(e) => { e.stopPropagation(); openMenu(video); }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all active:scale-90"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Indicateur pause visuel au centre */}
              <AnimatePresence>
                {paused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    className="absolute left-1/2 top-1/2 z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 shadow-2xl backdrop-blur-md pointer-events-none"
                  >
                    <Play className="ml-1 h-6 w-6 fill-white text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animation Double Tap coeur TikTok-like réaliste */}
              <AnimatePresence>
                {heartAnim && heartAnim.id === video.id && (
                  <motion.div
                    className="pointer-events-none absolute z-50 flex items-center justify-center"
                    style={{ left: heartAnim.x - 56, top: heartAnim.y - 56 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Halo de lumière */}
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 1.6, opacity: [0, 0.5, 0] }}
                      transition={{ duration: 0.6 }}
                      className="absolute h-28 w-28 rounded-full bg-white/20 blur-2xl"
                    />

                    {/* Coeur rebondissant */}
                    <motion.div
                      initial={{ scale: 0.15, rotate: -15, opacity: 0 }}
                      animate={{
                        scale: [0.15, 1.4, 0.9, 1.1, 1],
                        rotate: [-15, 10, -5, 2, 0],
                        opacity: [0, 1, 1, 1, 0],
                      }}
                      transition={{
                        duration: 0.85,
                        times: [0, 0.2, 0.45, 0.65, 1],
                        ease: 'easeOut',
                      }}
                    >
                      <Heart className="h-24 w-24 fill-white text-white drop-shadow-2xl" strokeWidth={1.5} />
                    </motion.div>

                    {/* Particules éclatantes */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-1.5 w-1.5 rounded-full bg-primary"
                        initial={{ x: 0, y: 0, scale: 0 }}
                        animate={{
                          x: Math.cos(i * 1.04) * 70,
                          y: Math.sin(i * 1.04) * 70,
                          scale: [0, 1, 0],
                        }}
                        transition={{ duration: 0.6, delay: 0.02 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rail d'actions à droite adapté aux mobiles */}
              <div className="absolute bottom-[130px] right-3 z-30 flex flex-col items-center gap-4">
                <ActionButton 
                  active={isLiked} 
                  activeClass="text-primary border-primary/40 bg-primary/10" 
                  onClick={(e) => { e.stopPropagation(); handleToggleLike(video.id); }} 
                  icon={<Heart className={cn('h-5 w-5', isLiked && 'fill-primary stroke-primary')} />} 
                  count={formatCount(video.likes)} 
                />
                <ActionButton 
                  onClick={(e) => { e.stopPropagation(); openComments(video); }} 
                  icon={<MessageCircle className="h-5 w-5" />} 
                  count={formatCount(video.comments)} 
                />
                <ActionButton 
                  active={isBookmarked} 
                  activeClass="text-yellow-400 border-yellow-400/40 bg-yellow-400/10" 
                  onClick={(e) => { e.stopPropagation(); handleToggleBookmark(video.id); }} 
                  icon={<Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-yellow-400 stroke-yellow-400')} />} 
                  count={formatCount(video.bookmarks)} 
                />
                <ActionButton 
                  onClick={(e) => { e.stopPropagation(); handleShare(video); }} 
                  icon={<Share2 className="h-5 w-5" />} 
                  count={formatCount(video.shares)} 
                />
                
                <motion.div 
                  animate={{ rotate: isActive && !paused ? 360 : 0 }} 
                  transition={{ duration: 5, repeat: isActive && !paused ? Infinity : 0, ease: 'linear' }} 
                  className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 p-2 backdrop-blur-md"
                >
                  <Music className="h-4 w-4 text-primary" />
                </motion.div>
              </div>

              {/* Bloc d'informations repositionné juste au dessus de la barre de navigation */}
              <div className="absolute bottom-[90px] left-4 right-16 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 rounded-2xl border border-white/5 backdrop-blur-[2px]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Profil / Avatar en cercle miniature */}
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-neutral-900 shrink-0">
                      <img src={`https://picsum.photos/seed/${video.creator}/50/50`} alt={video.fullName} className="w-full h-full object-cover" />
                    </div>
                    
                    <span className="text-xs font-black drop-shadow-md text-white">@{video.creator}</span>
                    <span className="text-[10px] text-white/60 font-medium">({video.fullName})</span>
                    
                    {/* Bouton Suivre élégant directement intégré */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFollow(video.creator); }}
                      className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full transition-all tracking-tight",
                        isFollowed ? "bg-white/20 text-white" : "bg-primary text-white"
                      )}
                    >
                      {isFollowed ? 'Suivi ✓' : 'Suivre'}
                    </button>

                    <Badge variant="outline" className="text-[9px] px-2 py-0 border-white/20 text-white/80 bg-white/5">
                      {video.institution}
                    </Badge>
                  </div>

                  <h2 className="line-clamp-1 text-sm font-bold text-neutral-100 drop-shadow-sm">{video.title}</h2>
                  <p className="line-clamp-2 text-xs font-medium text-neutral-300 drop-shadow-sm leading-relaxed">{video.description}</p>
                  
                  <div className="flex min-w-0 items-center gap-1.5 pt-0.5 text-[10px] text-primary font-black uppercase tracking-wider">
                    <Music className="h-3 w-3 shrink-0 animate-pulse" />
                    <span className="truncate font-mono">{video.audioName}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-white/40" />
                    <span className="text-white/60 lowercase font-sans font-normal">original</span>
                  </div>
                </div>
              </div>

              {/* Ligne de progression réelle et fine */}
              <div className="absolute bottom-0 left-0 right-0 z-40 h-[3px] bg-white/10">
                <div className="h-full bg-white transition-[width] duration-100 origin-left" style={{ width: `${progress}%` }} />
              </div>
            </section>
          );
        })}
      </main>

      {/* SYSTÈME GLOBAL DE BOTTOM SHEETS PREMIUM */}
      <AnimatePresence>
        {activeSheet && selectedVideo && (
          <>
            {/* Voile sombre d'arrière-plan */}
            <motion.div
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
            />

            {/* Conteneur de la Sheet */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[100] max-h-[80dvh] overflow-hidden rounded-t-[2.5rem] border-t border-white/10 bg-[#111113]/95 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl text-white flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {/* Poignée supérieure */}
              <div className="mx-auto mt-3.5 h-1.5 w-12 rounded-full bg-white/20 shrink-0" />

              {/* SHEET : COMMENTAIRES */}
              {activeSheet === 'comments' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      Commentaires ({selectedVideo.comments})
                    </span>
                    <button onClick={closeSheet} className="p-1 rounded-xl bg-white/5 text-white/70 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Liste défilante des commentaires */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(commentsList[selectedVideo.id] || []).length > 0 ? (
                      (commentsList[selectedVideo.id] || []).map((comm) => (
                        <div key={comm.id} className="flex gap-3 items-start text-xs text-neutral-200">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/20 font-black uppercase flex items-center justify-center shrink-0">
                            {comm.user.substring(0, 2)}
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-white">@{comm.user}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">{comm.time}</span>
                            </div>
                            <p className="font-medium leading-relaxed text-neutral-300">{comm.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-neutral-500 font-bold uppercase tracking-wider">
                        Aucun commentaire. Soyez le premier !
                      </div>
                    )}
                  </div>

                  {/* Zone de saisie fixe */}
                  <div className="p-3 border-t border-white/5 bg-neutral-900/60 flex gap-2 items-center pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
                    <Input
                      placeholder="Ajouter un commentaire créatif..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      className="flex-1 h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-500 text-sm"
                    />
                    <Button onClick={handleAddComment} disabled={!newCommentText.trim()} size="icon" className="rounded-xl h-11 w-11 bg-primary text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SHEET : MENU OPTIONS ⋯ */}
              {activeSheet === 'menu' && (
                <div className="p-5 space-y-4">
                  <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black truncate max-w-[280px]">{selectedVideo.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-medium">Par @{selectedVideo.creator}</p>
                    </div>
                    <button onClick={closeSheet} className="p-1 rounded-xl bg-white/5 text-white/70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button 
                      onClick={() => { handleToggleBookmark(selectedVideo.id); closeSheet(); }}
                      className="w-full h-12 bg-white/5 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-white/10 text-left transition-colors"
                    >
                      <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                      {bookmarkedVideos.includes(selectedVideo.id) ? "Retirer de mes favoris" : "Enregistrer le projet"}
                    </button>

                    <button 
                      onClick={() => { handleShare(selectedVideo); closeSheet(); }}
                      className="w-full h-12 bg-white/5 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-white/10 text-left transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                      Partager via le système natif
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button 
                      onClick={() => { toast({ title: 'Signalement transmis', description: 'Merci pour votre vigilance.' }); closeSheet(); }}
                      className="w-full h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center px-4 gap-3 text-xs font-bold hover:bg-rose-500/20 text-left transition-colors"
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

type ActionButtonProps = {
  icon: React.ReactNode;
  count: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  activeClass?: string;
};

function ActionButton({ icon, count, onClick, active, activeClass }: ActionButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.button 
        whileHover={{ scale: 1.08 }} 
        whileTap={{ scale: 0.84 }} 
        onClick={onClick} 
        className={cn('flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md transition-colors', active && activeClass)}
      >
        {icon}
      </motion.button>
      <AnimatePresence mode="popLayout">
        <motion.span key={count} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-[10px] font-bold tracking-tight text-white drop-shadow-lg">
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
