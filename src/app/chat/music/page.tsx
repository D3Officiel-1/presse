
'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Music, Loader2, ChevronRight, Mic, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { type Artist } from '@/lib/types';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

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
    const [artists, setArtists] = useState<Artist[]>([]);

    useEffect(() => {
        if (!firestore) return;

        const musicRef = collection(firestore, 'music');
        const q = query(
          musicRef,
          where('type', '==', 'artist'),
          orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const artistsData: Artist[] = [];
            snapshot.forEach(doc => {
                artistsData.push({ id: doc.id, ...doc.data() } as Artist);
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
    
    const filteredArtists = artists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

                {loading ? (
                     <div className="flex justify-center items-center h-60">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredArtists.length === 0 ? (
                    <div className="text-center text-muted-foreground p-10 mt-10">
                        <Music className="mx-auto w-12 h-12 mb-4" />
                        <h3 className="font-semibold text-lg">Aucun artiste trouvé</h3>
                        <p className="text-sm">Votre bibliothèque musicale est vide pour le moment.</p>
                    </div>
                ) : (
                    <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredArtists.map((artist, i) => (
                                <motion.div
                                    key={artist.id}
                                    custom={i}
                                    variants={FADE_UP_ANIMATION_VARIANTS}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    onClick={() => router.push(`/chat/music/${artist.slug}`)}
                                >
                                    <div className="group relative aspect-square cursor-pointer">
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
