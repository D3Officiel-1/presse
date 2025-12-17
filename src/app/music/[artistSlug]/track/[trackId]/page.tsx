
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { ArrowLeft, Pause, Play, Loader2, Music, Shuffle, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { type TrackForPlayer } from '@/lib/types';
import ReactPlayer from 'react-player/youtube';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';

const extractUrlFromIframe = (iframeString?: string | null): string | undefined => {
    if (!iframeString) return undefined;
    if (iframeString.trim().startsWith('http')) return iframeString;
    const match = iframeString.match(/src="([^"]+)"/);
    return match ? match[1] : undefined;
}

function PlayerComponent() {
    const router = useRouter();
    const params = useParams() as { artistSlug: string; trackId: string; albumId?: string };
    
    const [track, setTrack] = useState<TrackForPlayer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef<ReactPlayer>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const firestore = useFirestore();

    useEffect(() => {
        setIsClient(true);
        const fetchTrack = async () => {
          if (!params.trackId || !params.artistSlug || !firestore) {
              setIsLoading(false);
              return;
          };

          // Find artistId from slug first
          const artistsRef = collection(firestore, 'music');
          const artistQuery = query(artistsRef, where('slug', '==', params.artistSlug), limit(1));
          const artistSnap = await getDocs(artistQuery);

          if (artistSnap.empty) {
              console.error("Artist not found for slug:", params.artistSlug);
              setIsLoading(false);
              router.back();
              return;
          }
          const artistId = artistSnap.docs[0].id;
          
          let trackRef;
          if (params.albumId) {
            trackRef = doc(firestore, `music/${artistId}/albums/${params.albumId}/tracks/${params.trackId}`);
          } else {
            trackRef = doc(firestore, `music/${artistId}/singles/${params.trackId}`);
          }
          
          const snap = await getDoc(trackRef);
      
          if (!snap.exists()) {
             console.error("Track not found at path:", trackRef.path);
             setIsLoading(false);
             router.back();
             return;
          }
      
          setTrack({
            id: snap.id,
            ...snap.data()
          } as TrackForPlayer);
          setDuration(snap.data().duration || 0);
          setIsPlaying(true);
          setIsLoading(false);
        };
      
        fetchTrack();
      }, [params, firestore, router]);

    const handleProgress = (state: { played: number; playedSeconds: number }) => {
        setProgress(state.played * 100);
        setCurrentTime(state.playedSeconds);
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
        setIsLoading(false);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(100);
        setTimeout(() => {
            setProgress(0);
            setCurrentTime(0);
            playerRef.current?.seekTo(0);
        }, 500);
    };

    const togglePlay = () => {
        if (!track?.audioUrl) return;
        setIsPlaying(!isPlaying);
    };
    
    const handleSliderChange = (value: number[]) => {
        const newProgress = value[0] / 100;
        playerRef.current?.seekTo(newProgress, 'fraction');
        setProgress(value[0]);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds === Infinity) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading || !track) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    const trackUrl = extractUrlFromIframe(track.audioUrl);

    return (
        <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background">
            {isClient && (
                <ReactPlayer
                    ref={playerRef}
                    url={trackUrl || ''}
                    playing={isPlaying}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={handleEnded}
                    onReady={() => setIsLoading(false)}
                    onError={(e) => console.error('Player Error', e)}
                    hidden={true}
                    width="0"
                    height="0"
                />
            )}
            <div className="absolute inset-0 z-0">
                {track.cover && (
                    <Image
                        src={track.cover}
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
                       {track.cover && (
                            <Image
                                src={track.cover}
                                alt={track.title}
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
                        <h1 className="text-2xl font-bold tracking-tight truncate">{track.title}</h1>
                        <p className="text-muted-foreground font-medium truncate">{track.artistName}</p>
                    </div>

                    {trackUrl ? (
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
                             <p className="text-sm text-muted-foreground">Aucun audio disponible pour ce titre.</p>
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
