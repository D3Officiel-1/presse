
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const faqItems = [
    {
        question: "Comment puis-je modifier mon profil ?",
        answer: "Vous pouvez modifier votre profil en accédant à la page des paramètres (via l'icône de roue dentée), puis en appuyant sur votre carte de profil. Vous y trouverez une option pour modifier vos informations."
    },
    {
        question: "Comment puis-je changer mon mot de passe ?",
        answer: "La connexion se fait via un lien magique ou une authentification sans mot de passe. Il n'y a donc pas de mot de passe à changer. Assurez-vous que l'accès à votre numéro de téléphone est sécurisé."
    },
    {
        question: "Comment archiver une discussion ?",
        answer: "Sur l'écran principal des discussions, faites un appui long (ou un clic droit) sur la discussion que vous souhaitez archiver. Un menu apparaîtra avec l'option 'Archiver'."
    },
    {
        question: "Où puis-je trouver les messages importants ?",
        answer: "Vous pouvez marquer un message comme important en effectuant un appui long dessus. Tous vos messages importants sont ensuite regroupés dans la section 'Messages importants' accessible depuis le menu principal."
    },
    {
        question: "L'application est-elle disponible sur d'autres plateformes ?",
        answer: "Actuellement, l'application est une Web App Progressive (PWA), ce qui signifie que vous pouvez l'installer' sur l'écran d'accueil de votre téléphone (Android et iOS) pour une expérience similaire à une application native."
    }
];

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

export default function HelpPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Centre d'aide</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                     <motion.div 
                        variants={FADE_UP_ANIMATION_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Comment pouvons-nous vous aider ?" className="h-12 pl-11 text-base rounded-full" />
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                            },
                        }}
                    >
                        <h2 className="text-lg font-semibold mb-4">Questions fréquentes</h2>
                        <Accordion type="single" collapsible className="w-full bg-card rounded-xl border">
                            {faqItems.map((item, index) => (
                                <motion.div key={index} variants={FADE_UP_ANIMATION_VARIANTS}>
                                    <AccordionItem value={`item-${index}`} className={index === faqItems.length - 1 ? 'border-b-0' : ''}>
                                        <AccordionTrigger className="p-4 text-left font-medium hover:no-underline">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 text-muted-foreground">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    </motion.div>

                    <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
                        <div className="text-center text-muted-foreground mt-12">
                            <p className="font-semibold">Vous n'avez pas trouvé de réponse ?</p>
                            <p className="text-sm">Contactez un administrateur pour obtenir de l'aide.</p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
