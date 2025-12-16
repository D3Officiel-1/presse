
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

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Politique de confidentialité</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <motion.div 
                        variants={FADE_UP_ANIMATION_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        className="prose prose-invert max-w-none
                                   prose-headings:text-foreground prose-headings:font-semibold
                                   prose-p:text-muted-foreground
                                   prose-h3:mt-8 prose-h3:mb-2 prose-h3:text-lg
                                   prose-p:leading-relaxed"
                    >
                        <h2>Politique de Confidentialité</h2>
                        <p>Dernière mise à jour : 27 Juillet 2024</p>
                        
                        <h3>1. Introduction</h3>
                        <p>
                          Bienvenue sur l'application du Club de Presse. Nous nous engageons à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
                        </p>

                        <h3>2. Informations que nous collectons</h3>
                        <p>
                          Nous collectons les informations que vous nous fournissez lors de votre inscription, telles que votre nom, votre classe et votre numéro de téléphone. Nous collectons également les données que vous générez en utilisant l'application, comme les messages et les médias partagés.
                        </p>

                        <h3>3. Utilisation de vos informations</h3>
                        <p>
                          Vos informations sont utilisées pour fournir et améliorer les fonctionnalités de l'application, pour vous identifier et pour assurer la sécurité de la communauté. Nous n'utilisons pas vos données à des fins publicitaires.
                        </p>

                        <h3>4. Partage d'informations</h3>
                        <p>
                          Nous ne partageons pas vos informations personnelles avec des tiers, sauf si cela est requis par la loi. Les informations de votre profil sont visibles par les autres membres du club au sein de l'application.
                        </p>

                        <h3>5. Sécurité</h3>
                        <p>
                          Nous prenons des mesures raisonnables pour protéger vos informations contre l'accès non autorisé, la modification ou la destruction.
                        </p>
                        
                        <h3>6. Contact</h3>
                        <p>
                          Pour toute question concernant cette politique de confidentialité, veuillez contacter un administrateur du club.
                        </p>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
