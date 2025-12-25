
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Camera, Video, Repeat, Send, X, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const FlashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
);


export default function CameraPage() {
    const router = useRouter();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const photoRef = useRef<HTMLCanvasElement>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoData, setPhotoData] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (photoData) return; // Don't get stream if a photo is already taken
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode } 
                });
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
                setHasPermission(true);
            } catch (error) {
                console.error("Error accessing camera:", error);
                setHasPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Accès Caméra Refusé',
                    description: "Veuillez autoriser l'accès à la caméra pour utiliser cette fonctionnalité.",
                });
            }
        };

        getCameraPermission();
        
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode, photoData]);

    const takePhoto = async () => {
        if (!videoRef.current || !photoRef.current) return;

        const video = videoRef.current;
        const photo = photoRef.current;
        
        const width = video.videoWidth;
        const height = video.videoHeight;
        photo.width = width;
        photo.height = height;

        const context = photo.getContext('2d');
        if (!context) return;
        
        if (flashMode === 'on') {
            const track = stream?.getVideoTracks()[0];
            if (track && track.getCapabilities().torch) {
                try {
                    await track.applyConstraints({ advanced: [{ torch: true }] });
                    // Give it a moment to light up
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch(e) { console.error("Could not turn on flash", e)}
            }
        }

        context.drawImage(video, 0, 0, width, height);
        setPhotoData(photo.toDataURL('image/webp'));
        
        if (flashMode === 'on') {
            const track = stream?.getVideoTracks()[0];
            if (track && track.getCapabilities().torch) {
                 try {
                    await track.applyConstraints({ advanced: [{ torch: false }] });
                } catch(e) { console.error("Could not turn off flash", e)}
            }
        }
        
        stopStream();
    };

    const retakePhoto = () => {
        setPhotoData(null);
    };
    
    const sendPhoto = () => {
        if (!photoData) return;
        sessionStorage.setItem('media-to-edit', photoData);
        sessionStorage.setItem('media-type-to-edit', 'image');
        router.push('/chat/editor');
    };

    const toggleCamera = () => {
        setPhotoData(null);
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };
    
    const toggleFlash = async () => {
        const track = stream?.getVideoTracks()[0];
        if (track && track.getCapabilities().torch) {
            setFlashMode(prev => prev === 'on' ? 'off' : 'on');
        } else {
            toast({ description: "Le flash n'est pas supporté sur cet appareil." });
        }
    };
    
    if (hasPermission === null) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (hasPermission === false) {
        return (
             <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-4">
                <p className="text-center">L'accès à la caméra est nécessaire.</p>
                 <Button onClick={() => router.back()} className="mt-4">Retour</Button>
            </div>
        )
    }

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-between bg-black text-white">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent"
            >
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50">
                    <X />
                </Button>
                 <Button variant="ghost" size="icon" onClick={toggleFlash} className={cn("h-10 w-10 rounded-full bg-black/30 hover:bg-black/50", flashMode === 'on' && 'text-yellow-400')}>
                    <FlashIcon />
                </Button>
            </motion.div>
            
            {/* Camera View / Photo Preview */}
            <div className="absolute inset-0">
                <AnimatePresence>
                    {photoData ? (
                        <motion.div 
                            key="photo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full w-full"
                        >
                            <Image src={photoData} alt="Photo prise" layout="fill" objectFit="contain" />
                        </motion.div>
                    ) : (
                        <motion.video
                            key="video"
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={cn("h-full w-full object-cover", facingMode === 'user' && "scale-x-[-1]")}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                        />
                    )}
                </AnimatePresence>
                <canvas ref={photoRef} className="hidden" />
            </div>

            {/* Footer */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 z-10 w-full flex items-center justify-around"
            >
                {photoData ? (
                    <>
                        <Button variant="ghost" className="text-lg" onClick={retakePhoto}>
                            <X className="mr-2" /> Reprendre
                        </Button>
                         <Button size="lg" className="rounded-full h-16" onClick={sendPhoto}>
                            <Send className="mr-2" /> Envoyer
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16"></div>
                        <button
                            onClick={takePhoto}
                            className="w-20 h-20 rounded-full bg-white border-4 border-black/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                        >
                            <div className="w-16 h-16 rounded-full bg-white" />
                        </button>
                        <Button variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-black/30" onClick={toggleCamera}>
                            <Repeat className="w-8 h-8" />
                        </Button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
