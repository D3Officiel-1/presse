'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc, Timestamp, collection, getDocs, writeBatch, query, where, limit } from 'firebase/firestore';
import type { Artist, Album, Single, Track, SpotifyArtist } from '@/lib/types';
import { getArtistDetails, getArtistTopTracks, getArtistAlbums } from '@/lib/spotify';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, RefreshCw, Star, Play, Music, Users, Verified, Disc } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Explicit } from '@/components/chat/chat-messages';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  }),
};

export default function ArtistPage() {
    const router = useRouter();
    const params = useParams();
    const artistId = params.artistId as string;
    const firestore = useFirestore();
    const { toast } = useToast();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [topTracks, setTopTracks] = useState<any[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [singles, setSingles] = useState<Single[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (!firestore || !artistId) return;

        const fetchArtistData = async () => {
            setLoading(true);
            const artistRef = doc(firestore, 'music', artistId);
            const artistSnap = await getDoc(artistRef);

            if (artistSnap.exists()) {
                const artistData = { id: artistSnap.id, ...artistSnap.data() } as Artist;
                setArtist(artistData);

                if (artistData.spotifyId) {
                    const tracksData = await getArtistTopTracks(artistData.spotifyId);
                    setTopTracks(tracksData.tracks);
                }
                
                // Fetch albums and singles from subcollections
                const albumsRef = collection(artistRef, 'albums');
                const singlesRef = collection(artistRef, 'singles');
                const [albumsSnap, singlesSnap] = await Promise.all([getDocs(albumsRef), getDocs(singlesRef)]);
                setAlbums(albumsSnap.docs.map(d => ({...d.data(), id: d.id} as Album)));
                setSingles(singlesSnap.docs.map(d => ({...d.data(), id: d.id} as Single)));

            } else {
                toast({ variant: 'destructive', title: 'Artiste non trouvé' });
                router.push('/chat/music');
            }
            setLoading(false);
        };

        fetchArtistData();
    }, [firestore, artistId, router, toast]);

    const handleSync = async () => {
        if (!artist?.spotifyId || !firestore) return;
        setIsSyncing(true);
        toast({ description: "Synchronisation de la discographie..." });
        try {
            const batch = writeBatch(firestore);
            const artistRef = doc(firestore, 'music', artistId);

            // Sync Albums and Singles
            const spotifyAlbumsData = await getArtistAlbums(artist.spotifyId);
            
            const albumPromises = spotifyAlbumsData.items.map(async (albumItem: any) => {
                const collectionName = albumItem.album_type === 'album' ? 'albums' : 'singles';
                
                // Check if album/single already exists by spotifyId
                const q = query(collection(artistRef, collectionName), where('spotifyId', '==', albumItem.id), limit(1));
                const existingDoc = await getDocs(q);

                const data = {
                    type: albumItem.album_type,
                    title: albumItem.name,
                    slug: albumItem.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    cover: albumItem.images?.[0]?.url || '',
                    releaseDate: albumItem.release_date,
                    tracksCount: albumItem.total_tracks,
                    isExplicit: false, // This info is not on album level
                    createdAt: Timestamp.now(),
                    artistId: artist.id,
                    artistName: artist.name,
                    spotifyId: albumItem.id,
                };
                
                if (existingDoc.empty) {
                    const newDocRef = doc(collection(artistRef, collectionName));
                    batch.set(newDocRef, data);
                } else {
                    // Optionally update existing doc
                    // batch.update(existingDoc.docs[0].ref, data);
                }
            });

            await Promise.all(albumPromises);
            await batch.commit();

            // Refetch local data
            const albumsRef = collection(artistRef, 'albums');
            const singlesRef = collection(artistRef, 'singles');
            const [albumsSnap, singlesSnap] = await Promise.all([getDocs(albumsRef), getDocs(singlesRef)]);
            setAlbums(albumsSnap.docs.map(d => ({...d.data(), id: d.id} as Album)));
            setSingles(singlesSnap.docs.map(d => ({...d.data(), id: d.id} as Single)));

            toast({ title: "Synchronisation terminée !", description: `${artist.name} est à jour.` });
        } catch (error) {
            console.error("Sync error:", error);
            toast({ variant: 'destructive', title: "Erreur de synchronisation" });
        } finally {
            setIsSyncing(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        );
    }
    
    if (!artist) return null;

    return (
        <div className="relative min-h-screen bg-black text-white">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-[40vh] overflow-hidden"
            >
                <div className="absolute inset-0">
                    <Image src={artist.bannerImage || artist.profileImage} alt={artist.name} layout="fill" objectFit="cover" className="blur-2xl scale-125 opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                </div>
                
                <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-black/30 backdrop-blur-sm">
                        <ArrowLeft size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleSync} disabled={isSyncing} className="size-9 rounded-full bg-black/30 backdrop-blur-sm">
                        {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw size={20} />}
                    </Button>
                </header>
                
                <div className="relative flex flex-col items-center justify-end h-full pb-6 text-center">
                    <motion.div
                        layoutId={`artist-avatar-${artist.id}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                    >
                        <Avatar className="w-32 h-32 border-4 border-black/50 shadow-2xl">
                            <AvatarImage src={artist.profileImage} />
                            <AvatarFallback>{artist.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-4xl font-extrabold tracking-tight mt-4"
                    >
                        {artist.name}
                    </motion.h1>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex items-center gap-4 mt-2 text-sm text-muted-foreground"
                    >
                       <div className="flex items-center gap-1.5">
                           <Users className="w-4 h-4"/>
                           <span>{artist.followersCount.toLocaleString('fr-FR')} fans</span>
                       </div>
                       {artist.verified && (
                           <>
                             <span>•</span>
                             <div className="flex items-center gap-1.5 text-blue-400">
                               <Verified className="w-4 h-4" />
                               <span>Vérifié</span>
                             </div>
                           </>
                       )}
                    </motion.div>
                </div>
            </motion.div>

            {/* Content Section */}
            <main className="p-4 md:p-6 space-y-8">
                {/* Top Tracks */}
                <motion.div
                    variants={FADE_UP_ANIMATION_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                >
                    <h2 className="text-2xl font-bold mb-4">Top Titres</h2>
                    <div className="space-y-2">
                        {topTracks.slice(0, 5).map((track, index) => (
                            <motion.div
                                key={track.id}
                                custom={index}
                                variants={FADE_UP_ANIMATION_VARIANTS}
                                className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                            >
                                <span className="w-6 text-center text-muted-foreground font-semibold">{index + 1}</span>
                                <Image src={track.album.images[0]?.url} alt={track.name} width={48} height={48} className="w-12 h-12 rounded-md object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate flex items-center gap-2">{track.name} {track.explicit && <Explicit className="w-4 h-4 text-muted-foreground"/>}</p>
                                    <p className="text-sm text-muted-foreground truncate">{track.artists.map((a: any) => a.name).join(', ')}</p>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <Play className="w-5 h-5"/>
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Discography */}
                 <motion.div
                    variants={FADE_UP_ANIMATION_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                >
                    <h2 className="text-2xl font-bold mb-4">Discographie</h2>
                     <Tabs defaultValue="albums">
                        <TabsList className="mb-4">
                            <TabsTrigger value="albums">Albums</TabsTrigger>
                            <TabsTrigger value="singles">Singles & EPs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="albums">
                            <AnimatePresence>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {albums.length > 0 ? albums.map((album, index) => (
                                    <motion.div key={album.id} custom={index} variants={FADE_UP_ANIMATION_VARIANTS}>
                                        <Link href={`/chat/music/album/${artist.id}/${album.id}`}>
                                            <div className="flex flex-col gap-2 group cursor-pointer">
                                                <Image src={album.cover} alt={album.title} width={200} height={200} className="w-full aspect-square rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105" />
                                                <div>
                                                    <p className="font-semibold truncate">{album.title}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(album.releaseDate).getFullYear()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )) : <p className="col-span-full text-muted-foreground">Aucun album trouvé.</p>}
                                </div>
                            </AnimatePresence>
                        </TabsContent>
                        <TabsContent value="singles">
                             <AnimatePresence>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {singles.length > 0 ? singles.map((single, index) => (
                                    <motion.div key={single.id} custom={index} variants={FADE_UP_ANIMATION_VARIANTS}>
                                        <Link href={`/chat/music/single/${artist.id}/${single.id}`}>
                                            <div className="flex flex-col gap-2 group cursor-pointer">
                                                <Image src={single.cover} alt={single.title} width={200} height={200} className="w-full aspect-square rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105" />
                                                <div>
                                                    <p className="font-semibold truncate">{single.title}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(single.releaseDate).getFullYear()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )) : <p className="col-span-full text-muted-foreground">Aucun single trouvé.</p>}
                                </div>
                            </AnimatePresence>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </main>
        </div>
    );

    