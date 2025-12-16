
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, FileText, GitBranch, Copyright, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

export default function AboutPage() {
    const router = useRouter();
    const appVersion = "1.0.0 (Mise à jour majeure)";

    return (
        <div className="relative flex flex-col h-screen w-full overflow-hidden">
             <video
                src="https://cdn.pixabay.com/video/2024/05/20/212953-944519999_large.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover -z-10 opacity-20"
            />
            <div className="absolute inset-0 bg-background/70 -z-10"/>

            <header className="p-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-background/50 backdrop-blur-sm">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">À propos</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center">
                 <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
                    variants={FADE_UP_ANIMATION_VARIANTS}
                    className="w-full max-w-md bg-card/50 backdrop-blur-lg border border-border/20 rounded-2xl p-8 shadow-2xl"
                >
                    <div className="mb-6">
                        <Image
                            src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
                            alt="Club de Presse Logo"
                            width={80}
                            height={80}
                            className="mx-auto"
                        />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight">
                        Club de Presse
                    </h2>

                    <p className="text-muted-foreground mt-2">
                        Version {appVersion}
                    </p>
                    
                    <p className="mt-6 text-foreground/80">
                        L'application de communication exclusive pour les membres du Club de Presse du Collège Saint-Exupéry de Port-Bouët Jean Folly.
                    </p>
                
                    <div
                        className="mt-8 space-y-3 text-sm"
                    >
                         <a href="#" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <Shield className="w-4 h-4" />
                            <span>Politique de confidentialité</span>
                        </a>
                         <a href="#" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <FileText className="w-4 h-4" />
                            <span>Conditions d'utilisation</span>
                        </a>
                    </div>
                </motion.div>
            </main>
            
            <footer className="p-4 text-center text-xs text-muted-foreground">
                <Copyright className="w-3 h-3 inline-block mr-1" /> 
                {new Date().getFullYear()} Club de Presse. Tous droits réservés.
            </footer>
        </div>
    );
}
