
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, RefreshCw, Smartphone, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { applyTheme, getThemeColors, defaultColors } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

function ThemePreview() {
    return (
        <div className="w-full space-y-4">
            <Card className="bg-card/80">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <Avatar className="w-10 h-10 border-2 border-background">
                                <AvatarImage src="https://avatar.vercel.sh/preview.png" alt="preview" />
                                <AvatarFallback>P</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base">Aperçu du Thème</CardTitle>
                                <CardDescription className="text-xs">Exemple de carte</CardDescription>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-foreground/50"></div>
                             <div className="w-2 h-2 rounded-full bg-foreground/50"></div>
                             <div className="w-2 h-2 rounded-full bg-foreground/50"></div>
                         </div>
                    </div>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Ceci est un exemple de texte pour montrer le contraste et la lisibilité.</p>
                    <div className="flex gap-2">
                        <Button size="sm">Bouton principal</Button>
                        <Button size="sm" variant="secondary">Secondaire</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function AppearancePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [themeColors, setThemeColors] = useState({ primary: defaultColors.primary, background: defaultColors.background });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setThemeColors(getThemeColors());
    }, []);

    useEffect(() => {
        if (isClient) {
            applyTheme(themeColors);
            localStorage.setItem('app-theme-colors', JSON.stringify(themeColors));
        }
    }, [themeColors, isClient]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setThemeColors(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setThemeColors(defaultColors);
        toast({ description: "Le thème a été réinitialisé." });
    };

    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Apparence</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                 <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                     >
                        <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-muted-foreground"/>
                                    Couleurs du Thème
                                </CardTitle>
                                <CardDescription>
                                    Personnalisez l'application pour qu'elle corresponde à votre style.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="primary">Couleur Principale</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-12 rounded-lg border-2 border-border overflow-hidden shadow-inner">
                                             <input
                                                type="color"
                                                id="primary"
                                                value={themeColors.primary}
                                                onChange={handleColorChange}
                                                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                            />
                                        </div>
                                        <div className="font-mono text-lg text-muted-foreground p-3 bg-muted rounded-md border">
                                            {isClient ? themeColors.primary.toUpperCase() : '...'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="background">Couleur de Fond</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-12 rounded-lg border-2 border-border overflow-hidden shadow-inner">
                                            <input
                                                type="color"
                                                id="background"
                                                value={themeColors.background}
                                                onChange={handleColorChange}
                                                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                            />
                                        </div>
                                         <div className="font-mono text-lg text-muted-foreground p-3 bg-muted rounded-md border">
                                            {isClient ? themeColors.background.toUpperCase() : '...'}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={handleReset} className='w-full'>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Réinitialiser les couleurs
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                    >
                         <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2"><Smartphone className="w-5 h-5"/> Aperçu en direct</h2>
                         <AnimatePresence>
                             <motion.div
                                 key={themeColors.primary + themeColors.background}
                                 initial={{ opacity: 0, scale: 0.98 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ duration: 0.3 }}
                             >
                                 <ThemePreview />
                             </motion.div>
                         </AnimatePresence>
                    </motion.div>

                 </div>
            </main>
        </div>
    );
}
