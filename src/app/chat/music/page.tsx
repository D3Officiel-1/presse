
'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Music, Loader2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { searchTracks, getArtistTopTracks } from '@/lib/spotify';
import { useToast } from '@/hooks/use-toast';
import { type SpotifyTrack, type SpotifyArtist } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase/auth/use-user';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';


export default function MusicPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Unified results state
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [artists, setArtists] = useState<SpotifyArtist[]>([]);

    const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
    const [artistTopTracks, setArtistTopTracks] = useState<SpotifyTrack[]>([]);
    const [loadingArtistTracks, setLoadingArtistTracks] = useState(false);
    
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (currentUser && firestore) {
            const userRef = doc(firestore, 'users', currentUser.uid);
            getDoc(userRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().admin === true) {
                    setIsAdmin(true);
                }
            });
        }
    }, [currentUser, firestore]);
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;
        setLoading(true);
        setTracks([]);
        setArtists([]);
        setSelectedArtist(null);
        try {
            const spotifyResults = await searchTracks(searchTerm);
            setTracks(spotifyResults.tracks.items);
            setArtists(spotifyResults.artists.items);

        } catch (error) {
            console.error("Spotify search error:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur de recherche',
                description: 'Impossible de récupérer les données depuis Spotify.'
            });
        } finally {
            setLoading(false);
        }
    }

    const handleArtistClick = async (artist: SpotifyArtist) => {
        setSelectedArtist(artist);
        setLoadingArtistTracks(true);
        try {
            const topTracksResult = await getArtistTopTracks(artist.id);
            setArtistTopTracks(topTracksResult.tracks);
        } catch (error) {
            console.error("Error fetching artist top tracks:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: "Impossible de charger les titres de l'artiste."
            });
        } finally {
            setLoadingArtistTracks(false);
        }
    }
    
    const handleBackToSearch = () => {
        setSelectedArtist(null);
        setArtistTopTracks([]);
    }

    const handleTrackClick = (track: SpotifyTrack) => {
        const trackData = encodeURIComponent(JSON.stringify(track));
        router.push(`/chat/music/${track.id}?trackData=${trackData}`);
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const topArtist = artists.length > 0 ? artists[0] : null;

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="p-4 border-b flex items-center gap-4 bg-background/95 sticky top-0 z-20 shrink-0 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => selectedArtist ? handleBackToSearch() : router.back()} className="size-9">
                    <ArrowLeft size={20} />
                </Button>
                <div className='flex-1'>
                    <h1 className="font-semibold text-xl tracking-tight">
                        {selectedArtist ? selectedArtist.name : "Musique"}
                    </h1>
                     {selectedArtist && <p className="text-sm text-muted-foreground">Top des titres</p>}
                </div>
            </header>

            <main className="flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                {selectedArtist ? (
                    <motion.div
                        key="artist-view"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 md:p-6"
                    >
                         {loadingArtistTracks ? (
                            <div className="flex justify-center items-center h-60">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <motion.div 
                                className="space-y-2"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {artistTopTracks.map((track) => (
                                    <motion.div
                                        key={track.id}
                                        variants={itemVariants}
                                        className="flex items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                                        onClick={() => handleTrackClick(track)}
                                    >
                                        <Image 
                                            src={track.album.images[0]?.url || 'https://picsum.photos/seed/musict/100/100'} 
                                            alt={track.name} 
                                            width={40} 
                                            height={40} 
                                            className="rounded-md" 
                                        />
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="font-semibold truncate">{track.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {track.artists.map(a => a.name).join(', ')}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="search-view" 
                        className="p-4 md:p-6"
                        initial={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Que souhaitez-vous écouter ?"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-muted/50 pl-11 h-12 rounded-full text-base"
                                />
                            </div>
                        </form>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-60">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    {topArtist && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleArtistClick(topArtist)}
                                            className="bg-card p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-muted"
                                        >
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={topArtist.images?.[0]?.url} alt={topArtist.name} />
                                                <AvatarFallback>{topArtist.name.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground">Artiste</p>
                                                <p className="font-bold text-lg">{topArtist.name}</p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-muted-foreground" />
                                        </motion.div>
                                    )}

                                    {tracks.length > 0 && (
                                        <motion.div 
                                            className="space-y-2"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            {tracks.map((track) => (
                                                <motion.div
                                                    key={track.id}
                                                    variants={itemVariants}
                                                    className="flex items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => handleTrackClick(track)}
                                                >
                                                    <Image 
                                                        src={track.album.images[0]?.url || 'https://picsum.photos/seed/musict/100/100'} 
                                                        alt={track.name} 
                                                        width={50} 
                                                        height={50} 
                                                        className="rounded-md" 
                                                    />
                                                    <div className="ml-4 flex-1 min-w-0">
                                                        <p className="font-semibold truncate">{track.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {track.artists.map(a => a.name).join(', ')}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                    
                                    {!topArtist && tracks.length === 0 && !loading && (
                                        <div className="text-center text-muted-foreground p-10 mt-10">
                                            <Music className="mx-auto w-12 h-12 mb-4" />
                                            <h3 className="font-semibold text-lg">Écoutez ce qui vous plaît</h3>
                                            <p className="text-sm">Recherchez des millions de chansons et d'artistes.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </main>
        </div>
    );
}
