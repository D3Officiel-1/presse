
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, limit, orderBy, getDocs, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import type { Artist, Album, Single } from '@/lib/types';
import { getArtistAlbums } from '@/lib/spotify';

import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MoreVertical, Play, Star, UserPlus, Music, Disc, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Explicit } from '@/components/chat/chat-messages';
import { useToast } from '@/hooks/use-toast';


const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

function formatFollowers(count: number) {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
    return count.toString();
}

export default function ArtistProfilePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();
    const { toast } = useToast();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [singles, setSingles] = useState<Single[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const syncAlbums = useCallback(async (artistData: Artist) => {
        if (!artistData.spotifyId || !firestore) return;
        setIsSyncing(true);
        
        try {
            const [spotifyData, firestoreSnapshot] = await Promise.all([
                getArtistAlbums(artistData.spotifyId),
                getDocs(collection(firestore, 'music', artistData.id, 'albums'))
            ]);

            const firestoreAlbumSpotifyIds = new Set(firestoreSnapshot.docs.map(doc => doc.data().spotifyId));
            
            const newAlbumsFromSpotify = spotifyData.items.filter((item: any) => 
                item.album_type === 'album' && !firestoreAlbumSpotifyIds.has(item.id)
            );

            if (newAlbumsFromSpotify.length > 0) {
                const batch = writeBatch(firestore);
                newAlbumsFromSpotify.forEach((album: any) => {
                    const newAlbumRef = doc(collection(firestore, 'music', artistData.id, 'albums'));
                    const albumSlug = album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                    batch.set(newAlbumRef, {
                        type: 'album',
                        title: album.name,
                        slug: albumSlug,
                        spotifyId: album.id,
                        cover: album.images[0]?.url,
                        releaseDate: album.release_date,
                        tracksCount: album.total_tracks,
                        isExplicit: album.explicit,
                        artistId: artistData.id,
                        artistName: artistData.name,
                        createdAt: Timestamp.now(),
                    });
                });
                await batch.commit();
                toast({ description: `${newAlbumsFromSpotify.length} nouvel(s) album(s) ajouté(s).` });
            }
        } catch (error) {
            console.error("Failed to sync albums:", error);
            toast({ variant: 'destructive', title: 'Erreur de synchronisation', description: "Impossible de mettre à jour les albums." });
        } finally {
            setIsSyncing(false);
        }
    }, [firestore, toast]);


    useEffect(() => {
        if (!firestore || !slug) return;

        setLoading(true);
        const artistsRef = collection(firestore, 'music');
        const q = query(
            artistsRef,
            where('type', '==', 'artist'),
            where('slug', '==', slug),
            limit(1)
        );

        const unsubscribeArtist = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const artistData = { id: doc.id, ...doc.data() } as Artist;
                setArtist(artistData);
                syncAlbums(artistData);

                // Fetch albums
                const albumsRef = collection(firestore, 'music', artistData.id, 'albums');
                const albumsQuery = query(albumsRef, orderBy('releaseDate', 'desc'));
                onSnapshot(albumsQuery, (albumsSnapshot) => {
                    const albumsData = albumsSnapshot.docs.map(albumDoc => ({ id: albumDoc.id, ...albumDoc.data() } as Album));
                    setAlbums(albumsData);
                });

                // Fetch singles
                const singlesRef = collection(firestore, 'music', artistData.id, 'singles');
                const singlesQuery = query(singlesRef, orderBy('releaseDate', 'desc'));
                onSnapshot(singlesQuery, (singlesSnapshot) => {
                    const singlesData = singlesSnapshot.docs.map(singleDoc => ({ id: singleDoc.id, ...singleDoc.data() } as Single));
                    setSingles(singlesData);
                });

                setLoading(false);
            } else {
                console.error("No artist found with that slug.");
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching artist:", error);
            setLoading(false);
        });

        return () => unsubscribeArtist();
    }, [firestore, slug, syncAlbums]);


    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!artist) {
        return (
             <div className="flex flex-col h-screen w-full items-center justify-center bg-background text-center p-4">
                <Music className="w-12 h-12 text-muted-foreground mb-4"/>
                <h2 className="text-xl font-semibold">Artiste non trouvé</h2>
                <p className="text-muted-foreground mt-2">Désolé, nous n'avons pas pu trouver la page de cet artiste.</p>
                <Button onClick={() => router.back()} className="mt-6">Retour</Button>
            </div>
        )
    }
    
    const handlePlaySingle = (single: Single) => {
        const trackData = {
            id: single.id,
            name: single.title,
            artists: [{ name: artist.name }],
            album: { images: [{ url: single.cover }] },
            preview_url: single.audioUrl,
        };
        const params = new URLSearchParams({ trackData: encodeURIComponent(JSON.stringify(trackData)) });
        router.push(`/chat/music/track/${single.id}?${params.toString()}`);
    }

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
                className="relative w-full h-[40vh] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute inset-0">
                    <Image src={artist.bannerImage} alt={`${artist.name} banner`} layout="fill" objectFit="cover" className="opacity-40" priority/>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                </div>
            </motion.div>
            
            <main className="-mt-24 px-4 md:px-6 pb-8 relative z-10">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                        transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.2
                        },
                        },
                    }}
                >
                    <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col items-center text-center">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                            <AvatarImage src={artist.profileImage} alt={artist.name} />
                            <AvatarFallback className="text-5xl">{artist.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4 flex items-center gap-2">
                            {artist.name}
                            {artist.verified && <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />}
                        </h1>
                        <p className="text-muted-foreground mt-2">{formatFollowers(artist.followersCount)} followers</p>
                    </motion.div>
                    
                     <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex justify-center gap-2 mt-6">
                        <Button size="lg" className="rounded-full h-12 flex-1 max-w-xs bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20">
                            <Play className="w-5 h-5 mr-2" /> Lecture
                        </Button>
                        <Button variant="secondary" size="lg" className="rounded-full h-12 flex-1 max-w-xs">
                          <UserPlus className="w-5 h-5 mr-2" /> S'abonner
                        </Button>
                    </motion.div>

                     <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mt-8">
                         <Tabs defaultValue="albums" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="albums">
                                    {isSyncing && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                    <Disc className="w-4 h-4 mr-2"/>
                                    Albums
                                </TabsTrigger>
                                <TabsTrigger value="singles"><Mic className="w-4 h-4 mr-2"/>Singles</TabsTrigger>
                                <TabsTrigger value="about"><UserPlus className="w-4 h-4 mr-2"/>À propos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="albums" className="mt-6">
                                <AnimatePresence>
                                    {albums.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {albums.map((album, i) => (
                                                <motion.div
                                                    key={album.id}
                                                    variants={FADE_UP_ANIMATION_VARIANTS}
                                                    custom={i}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    onClick={() => router.push(`/chat/music/album/${album.slug}`)}
                                                >
                                                    <div className="group space-y-2 cursor-pointer">
                                                        <div className="aspect-square relative">
                                                            <Image src={album.cover} alt={album.title} fill className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 shadow-lg" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-semibold truncate">{album.title}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(album.releaseDate).getFullYear()}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8">
                                            <Disc className="w-10 h-10 mx-auto mb-4" />
                                            <h3 className="font-semibold">Aucun album pour le moment</h3>
                                            <p className="text-sm">Les albums de cet artiste apparaîtront bientôt ici.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </TabsContent>
                             <TabsContent value="singles" className="mt-6">
                                <AnimatePresence>
                                    {singles.length > 0 ? (
                                        <div className="space-y-2">
                                            {singles.map((single, i) => (
                                                <motion.div
                                                    key={single.id}
                                                    variants={FADE_UP_ANIMATION_VARIANTS}
                                                    custom={i}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    onClick={() => handlePlaySingle(single)}
                                                >
                                                    <div className="group flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                                        <div className="aspect-square w-12 h-12 relative flex-shrink-0">
                                                            <Image src={single.cover} alt={single.title} fill className="object-cover rounded-md shadow-sm" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold truncate">{single.title}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(single.releaseDate).getFullYear()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            {single.isExplicit && <Explicit className="w-4 h-4" title="Explicite"/>}
                                                            <span className="text-xs font-mono w-12 text-right">
                                                                {Math.floor(single.duration / 60)}:{String(single.duration % 60).padStart(2, '0')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8">
                                            <Mic className="w-10 h-10 mx-auto mb-4" />
                                            <h3 className="font-semibold">Aucun single pour le moment</h3>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </TabsContent>
                            <TabsContent value="about" className="mt-6 p-4 bg-card/30 rounded-xl">
                                <p className="text-center text-muted-foreground leading-relaxed">
                                  {artist.bio}
                                </p>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
