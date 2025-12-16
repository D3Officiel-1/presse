
'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Crop, RotateCw, Send, Text, Brush, X } from 'lucide-react';
import { ImageCropper } from '@/components/chat/image-cropper';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

function EditorComponent() {
    const router = useRouter();
    const { toast } = useToast();

    const [mediaSrc, setMediaSrc] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isCropperOpen, setIsCropperOpen] = useState(false);

    useEffect(() => {
        const mediaData = sessionStorage.getItem('media-to-edit');
        const typeData = sessionStorage.getItem('media-type-to-edit');
        
        if (mediaData && typeData) {
            setMediaSrc(mediaData);
            setMediaType(typeData as 'image' | 'video');
            setIsLoading(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Erreur de chargement',
                description: 'Impossible de charger le média à éditer.'
            });
            router.back();
        }
    }, [router, toast]);

    const handleCroppedImage = (imageBlob: Blob | null) => {
        setIsCropperOpen(false);
        if (imageBlob) {
            const url = URL.createObjectURL(imageBlob);
            setMediaSrc(url);
            toast({ description: "L'image a été recadrée." });
        }
    };
    
    const cleanupSessionStorage = () => {
        sessionStorage.removeItem('media-to-edit');
        sessionStorage.removeItem('media-type-to-edit');
    };
    
    const handleBack = () => {
        cleanupSessionStorage();
        router.back();
    };

    const handleSend = () => {
        cleanupSessionStorage();
        toast({
            title: "Fonctionnalité à venir",
            description: "L'envoi de médias sera bientôt disponible."
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        );
    }
    
    const editorActions = [
        { icon: Crop, label: 'Recadrer', action: () => mediaType === 'image' && mediaSrc && setIsCropperOpen(true) },
        { icon: Text, label: 'Texte', action: () => {} },
        { icon: Brush, label: 'Dessiner', action: () => {} },
        { icon: RotateCw, label: 'Pivoter', action: () => {} },
    ];


    return (
        <div className="relative flex flex-col h-screen w-full bg-black text-white overflow-hidden">
            {mediaType === 'image' && mediaSrc && (
                <ImageCropper
                    imageSrc={mediaSrc}
                    open={isCropperOpen}
                    onOpenChange={setIsCropperOpen}
                    onCropped={handleCroppedImage}
                />
            )}

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50">
                    <X />
                </Button>
                <div className="flex items-center gap-2">
                    {editorActions.map(action => (
                         <Button key={action.label} variant="ghost" size="icon" onClick={action.action} className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50">
                            <action.icon className="w-5 h-5" />
                        </Button>
                    ))}
                </div>
            </header>

            {/* Media Preview */}
            <div className="flex-1 flex items-center justify-center p-16">
                {mediaSrc && mediaType === 'image' && (
                    <Image
                        src={mediaSrc}
                        alt="Aperçu"
                        layout="fill"
                        objectFit="contain"
                        className="max-w-full max-h-full"
                    />
                )}
                 {mediaSrc && mediaType === 'video' && (
                    <video
                        src={mediaSrc}
                        controls
                        className="max-w-full max-h-full"
                    />
                )}
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex items-center justify-end">
                     <Button size="lg" className="rounded-full h-14 w-14 p-0" onClick={handleSend}>
                        <Send className="w-6 h-6"/>
                     </Button>
                </div>
            </footer>
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        }>
            <EditorComponent />
        </Suspense>
    );
}
