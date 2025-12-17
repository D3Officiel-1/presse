
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import type { Artist } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MoreVertical, Play, Star, UserPlus, Music, ListMusic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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

    const [artist, setArtist] = useState<Artist | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !slug) return;

        const artistsRef = collection(firestore, 'music');
        const q = query(
            artistsRef,
            where('type', '==', 'artist'),
            where('slug', '==', slug),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setArtist({ id: doc.id, ...doc.data() } as Artist);
            } else {
                console.error("No artist found with that slug.");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching artist:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, slug]);


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
                         <Tabs defaultValue="tracks" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="tracks"><ListMusic className="w-4 h-4 mr-2"/>Titres</TabsTrigger>
                                <TabsTrigger value="about"><UserPlus className="w-4 h-4 mr-2"/>À propos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tracks" className="mt-6">
                                <div className="text-center text-muted-foreground p-8">
                                    <Music className="w-10 h-10 mx-auto mb-4" />
                                    <h3 className="font-semibold">Aucun titre pour le moment</h3>
                                    <p className="text-sm">Les titres de cet artiste apparaîtront bientôt ici.</p>
                                </div>
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

