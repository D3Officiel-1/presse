
'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Crop, RotateCw, Send, Type, Brush, X, Check, Smile, AlignLeft, AlignCenter, AlignRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as htmlToImage from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


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

const fontStyles = [
    { label: 'Normal', class: 'font-sans' },
    { label: 'Impact', class: 'font-headline' },
    { label: 'Manuscrit', class: 'font-serif' },
    { label: 'Cursive', class: 'font-serif italic' },
    { label: 'Machine', class: 'font-mono' },
    { label: 'Code', class: 'font-code' },
    { label: 'Arial', class: 'font-arial' },
    { label: 'Comic', class: 'font-comic' },
    { label: 'Garamond', class: 'font-garamond' },
    { label: 'Lobster', class: 'font-lobster' },
    { label: 'Pacifico', class: 'font-pacifico' },
    { label: 'Poppins', class: 'font-poppins' },
    { label: 'Roboto', class: 'font-roboto' },
    { label: 'Times New Roman', class: 'font-times' },
    { label: 'Futura', class: 'font-futura' },
    { label: 'Bodoni', class: 'font-bodoni' },
    { label: 'Playfair Display', class: 'font-playfair' },
    { label: 'Montserrat', class: 'font-montserrat' },
    { label: 'Oswald', class: 'font-oswald' },
    { label: 'Raleway', class: 'font-raleway' },
];



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
    const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');
    const [textStyle, setTextStyle] = useState<'none' | 'solid' | 'outline'>('none');
    const [fontFamily, setFontFamily] = useState('font-sans');
    const [fontListExpanded, setFontListExpanded] = useState(false);


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
    
    const handleBack = () => {
        sessionStorage.removeItem('media-to-edit');
        sessionStorage.removeItem('media-type-to-edit');
        router.back();
    };

    const handleSend = () => {
        sessionStorage.removeItem('media-to-edit');
        sessionStorage.removeItem('media-type-to-edit');
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
        if (textInputValue.trim() === '' || !imageContainerRef.current) {
             setIsAddingText(false);
             setTextInputValue('');
             return;
        };
        
        setOverlayText(textInputValue);
        setIsAddingText(false);
        
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
                    setTextInputValue(''); // Clear input value
                }
            }
        }, 100);
    };

    const toggleTextAlign = () => {
        setTextAlign(prev => {
            if (prev === 'left') return 'center';
            if (prev === 'center') return 'right';
            return 'left';
        });
    };

    const toggleTextStyle = () => {
        setTextStyle(prev => {
            if (prev === 'none') return 'solid';
            if (prev === 'solid') return 'outline';
            return 'none';
        })
    }

    const AlignmentIcon = () => {
        if (textAlign === 'left') return <AlignCenter />;
        if (textAlign === 'center') return <AlignRight />;
        return <AlignLeft />;
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
                        <div className={cn(
                            "absolute inset-0 flex items-center p-4 pointer-events-none",
                            textAlign === 'center' && 'justify-center',
                            textAlign === 'left' && 'justify-start',
                            textAlign === 'right' && 'justify-end',
                        )}>
                            <span 
                                className={cn(
                                    "text-white text-4xl font-bold whitespace-pre-wrap",
                                    fontFamily,
                                    textStyle === 'solid' && 'bg-black/70 px-2 py-1 rounded-md',
                                    textStyle === 'outline' && 'text-stroke-2 text-stroke-black',
                                    textAlign === 'center' && 'text-center',
                                    textAlign === 'left' && 'text-left',
                                    textAlign === 'right' && 'text-right',
                                )}
                                style={{textShadow: textStyle === 'none' ? '2px 2px 4px rgba(0,0,0,0.7)' : 'none' }}
                            >
                                {overlayText}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Text Input Fullscreen Overlay */}
            <AnimatePresence>
                {isAddingText && (
                    <motion.div
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                            <Button variant="ghost" size="icon" onClick={() => setIsAddingText(false)} className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50">
                                <X />
                            </Button>
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={toggleTextStyle} className={cn("h-10 w-10 rounded-full", 'bg-white text-black')}>
                                    <Type />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={toggleTextAlign} className={cn("h-10 w-10 rounded-full", 'bg-white text-black')}>
                                    <AlignmentIcon />
                                </Button>
                            </div>
                            <Button size="sm" onClick={handleAddText}>
                                <Check className="w-4 h-4 mr-2" />
                                Enregistrer
                            </Button>
                        </header>
                         <motion.div
                            className="w-full"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                         >
                            <Textarea
                                value={textInputValue}
                                onChange={(e) => setTextInputValue(e.target.value)}
                                placeholder="Votre texte..."
                                className={cn(
                                    "w-full bg-transparent border-none text-3xl md:text-5xl font-bold text-white placeholder:text-white/50 focus-visible:ring-0 resize-none",
                                    fontFamily,
                                    textStyle === 'outline' && 'text-stroke-2 text-stroke-black',
                                    textAlign === 'center' && 'text-center',
                                    textAlign === 'left' && 'text-left',
                                    textAlign === 'right' && 'text-right'
                                )}
                                autoFocus
                            />
                         </motion.div>
                        <motion.footer
                            layout
                            className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10"
                            initial={{ height: "auto" }}
                            animate={{ height: fontListExpanded ? 250 : "auto" }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        >
                            <AnimatePresence mode="wait">
                                {fontListExpanded ? (
                                <motion.div
                                    key="list-expanded"
                                    className="h-full flex flex-col"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="flex justify-end p-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={() => setFontListExpanded(false)}
                                    >
                                        <ChevronDown className="h-5 w-5 text-white" />
                                    </Button>
                                    </div>
                                    <ScrollArea className="flex-1 px-2 pb-2 h-[180px]">
                                    {fontStyles.map((font) => (
                                        <Button
                                        key={`list-${font.class}`}
                                        variant="ghost"
                                        onClick={() => {
                                            setFontFamily(font.class);
                                            setFontListExpanded(false);
                                        }}
                                        className={cn(
                                            "w-full justify-start text-white text-lg h-12",
                                            font.class,
                                            fontFamily === font.class && "bg-white/20"
                                        )}
                                        >
                                        {font.label}
                                        </Button>
                                    ))}
                                    </ScrollArea>
                                </motion.div>
                                ) : (
                                <motion.div
                                    key="list-collapsed"
                                    className="flex items-center p-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="flex-1 overflow-x-auto no-scrollbar">
                                        <div className="flex items-center gap-2">
                                            {fontStyles.slice(0,5).map((font) => (
                                                <Button
                                                    key={font.class}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFontFamily(font.class)}
                                                    className={cn(
                                                    "rounded-full text-white shrink-0",
                                                    font.class,
                                                    fontFamily === font.class && "bg-white text-black"
                                                    )}
                                                >
                                                    {font.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => setFontListExpanded(true)}
                                    >
                                    <ChevronUp className="h-5 w-5 text-white" />
                                    </Button>
                                </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.footer>
                    </motion.div>
                )}
            </AnimatePresence>

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
