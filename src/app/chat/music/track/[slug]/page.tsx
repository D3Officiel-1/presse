
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { ArrowLeft, Pause, Play, Loader2, Music, Shuffle, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { type SpotifyTrack } from '@/lib/types';

function PlayerComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params.slug;
    
    const [track, setTrack] = useState<SpotifyTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const trackData = searchParams.get('trackData');
        if (trackData) {
            try {
                const parsedTrack = JSON.parse(decodeURIComponent(trackData));
                setTrack(parsedTrack);
                setIsLoading(true); // Reset loading state for new track
            } catch (error) {
                console.error("Failed to parse track data", error);
                router.back();
            }
        } else {
             router.back();
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (track && track.preview_url && audioRef.current) {
            const audio = audioRef.current;
            
            audio.src = track.preview_url;
            audio.load();

            const handleCanPlay = () => {
                 audio.play().catch(e => console.error("Autoplay failed:", e));
            };

            const handlePlay = () => {
                setIsPlaying(true);
                setIsLoading(false);
            }
            const handlePause = () => setIsPlaying(false);

            const handleTimeUpdate = () => {
                if (audio.duration > 0) {
                  setCurrentTime(audio.currentTime);
                  setProgress((audio.currentTime / audio.duration) * 100);
                }
            };

            const handleLoadedMetadata = () => {
                setDuration(audio.duration);
                setIsLoading(false);
            };

            const handleEnded = () => {
                setIsPlaying(false);
                setProgress(100);
                 setTimeout(() => {
                    setProgress(0);
                    setCurrentTime(0);
                 }, 500)
            };
            
            audio.addEventListener('canplay', handleCanPlay);
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('timeupdate', handleTimeUpdate);
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            audio.addEventListener('ended', handleEnded);

            return () => {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audio.removeEventListener('ended', handleEnded);
                audio.pause();
            };
        } else if (track && !track.preview_url) {
            setIsLoading(false);
        }
    }, [track]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                if (audioRef.current.ended) {
                    audioRef.current.currentTime = 0;
                }
                audioRef.current.play();
            }
        }
    };
    
    const handleSliderChange = (value: number[]) => {
        if (audioRef.current && duration > 0) {
            const newTime = (value[0] / 100) * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds === Infinity) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    if (!track) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background">
            <audio ref={audioRef} className="hidden" />
            <div className="absolute inset-0 z-0">
                {track.album.images[0]?.url && (
                    <Image
                        src={track.album.images[0].url}
                        alt="Album background"
                        layout="fill"
                        className="object-cover blur-3xl scale-125 opacity-30"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            </div>
            
            <header className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm">
                    <ArrowLeft />
                </Button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white relative z-10">
                <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    <div className="relative aspect-square rounded-2xl shadow-2xl overflow-hidden">
                       {track.album.images[0]?.url && (
                            <Image
                                src={track.album.images[0].url}
                                alt={track.name}
                                layout="fill"
                                className="object-cover"
                                priority
                            />
                       )}
                    </div>
                </motion.div>
            </div>
            
            <motion.div 
                className="relative z-10 p-6 pt-0 bg-gradient-to-t from-background via-background/90 to-transparent"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >
                <div className="max-w-md mx-auto space-y-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight truncate">{track.name}</h1>
                        <p className="text-muted-foreground font-medium truncate">{track.artists.map(a => a.name).join(', ')}</p>
                    </div>

                    {track.preview_url ? (
                        <>
                            <div className="space-y-2">
                                <Slider 
                                    defaultValue={[0]} 
                                    value={[progress]}
                                    max={100} 
                                    step={1} 
                                    onValueChange={handleSliderChange}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground">
                                    <Shuffle className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-16 w-16 text-muted-foreground">
                                    <SkipBack className="w-8 h-8 fill-current" />
                                </Button>
                                <Button size="icon" className="h-20 w-20 rounded-full shadow-lg" onClick={togglePlay}>
                                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-16 w-16 text-muted-foreground">
                                    <SkipForward className="w-8 h-8 fill-current" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground">
                                    <Repeat className="w-5 h-5" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                             <Music className="mx-auto w-8 h-8 mb-2 text-muted-foreground"/>
                             <p className="text-sm text-muted-foreground">Aucun aperçu disponible pour ce titre.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function MusicPlayerPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <PlayerComponent />
        </Suspense>
    );
}
