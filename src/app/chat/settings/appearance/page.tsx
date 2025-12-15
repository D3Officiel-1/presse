'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { applyTheme, getThemeColors, defaultColors } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';

export default function AppearancePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [themeColors, setThemeColors] = useState({ primary: '', background: '' });

    useEffect(() => {
        setThemeColors(getThemeColors());
    }, []);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const newColors = { ...themeColors, [id]: value };
        setThemeColors(newColors);
        applyTheme(newColors);
        localStorage.setItem('app-theme-colors', JSON.stringify(newColors));
    };

    const handleReset = () => {
        setThemeColors(defaultColors);
        applyTheme(defaultColors);
        localStorage.setItem('app-theme-colors', JSON.stringify(defaultColors));
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
                <div className="max-w-2xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-muted-foreground"/>
                                Couleurs du thème
                            </CardTitle>
                            <CardDescription>
                                Personnalisez les couleurs de l'application pour qu'elles correspondent à votre style.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="primary">Couleur principale</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-10 rounded-md border overflow-hidden">
                                         <input
                                            type="color"
                                            id="primary"
                                            value={themeColors.primary}
                                            onChange={handleColorChange}
                                            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                    <span className="font-mono text-muted-foreground">{themeColors.primary.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="background">Couleur de fond</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-10 rounded-md border overflow-hidden">
                                        <input
                                            type="color"
                                            id="background"
                                            value={themeColors.background}
                                            onChange={handleColorChange}
                                            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                    <span className="font-mono text-muted-foreground">{themeColors.background.toUpperCase()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réinitialiser les couleurs
                    </Button>
                </div>
            </main>
        </div>
    );
}