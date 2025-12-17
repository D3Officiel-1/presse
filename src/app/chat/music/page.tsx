
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Music, Loader2, ChevronRight, Mic, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, orderBy, Timestamp, setDoc, doc, addDoc, getDocs } from 'firebase/firestore';
import { searchTracks, getArtistDetails } from '@/lib/spotify';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

type SearchResult = {
    artists: { items: any[] };
    tracks: { items: any[] };
};

export default function MusicPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [localArtists, setLocalArtists] = useState<any[]>([]);
    const [loadingLocalArtists, setLoadingLocalArtists] = useState(true);
    const [importingArtistId, setImportingArtistId] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore) return;
        setLoadingLocalArtists(true);
        const artistsQuery = query(collection(firestore, 'music'), orderBy('name'));
        const unsubscribe = onSnapshot(artistsQuery, (snapshot) => {
            const artists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLocalArtists(artists);
            setLoadingLocalArtists(false);
        });
        return () => unsubscribe();
    }, [firestore]);

    useEffect(() => {
        const handleSearch = async () => {
            if (debouncedSearchTerm.trim().length > 2) {
                setIsSearching(true);
                try {
                    const results = await searchTracks(debouncedSearchTerm);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Error searching Spotify:", error);
                    toast({ variant: "destructive", title: "Erreur de recherche", description: "Impossible de contacter Spotify." });
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults(null);
            }
        };
        handleSearch();
    }, [debouncedSearchTerm, toast]);

    const handleArtistClick = async (artist: any) => {
        if (artist.source === 'firestore') {
            router.push(`/chat/music/artist/${artist.id}`);
        } else {
            if (!firestore) return;
            setImportingArtistId(artist.id);
            try {
                // Check if artist already exists by spotifyId
                const q = query(collection(firestore, 'music'), where('spotifyId', '==', artist.id));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const existingArtist = querySnapshot.docs[0];
                    toast({ description: `${artist.name} est déjà dans votre bibliothèque.` });
                    router.push(`/chat/music/artist/${existingArtist.id}`);
                    return;
                }

                // If not, fetch details and import
                const artistDetails = await getArtistDetails(artist.id);
                
                const newArtistData = {
                    type: 'artist',
                    name: artistDetails.name,
                    slug: artistDetails.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    verified: true, // Assuming verification from Spotify
                    country: 'CI', // Default or from API if available
                    genres: artistDetails.genres,
                    profileImage: artistDetails.images?.[0]?.url || '',
                    bannerImage: artistDetails.images?.[1]?.url || artistDetails.images?.[0]?.url || '',
                    bio: `Artiste découvert sur Spotify.`,
                    followersCount: artistDetails.followers.total,
                    spotifyId: artistDetails.id,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };

                const newArtistRef = await addDoc(collection(firestore, 'music'), newArtistData);
                
                toast({ title: "Artiste ajouté !", description: `${artistDetails.name} a été ajouté à votre bibliothèque.` });
                router.push(`/chat/music/artist/${newArtistRef.id}`);

            } catch (error) {
                console.error("Error importing artist:", error);
                toast({ variant: 'destructive', title: "Erreur d'importation", description: "Impossible d'ajouter cet artiste." });
            } finally {
                setImportingArtistId(null);
            }
        }
    };
    
    const handleTrackClick = (track: any) => {
        toast({
            title: `Lecture de ${track.name}`,
            description: `Par ${track.artists.map((a: any) => a.name).join(', ')}`,
        });
        // Future: router.push(`/music/player/${track.id}`);
    }

    const renderArtistItem = (artist: any, source: 'firestore' | 'spotify') => (
        <motion.div
            key={artist.id}
            variants={FADE_UP_ANIMATION_VARIANTS}
            onClick={() => handleArtistClick({ ...artist, source })}
            className="flex flex-col items-center gap-3 text-center cursor-pointer group"
        >
             <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-transparent group-hover:border-primary transition-all duration-300">
                    <AvatarImage src={artist.images?.[0]?.url || artist.profileImage} alt={artist.name} />
                    <AvatarFallback>{artist.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                {importingArtistId === artist.id && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}
            </div>
            <span className="text-sm font-semibold truncate w-full">{artist.name}</span>
        </motion.div>
    );

    const renderTrackItem = (track: any) => (
         <motion.div
            key={track.id}
            variants={FADE_UP_ANIMATION_VARIANTS}
            onClick={() => handleTrackClick(track)}
            className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
        >
            <Image
                src={track.album.images?.[0]?.url || ''}
                alt={track.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-md object-cover"
            />
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{track.name}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artists.map((a: any) => a.name).join(', ')}</p>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
                {Math.floor(track.duration_ms / 60000)}:{Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
            </p>
        </motion.div>
    );

    return (
        <div className="relative flex flex-col h-full bg-background text-foreground overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-black to-background -z-10 animate-gradient-xy"/>
            
            <header className="p-4 flex items-center justify-between sticky top-0 z-20 shrink-0 bg-background/30 backdrop-blur-xl border-b border-white/5">
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-white/5 hover:bg-white/10">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="font-bold text-xl tracking-tight">Musique</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-6 space-y-8">
                    {/* Search Bar */}
                    <motion.div initial="hidden" animate="visible" variants={FADE_UP_ANIMATION_VARIANTS} className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                         <Input
                            placeholder="Rechercher des artistes, titres..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card/30 backdrop-blur-md border-white/10 shadow-lg w-full pl-12 h-14 rounded-full text-lg"
                        />
                        {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {searchResults ? (
                            <motion.div
                                key="search-results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                {/* Top Result */}
                                {searchResults.artists?.items?.[0] && (
                                    <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
                                        <h2 className="text-xl font-bold mb-4">Top Résultat</h2>
                                        <div 
                                          className="bg-card/30 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 cursor-pointer"
                                          onClick={() => handleArtistClick({ ...searchResults.artists.items[0], source: 'spotify' })}
                                        >
                                            <div className="relative">
                                                <Avatar className="w-28 h-28">
                                                    <AvatarImage src={searchResults.artists.items[0].images?.[0]?.url} />
                                                    <AvatarFallback>{searchResults.artists.items[0].name.substring(0, 1)}</AvatarFallback>
                                                </Avatar>
                                                {importingArtistId === searchResults.artists.items[0].id && (
                                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-3xl font-bold">{searchResults.artists.items[0].name}</h3>
                                                <span className="text-sm font-semibold uppercase tracking-wider bg-white/10 px-2 py-1 rounded">Artiste</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* Tracks */}
                                {searchResults.tracks?.items?.length > 0 && (
                                    <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
                                        <h2 className="text-xl font-bold mb-4">Titres</h2>
                                        <div className="space-y-2">
                                            {searchResults.tracks.items.slice(0, 5).map(renderTrackItem)}
                                        </div>
                                    </motion.div>
                                )}

                            </motion.div>
                        ) : (
                            <motion.div
                                key="local-artists"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-bold">Vos Artistes</h2>
                                {loadingLocalArtists ? (
                                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex flex-col items-center gap-3">
                                                <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
                                                <div className="w-20 h-4 rounded bg-muted animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                ) : localArtists.length > 0 ? (
                                     <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                                        {localArtists.map((artist) => renderArtistItem(artist, 'firestore'))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-10">
                                        <Music className="mx-auto w-12 h-12 mb-4" />
                                        <h3 className="font-semibold text-lg">Bibliothèque vide</h3>
                                        <p className="text-sm">Recherchez pour ajouter vos artistes favoris.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
