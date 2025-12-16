
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, FileText, GitBranch, Copyright } from 'lucide-react';
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
        <div className="flex flex-col h-screen bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">À propos</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center">
                 <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
                    className="max-w-md mx-auto"
                >
                    <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mb-8">
                        <Image
                            src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
                            alt="Club de Presse Logo"
                            width={120}
                            height={120}
                            className="mx-auto"
                        />
                    </motion.div>

                    <motion.h2 variants={FADE_UP_ANIMATION_VARIANTS} className="text-3xl font-bold tracking-tight">
                        Club de Presse
                    </motion.h2>

                    <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-muted-foreground mt-2">
                        Version {appVersion}
                    </motion.p>
                    
                    <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="mt-6 text-foreground/80">
                        L'application de communication exclusive pour les membres du Club de Presse du Collège Saint-Exupéry de Port-Bouët Jean Folly.
                    </motion.p>
                
                    <motion.div
                        variants={FADE_UP_ANIMATION_VARIANTS}
                        className="mt-8 space-y-3 text-sm text-muted-foreground"
                    >
                         <a href="#" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
                            <FileText className="w-4 h-4" />
                            <span>Licences</span>
                        </a>
                         <a href="#" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
                            <GitBranch className="w-4 h-4" />
                            <span>Code Source</span>
                        </a>
                    </motion.div>
                </motion.div>
            </main>
            
            <footer className="p-4 text-center text-xs text-muted-foreground">
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <Copyright className="w-3 h-3 inline-block mr-1" /> 
                    {new Date().getFullYear()} Club de Presse - Collège Saint-Exupéry de Port-Bouët Jean Folly. Tous droits réservés.
                </motion.div>
            </footer>
        </div>
    );
}
