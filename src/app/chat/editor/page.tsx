
'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Crop, RotateCw, Send, Type, Brush, X, Check, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import * as htmlToImage from 'html-to-image';


function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}


function EditorComponent() {
    const router = useRouter();
    const { toast } = useToast();

    const [mediaSrc, setMediaSrc] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState<CropType>();
    const [completedCrop, setCompletedCrop] = useState<CropType>();
    const [isProcessingCrop, setIsProcessingCrop] = useState(false);
    const [rotation, setRotation] = useState(0);
    const imgRef = useRef<HTMLImageElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // States for text editing
    const [isAddingText, setIsAddingText] = useState(false);
    const [textInputValue, setTextInputValue] = useState('');
    const [overlayText, setOverlayText] = useState<string | null>(null);

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
    
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }

    const handleConfirmCrop = async () => {
        const image = imgRef.current;
        if (!image || !completedCrop) {
          throw new Error('Les détails du recadrage ne sont pas disponibles');
        }

        setIsProcessingCrop(true);
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Pas de contexte 2d');
        }

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.drawImage(
            image,
            cropX,
            cropY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        );
        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaSrc(reader.result as string);
                    toast({ description: "L'image a été recadrée." });
                };
                reader.readAsDataURL(blob);
            }
            setIsProcessingCrop(false);
            setIsCropping(false);
        }, 'image/webp', 0.9);
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
    
    const handleRotate = () => {
      setRotation(prev => (prev + 90) % 360);
    }
    
    const startCropping = () => {
        if (mediaType === 'image' && mediaSrc) {
            setIsCropping(true);
        }
    }
    
    const handleAddText = async () => {
        if (textInputValue.trim() === '' || !imageContainerRef.current) return;
        
        setOverlayText(textInputValue);
        setIsAddingText(false);
        setTextInputValue('');
        
        // Wait for state to update and text to render
        setTimeout(async () => {
            if (imageContainerRef.current) {
                try {
                    const dataUrl = await htmlToImage.toPng(imageContainerRef.current);
                    setMediaSrc(dataUrl);
                } catch (error) {
                    console.error('oops, something went wrong!', error);
                    toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter le texte.'});
                } finally {
                    setOverlayText(null); // Clean up overlay text after capture
                }
            }
        }, 100);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        );
    }
    
    const editorActions = [
        { icon: Crop, label: 'Recadrer', action: startCropping },
        { icon: Smile, label: 'Stickers', action: () => {} },
        { icon: Type, label: 'Texte', action: () => setIsAddingText(true) },
        { icon: Brush, label: 'Dessiner', action: () => {} },
        { icon: RotateCw, label: 'Pivoter', action: handleRotate },
    ];


    return (
        <div className="relative flex flex-col h-screen w-full bg-black text-white overflow-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                {isCropping ? (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => setIsCropping(false)} className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50">
                            <X />
                        </Button>
                        <Button onClick={handleConfirmCrop} disabled={isProcessingCrop}>
                            {isProcessingCrop ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Confirmer
                        </Button>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </header>

            {/* Media Preview */}
            <div className="flex-1 flex items-center justify-center p-16">
                 <div ref={imageContainerRef} className="relative w-fit h-fit">
                    {mediaSrc && mediaType === 'image' && !isCropping && (
                        <Image
                            src={mediaSrc}
                            alt="Aperçu"
                            width={500}
                            height={500}
                            className="max-w-full max-h-[70vh] object-contain"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        />
                    )}
                    {mediaSrc && mediaType === 'image' && isCropping && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img
                                ref={imgRef}
                                alt="Recadrer le média"
                                src={mediaSrc}
                                style={{ transform: `rotate(${rotation}deg)` }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    )}
                    {mediaSrc && mediaType === 'video' && (
                        <video
                            src={mediaSrc}
                            controls
                            className="max-w-full max-h-full"
                        />
                    )}
                    {overlayText && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span 
                                className="text-white text-4xl font-bold text-center"
                                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}
                            >
                                {overlayText}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Text Input Dialog */}
             <Dialog open={isAddingText} onOpenChange={setIsAddingText}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter du texte</DialogTitle>
                        <DialogDescription>Saisissez le texte à ajouter sur votre image.</DialogDescription>
                    </DialogHeader>
                    <Input 
                        value={textInputValue}
                        onChange={(e) => setTextInputValue(e.target.value)}
                        placeholder="Votre texte ici..."
                        autoFocus
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddingText(false)}>Annuler</Button>
                        <Button onClick={handleAddText}>Ajouter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
