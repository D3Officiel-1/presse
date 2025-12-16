
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

export default function TermsOfServicePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Conditions d'utilisation</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <motion.div 
                        variants={FADE_UP_ANIMATION_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground"
                    >
                        <h2>Conditions d'Utilisation</h2>
                        <p>Dernière mise à jour : 27 Juillet 2024</p>
                        
                        <h3>1. Acceptation des conditions</h3>
                        <p>
                          En utilisant l'application du Club de Presse, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'êtes pas d'accord, n'utilisez pas l'application.
                        </p>

                        <h3>2. Utilisation de l'Application</h3>
                        <p>
                          Cette application est réservée exclusivement aux membres du Club de Presse. Vous vous engagez à ne pas utiliser l'application à des fins illégales ou non autorisées.
                        </p>

                        <h3>3. Contenu utilisateur</h3>
                        <p>
                          Vous êtes responsable de tout le contenu que vous publiez. Les propos haineux, le harcèlement, ou tout autre contenu jugé inapproprié par les administrateurs est strictement interdit et pourra entraîner votre exclusion de l'application.
                        </p>

                        <h3>4. Conduite</h3>
                        <p>
                          Le respect mutuel est primordial. Tout comportement irrespectueux envers les autres membres ne sera pas toléré.
                        </p>

                        <h3>5. Modifications des conditions</h3>
                        <p>
                           Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront effectives dès leur publication dans l'application.
                        </p>
                        
                        <h3>6. Résiliation</h3>
                        <p>
                          Les administrateurs peuvent suspendre ou résilier votre accès à l'application à tout moment, sans préavis, pour toute violation de ces conditions.
                        </p>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
