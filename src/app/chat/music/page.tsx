
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Music, Loader2, ChevronRight, Mic, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { type Artist, type SpotifyArtist } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, orderBy, Timestamp, setDoc, doc, addDoc, getDocs } from 'firebase/firestore';
import { searchTracks, getArtistDetails } from '@/lib/spotify';
import { useDebounce } from 'use-debounce';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 100,
      damping: 20
    },
  }),
};


export default function MusicPage() {
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isImporting, setIsImporting] = useState<string | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [spotifyArtists, setSpotifyArtists] = useState<Artist[]>([]);

    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    // Fetch artists from Firestore
    useEffect(() => {
        if (!firestore) return;
        setLoading(true);

        const musicRef = collection(firestore, 'music');
        const q = query(
          musicRef,
          where('type', '==', 'artist'),
          orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const artistsData: Artist[] = [];
            snapshot.forEach(doc => {
                artistsData.push({ id: doc.id, source: 'firestore', ...doc.data() } as Artist);
            });
            setArtists(artistsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching artists:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: "Impossible de charger les artistes."
            });
            setLoading(false);
        });

        return () => unsubscribe();

    }, [firestore, toast]);
    
     // Fetch artists from Spotify when search term changes
    useEffect(() => {
        const handleSearch = async () => {
            if (debouncedSearchTerm.length < 2) {
                setSpotifyArtists([]);
                return;
            }

            // Don't search spotify if local results are found
            const localResults = artists.filter(artist => 
                artist.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
            if(localResults.length > 0) return;

            setLoading(true);
            try {
                const results = await searchTracks(debouncedSearchTerm);
                const spotifyResultArtists: Artist[] = results.artists.items.map((artist: SpotifyArtist) => ({
                    id: artist.id,
                    type: 'artist',
                    name: artist.name,
                    slug: artist.id,
                    verified: false, 
                    country: '', 
                    genres: artist.genres,
                    profileImage: artist.images[0]?.url || 'https://i.postimg.cc/fbtSZFWz/icon-256x256.png',
                    bannerImage: artist.images[0]?.url || 'https://i.postimg.cc/fbtSZFWz/icon-256x256.png',
                    bio: '',
                    followersCount: artist.followers.total,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    source: 'spotify',
                    spotifyId: artist.id,
                }));
                setSpotifyArtists(spotifyResultArtists);
            } catch (error) {
                console.error('Error searching Spotify:', error);
                toast({
                    variant: "destructive",
                    title: "Erreur Spotify",
                    description: "Impossible de rechercher des artistes sur Spotify.",
                });
            } finally {
                setLoading(false);
            }
        };

        handleSearch();
    }, [debouncedSearchTerm, artists, toast]);

    const handleArtistClick = async (artist: Artist) => {
        if (artist.source === 'firestore') {
            router.push(`/chat/music/artist/${artist.slug}`);
        } else if (artist.source === 'spotify' && firestore) {
            setIsImporting(artist.id);
            toast({ title: "Ajout de l'artiste...", description: `Importation de ${artist.name} dans votre bibliothèque.` });

            try {
                // Check if artist already exists by spotifyId
                const q = query(collection(firestore, 'music'), where('spotifyId', '==', artist.spotifyId));
                const existingDocs = await getDocs(q);
                
                if (!existingDocs.empty) {
                    const existingArtist = existingDocs.docs[0].data() as Artist;
                    toast({ description: `${artist.name} est déjà dans votre bibliothèque.` });
                    router.push(`/chat/music/artist/${existingArtist.slug}`);
                    return;
                }

                // If not, fetch details and add
                const spotifyDetails = await getArtistDetails(artist.id);
                
                const newArtistSlug = artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                const newArtistData: Omit<Artist, 'id' | 'source'> = {
                    type: 'artist',
                    name: spotifyDetails.name,
                    slug: newArtistSlug,
                    spotifyId: spotifyDetails.id,
                    verified: spotifyDetails.followers.total > 100000, // Example logic for verified
                    country: '', // Not provided by this endpoint
                    genres: spotifyDetails.genres,
                    profileImage: spotifyDetails.images[0]?.url || artist.profileImage,
                    bannerImage: spotifyDetails.images[1]?.url || spotifyDetails.images[0]?.url || artist.bannerImage,
                    bio: '',
                    followersCount: spotifyDetails.followers.total,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };

                const newArtistRef = await addDoc(collection(firestore, "music"), newArtistData);
                
                toast({ title: "Artiste Ajouté!", description: `${artist.name} est maintenant dans votre bibliothèque.` });
                router.push(`/chat/music/artist/${newArtistSlug}`);

            } catch (error) {
                console.error("Error importing artist:", error);
                toast({ variant: "destructive", title: "Erreur d'importation", description: `Impossible d'ajouter ${artist.name}.` });
            } finally {
                setIsImporting(null);
            }
        }
    };
    
    const filteredArtists = artists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const displayedArtists = searchTerm ? [...filteredArtists, ...spotifyArtists.filter(sa => !filteredArtists.some(fa => fa.name === sa.name))] : artists;

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
             <div className="absolute inset-0 bg-gradient-to-br from-background via-black to-background -z-10 animate-gradient-xy"/>

            <header className="p-4 flex items-center gap-4 bg-background/30 backdrop-blur-xl sticky top-0 z-10 shrink-0 border-b border-white/5">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-white/5 hover:bg-white/10">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-bold text-xl tracking-tight">Musique</h1>
            </header>

            <main className="flex-1 overflow-auto">
                <div className="p-4 md:p-6 sticky top-0 bg-background/30 backdrop-blur-xl z-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un artiste ou un genre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card/50 pl-12 h-12 rounded-full text-base border-white/10 shadow-lg"
                        />
                    </div>
                </div>

                {loading && searchTerm === '' ? (
                     <div className="flex justify-center items-center h-60">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : displayedArtists.length === 0 ? (
                    <div className="text-center text-muted-foreground p-10 mt-10">
                        <Music className="mx-auto w-12 h-12 mb-4" />
                        <h3 className="font-semibold text-lg">Aucun artiste trouvé</h3>
                        <p className="text-sm">{searchTerm ? "Essayez une autre recherche." : "Votre bibliothèque est vide."}</p>
                    </div>
                ) : (
                    <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {displayedArtists.map((artist, i) => (
                                <motion.div
                                    key={artist.id}
                                    custom={i}
                                    variants={FADE_UP_ANIMATION_VARIANTS}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    onClick={() => handleArtistClick(artist)}
                                >
                                    <div className="group relative aspect-square cursor-pointer">
                                        {isImporting === artist.id && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl z-20">
                                                <Loader2 className="w-8 h-8 animate-spin text-white"/>
                                            </div>
                                        )}
                                        <Image 
                                            src={artist.profileImage} 
                                            alt={artist.name}
                                            fill
                                            className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl" />
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <h3 className="font-bold text-lg drop-shadow-md">{artist.name}</h3>
                                            <div className="flex items-center gap-2 text-xs opacity-80">
                                                <Mic className="w-3 h-3" />
                                                <span>{artist.genres[0]}</span>
                                            </div>
                                        </div>
                                         {artist.verified && <Star className="absolute top-3 right-3 w-5 h-5 fill-yellow-400 text-yellow-400" />}
                                         {artist.source === 'spotify' && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                Spotify
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
