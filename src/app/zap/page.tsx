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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  image: string;
  hint: string;
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
    image: 'https://picsum.photos/seed/zap1/600/1000',
    hint: 'cyberpunk student coding movie',
    audioName: 'Original Audio — Yannick VFX',
    description:
      'Premier test de rendu 3D sur le campus. #vfx #coding #zapstudio',
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
    image: 'https://picsum.photos/seed/zap2/600/1000',
    hint: 'african young woman speech presentation',
    audioName: 'Tech Talk — Innovation Hub',
    description:
      'Comment nous allons changer la mobilité à Abidjan. #tech #startup #ivorycoast',
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
    description:
      'La fusion entre tradition et modernité. #dance #culture #zap',
  },
];

function formatCount(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace('.0', '')} M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')} K`;
  }
  return value.toString();
}

export default function FeedPage(props: { params?: Promise<any>; searchParams?: Promise<any> }) {
  const params = props.params ? React.use(props.params) : null;
  const searchParams = props.searchParams ? React.use(props.searchParams) : null;
  const router = useRouter();

  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState('vid-1');
  const [paused, setPaused] = useState(false);
  const [showHeart, setShowHeart] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';

    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const handleToggleLike = (id: string) => {
    const alreadyLiked = likedVideos.includes(id);

    setLikedVideos((prev) =>
      alreadyLiked ? prev.filter((item) => item !== id) : [...prev, id]
    );

    setVideos((prev) =>
      prev.map((video) =>
        video.id === id
          ? {
              ...video,
              likes: alreadyLiked ? video.likes - 1 : video.likes + 1,
            }
          : video
      )
    );
  };

  const handleDoubleTap = (id: string) => {
    if (!likedVideos.includes(id)) {
      handleToggleLike(id);
    }

    setShowHeart(id);

    window.setTimeout(() => {
      setShowHeart(null);
    }, 850);
  };

  const handleToggleBookmark = (id: string) => {
    const alreadyBookmarked = bookmarkedVideos.includes(id);

    setBookmarkedVideos((prev) =>
      alreadyBookmarked
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );

    setVideos((prev) =>
      prev.map((video) =>
        video.id === id
          ? {
              ...video,
              bookmarks: alreadyBookmarked
                ? video.bookmarks - 1
                : video.bookmarks + 1,
            }
          : video
      )
    );
  };

  const handleToggleFollow = (creator: string) => {
    setFollowedCreators((prev) =>
      prev.includes(creator)
        ? prev.filter((item) => item !== creator)
        : [...prev, creator]
    );
  };

  const handleShare = async (video: Video) => {
    const shareData = {
      title: video.title,
      text: `${video.title} — @${video.creator}`,
      url: window.location.href,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }

      setVideos((prev) =>
        prev.map((item) =>
          item.id === video.id
            ? { ...item, shares: item.shares + 1 }
            : item
        )
      );
    } catch {
      // Annulé
    }
  };

  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-video-id]')
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveVideo(
            visible.target.getAttribute('data-video-id') || 'vid-1'
          );
          setPaused(false);
        }
      },
      {
        root: container,
        threshold: [0.65, 0.8, 0.95],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      {/* Top navigation */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-3 md:pt-5">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/35 p-1.5 shadow-2xl backdrop-blur-2xl">
          <button
            className="rounded-full px-4 py-2 text-[11px] font-bold tracking-wide text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            Abonnements
          </button>

          <button
            className="rounded-full bg-white/10 px-5 py-2 text-[11px] font-black tracking-wide text-white shadow-inner"
          >
            Pour toi
          </button>
        </div>
      </header>

      {/* Feed */}
      <main
        ref={feedRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video) => {
          const isLiked = likedVideos.includes(video.id);
          const isBookmarked = bookmarkedVideos.includes(video.id);
          const isFollowed = followedCreators.includes(video.creator);
          const isActive = activeVideo === video.id;

          return (
            <section
              key={video.id}
              data-video-id={video.id}
              className="relative h-[100dvh] w-full snap-start overflow-hidden bg-black"
              onDoubleClick={() => handleDoubleTap(video.id)}
            >
              {/* Background */}
              <div className="absolute inset-0">
                <motion.img
                  initial={{ scale: 1.04 }}
                  animate={{
                    scale: isActive && !paused ? 1.015 : 1.04,
                  }}
                  transition={{
                    duration: 6,
                    ease: 'easeOut',
                  }}
                  src={video.image}
                  alt={video.title}
                  className="h-full w-full object-cover"
                  data-ai-hint={video.hint}
                  draggable={false}
                />

                {/* Cinematic overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent via-30% to-black/95" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Center play/pause */}
              <AnimatePresence>
                {paused && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setPaused(false)}
                    className="absolute left-1/2 top-1/2 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 shadow-2xl backdrop-blur-xl"
                  >
                    <Play className="ml-1 h-7 w-7 fill-white" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Double tap heart */}
              <AnimatePresence>
                {showHeart === video.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.3, 1.25, 1, 1.15],
                    }}
                    transition={{ duration: 0.8 }}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Heart className="h-28 w-28 fill-white text-white drop-shadow-[0_8px_35px_rgba(255,255,255,0.35)]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right action rail (adapted position to be above the new bottom area) */}
              <div className="absolute bottom-[230px] right-3 z-30 flex w-14 flex-col items-center gap-4 md:right-5">
                {/* Avatar */}
                <div className="relative mb-1">
                  <div className="absolute -inset-1 rounded-[19px] bg-gradient-to-tr from-primary via-fuchsia-500 to-orange-400 opacity-80 blur-[4px]" />

                  <div className="relative h-12 w-12 overflow-hidden rounded-[16px] border-2 border-white bg-neutral-900 p-0.5 shadow-2xl">
                    <img
                      src={`https://picsum.photos/seed/${video.creator}/120/120`}
                      alt={video.fullName}
                      className="h-full w-full rounded-[12px] object-cover"
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.75 }}
                    onClick={() => handleToggleFollow(video.creator)}
                    aria-label={
                      isFollowed
                        ? `Ne plus suivre ${video.fullName}`
                        : `Suivre ${video.fullName}`
                    }
                    className={cn(
                      'absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-black shadow-lg',
                      isFollowed
                        ? 'bg-white text-black'
                        : 'bg-primary text-white'
                    )}
                  >
                    {isFollowed ? (
                      <Check className="h-3.5 w-3.5 stroke-[4]" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 stroke-[4]" />
                    )}
                  </motion.button>
                </div>

                {/* Like */}
                <ActionButton
                  active={isLiked}
                  activeClass="text-primary bg-primary/10 border-primary/30"
                  onClick={() => handleToggleLike(video.id)}
                  icon={
                    <Heart
                      className={cn(
                        'h-[22px] w-[22px]',
                        isLiked && 'fill-primary stroke-primary'
                      )}
                    />
                  }
                  count={formatCount(video.likes)}
                />

                {/* Comments */}
                <ActionButton
                  onClick={() => router.push('/zap/chat')}
                  icon={<MessageCircle className="h-5 w-5" />}
                  count={formatCount(video.comments)}
                />

                {/* Bookmark */}
                <ActionButton
                  active={isBookmarked}
                  activeClass="border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                  onClick={() => handleToggleBookmark(video.id)}
                  icon={
                    <Bookmark
                      className={cn(
                        'h-5 w-5',
                        isBookmarked &&
                          'fill-yellow-400 stroke-yellow-400'
                      )}
                    />
                  }
                  count={formatCount(video.bookmarks)}
                />

                {/* Share */}
                <ActionButton
                  onClick={() => handleShare(video)}
                  icon={<Share2 className="h-5 w-5" />}
                  count={formatCount(video.shares)}
                />

                {/* Music Icon */}
                <motion.div
                  animate={{ rotate: isActive && !paused ? 360 : 0 }}
                  transition={{
                    duration: 5,
                    repeat: isActive && !paused ? Infinity : 0,
                    ease: 'linear',
                  }}
                  className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 p-2 shadow-xl backdrop-blur-xl"
                >
                  <Music className="h-4 w-4 text-primary" />
                </motion.div>
              </div>

              {/* Repositioned Bottom information: right above the floating nav bar layout */}
              <div className="absolute bottom-[90px] left-4 right-20 z-20 md:left-6 md:right-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-3xl backdrop-blur-[2px] border border-white/5">
                <div className="max-w-xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleToggleFollow(video.creator)}
                      className="text-[15px] font-black tracking-tight drop-shadow-md text-white hover:opacity-80 transition"
                    >
                      @{video.creator}
                    </button>

                    <Badge className="rounded-full border border-white/10 bg-primary text-white px-2 py-0.5 text-[9px] font-bold tracking-wider">
                      {video.institution}
                    </Badge>
                  </div>

                  <h2 className="line-clamp-1 text-sm font-black leading-snug text-neutral-100 drop-shadow-md">
                    {video.title}
                  </h2>

                  <p className="line-clamp-2 text-xs font-medium leading-relaxed text-neutral-300 drop-shadow-sm">
                    {video.description}
                  </p>

                  <div className="flex min-w-0 items-center gap-2 pt-0.5 text-[10px] text-primary font-black uppercase tracking-wider">
                    <Music className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                    <span className="truncate font-mono">
                      {video.audioName}
                    </span>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-white/40" />
                    <span className="text-white/60 lowercase font-sans">original</span>
                  </div>
                </div>
              </div>

              {/* Bottom progress line */}
              <div className="absolute bottom-0 left-0 right-0 z-40 h-[2px] bg-white/10">
                <motion.div
                  className="h-full origin-left bg-white"
                  animate={{
                    scaleX: isActive && !paused ? 1 : 0.12,
                  }}
                  transition={{
                    duration: isActive && !paused ? 8 : 0.4,
                    ease: 'linear',
                  }}
                />
              </div>

              {/* Pause zone */}
              <button
                aria-label={paused ? 'Lire' : 'Mettre en pause'}
                onClick={() => setPaused((value) => !value)}
                className="absolute inset-0 z-10 cursor-default"
              />
            </section>
          );
        })}
      </main>
    </div>
  );
}

type ActionButtonProps = {
  icon: React.ReactNode;
  count: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
};

function ActionButton({
  icon,
  count,
  onClick,
  active,
  activeClass,
}: ActionButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.84 }}
        onClick={onClick}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-xl backdrop-blur-xl transition-colors md:h-12 md:w-12',
          active && activeClass
        )}
      >
        {icon}
      </motion.button>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-[10px] font-bold tracking-tight text-white drop-shadow-lg md:text-[11px]"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
