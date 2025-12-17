
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, limit, getDoc, doc, orderBy, writeBatch } from 'firebase/firestore';
import type { Album, Artist, Track } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MoreVertical, Play, Clock, Music } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Explicit } from '@/components/chat/chat-messages';
import { useToast } from '@/hooks/use-toast';
import { getAlbumTracks } from '@/lib/spotify';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 100, damping: 15, duration: 0.3 }
  }),
};

export default function AlbumPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();
    const { toast } = useToast();

    const [album, setAlbum] = useState<Album | null>(null);
    const [artist, setArtist] = useState<Artist | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const syncTracks = useCallback(async (albumData: Album) => {
        if (!albumData.spotifyId || !firestore) return;
        setIsSyncing(true);

        try {
            const spotifyData = await getAlbumTracks(albumData.spotifyId);
            
            if (spotifyData.items && spotifyData.items.length > 0) {
                const batch = writeBatch(firestore);
                const tracksRef = collection(firestore, 'music', albumData.id, 'tracks');

                spotifyData.items.forEach((track: any) => {
                    const newTrackRef = doc(tracksRef, track.id);
                    batch.set(newTrackRef, {
                        title: track.name,
                        audioUrl: '', // Intentionally left blank for manual entry
                        duration: Math.round(track.duration_ms / 1000),
                        position: track.track_number,
                        streams: 0, // Not available from this endpoint
                        isExplicit: track.explicit,
                    });
                });
                await batch.commit();
                toast({ description: `${spotifyData.items.length} pistes synchronisées pour cet album.` });
            }
        } catch (error) {
            console.error("Failed to sync album tracks:", error);
            toast({ variant: 'destructive', title: 'Erreur de synchronisation', description: "Impossible de récupérer les pistes de l'album." });
        } finally {
            setIsSyncing(false);
        }
    }, [firestore, toast]);


    useEffect(() => {
        if (!firestore || !slug) return;

        const albumsRef = collection(firestore, 'music');
        const q = query(
            albumsRef,
            where('type', '==', 'album'),
            where('slug', '==', slug),
            limit(1)
        );
        
        const unsubscribeAlbum = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                const albumDoc = snapshot.docs[0];
                const albumData = { id: albumDoc.id, ...albumDoc.data() } as Album;
                setAlbum(albumData);

                if (albumData.artistId) {
                    const artistRef = doc(firestore, 'music', albumData.artistId);
                    const artistSnap = await getDoc(artistRef);
                    if (artistSnap.exists()) {
                        setArtist({ id: artistSnap.id, ...artistSnap.data() } as Artist);
                    }
                }
                
                const tracksRef = collection(firestore, 'music', albumDoc.id, 'tracks');
                const tracksQuery = query(tracksRef, orderBy('position', 'asc'));
                const unsubscribeTracks = onSnapshot(tracksQuery, (tracksSnapshot) => {
                    if (tracksSnapshot.empty && albumData.spotifyId) {
                       syncTracks(albumData);
                    } else {
                        const tracksData = tracksSnapshot.docs.map(trackDoc => ({ id: trackDoc.id, ...trackDoc.data() } as Track));
                        setTracks(tracksData);
                    }
                });

                 setLoading(false);
                 // We don't return unsubscribeTracks here because it needs to stay alive
            } else {
                 console.error("No album found with that slug.");
                 setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching album:", error);
            setLoading(false);
        });

        return () => unsubscribeAlbum();
    }, [firestore, slug, syncTracks]);
    
    const handlePlayTrack = (track: Track) => {
        if (!album || !artist) return;
        
        const trackDataForPlayer = {
            id: track.id,
            name: track.title,
            artists: [{ name: artist.name }],
            album: { images: [{ url: album.cover }] },
            audioUrl: track.audioUrl,
            duration: track.duration
        };
        const params = new URLSearchParams({ trackData: encodeURIComponent(JSON.stringify(trackDataForPlayer)) });
        router.push(`/chat/music/track/${track.id}?${params.toString()}`);
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!album) {
        return (
             <div className="flex flex-col h-screen w-full items-center justify-center bg-background text-center p-4">
                <Music className="w-12 h-12 text-muted-foreground mb-4"/>
                <h2 className="text-xl font-semibold">Album non trouvé</h2>
                <p className="text-muted-foreground mt-2">Désolé, nous n'avons pas pu trouver cet album.</p>
                <Button onClick={() => router.back()} className="mt-6">Retour</Button>
            </div>
        )
    }
    
     const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/50 to-transparent"
            >
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-background/50 backdrop-blur-sm">
                    <ArrowLeft size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="size-9 rounded-full bg-background/50 backdrop-blur-sm">
                    <MoreVertical size={20} />
                </Button>
            </motion.header>

            <motion.div
                className="relative w-full h-[45vh] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute inset-0">
                    <Image src={album.cover} alt={`${album.title} cover`} layout="fill" objectFit="cover" className="opacity-30 blur-xl scale-125" priority/>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>
                 <div className="relative z-10 flex flex-col items-center justify-end h-full text-center p-6">
                    <motion.div 
                        className="w-48 h-48 md:w-56 md:h-56 relative shadow-2xl rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    >
                         <Image src={album.cover} alt={album.title} layout="fill" objectFit="cover" className="rounded-lg"/>
                    </motion.div>
                </div>
            </motion.div>
            
            <main className="px-4 md:px-6 pb-8 relative z-10 mt-4">
                 <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial="hidden"
                    animate="visible"
                    variants={FADE_UP_ANIMATION_VARIANTS}
                 >
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{album.title}</h1>
                    <h2 className="text-lg text-muted-foreground mt-1 cursor-pointer hover:underline" onClick={() => artist && router.push(`/chat/music/artist/${artist.slug}`)}>
                        {artist ? artist.name : album.artistName}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Album • {new Date(album.releaseDate).getFullYear()} • {album.tracksCount} titres
                    </p>
                 </motion.div>

                 <motion.div 
                    className="flex justify-center gap-2 mt-6 max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={FADE_UP_ANIMATION_VARIANTS}
                >
                    <Button size="lg" className="rounded-full h-12 flex-1 max-w-xs bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20">
                        <Play className="w-5 h-5 mr-2" /> Lecture
                    </Button>
                </motion.div>

                <motion.div 
                    className="mt-8 max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                        },
                    }}
                >
                    {(isSyncing && tracks.length === 0) ? (
                         <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <h3 className="text-lg font-semibold">Synchronisation des pistes...</h3>
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                            <Music className="w-12 h-12 mb-4" />
                            <h3 className="text-lg font-semibold">Aucune piste trouvée</h3>
                            <p className="text-sm">Impossible de charger les pistes pour cet album.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tracks.map((track, i) => (
                                <motion.div
                                    key={track.id}
                                    variants={FADE_UP_ANIMATION_VARIANTS}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    onClick={() => handlePlayTrack(track)}
                                >
                                    <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                        <div className="text-muted-foreground font-mono text-sm w-5 text-center">
                                            {track.position}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{track.title}</p>
                                            <p className="text-xs text-muted-foreground">{artist?.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            {track.isExplicit && <Explicit className="w-4 h-4" title="Explicite"/>}
                                            <span className="text-xs font-mono w-12 text-right">
                                                {formatDuration(track.duration)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
