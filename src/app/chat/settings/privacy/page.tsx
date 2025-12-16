
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
                        className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground"
                    >
                        <h2>Politique de Confidentialité</h2>
                        <p>Dernière mise à jour : 27 Juillet 2024</p>
                        
                        <h3>1. Collecte des informations</h3>
                        <p>
                          Nous collectons les informations que vous fournissez lors de votre inscription : nom, classe, et numéro de téléphone. Ces informations sont utilisées uniquement pour l'identification au sein de l'application et la communication liée au Club de Presse.
                        </p>

                        <h3>2. Utilisation des informations</h3>
                        <p>
                          Vos informations personnelles ne sont utilisées que pour le fonctionnement interne de l'application. Elles ne sont ni vendues, ni partagées avec des tiers. Votre numéro de téléphone peut être utilisé par les administrateurs pour des communications importantes.
                        </p>

                        <h3>3. Sécurité</h3>
                        <p>
                          Nous mettons en œuvre des mesures de sécurité pour protéger vos informations personnelles. L'accès à l'application est contrôlé et limité aux membres vérifiés du Club de Presse.
                        </p>

                        <h3>4. Vos droits</h3>
                        <p>
                          Vous pouvez à tout moment demander la modification ou la suppression de vos informations personnelles en contactant un administrateur du Club.
                        </p>

                        <h3>5. Modifications de la politique</h3>
                        <p>
                           Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront effectives dès leur publication dans l'application.
                        </p>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
