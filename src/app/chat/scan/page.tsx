
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { handleSelectUser } from '@/lib/chat-actions';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user: currentUser } = useUser();
    const firestore = useFirestore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Effect for requesting camera permission
    useEffect(() => {
        const requestPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                // We got permission, we can close the stream now, html5-qrcode will open it again
                stream.getTracks().forEach(track => track.stop());
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Accès à la caméra refusé',
                    description: 'Veuillez autoriser l\'accès dans les paramètres de votre navigateur.',
                });
            }
        };
        requestPermission();
    }, [toast]);
    
    // Effect for starting the scanner once permission is granted
    useEffect(() => {
        if (hasCameraPermission !== true || scannerRef.current) {
            return;
        }

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText: string) => {
            if (isProcessing) return;

            setIsProcessing(true);
            scanner.pause();
            
            try {
                const urlObject = new URL(decodedText);
                const pathParts = urlObject.pathname.split('/');
                
                if ((urlObject.pathname.startsWith('/profile/') || urlObject.pathname.startsWith('/chat/settings/')) && pathParts[2]) {
                    const userId = pathParts[2];
                    if (userId === currentUser?.uid) {
                        toast({ variant: 'destructive', description: "Vous ne pouvez pas vous scanner vous-même." });
                        setIsProcessing(false);
                        if (scanner.getState() === 2 /* PAUSED */) scanner.resume();
                        return;
                    }
                    toast({ title: "Profil détecté !", description: `Création de la discussion avec l'utilisateur...` });
                    handleSelectUser(userId, currentUser, firestore, () => {}, router);
                } else {
                    throw new Error('Invalid URL format');
                }
            } catch (e) {
                toast({
                    variant: 'destructive',
                    title: 'QR Code non valide',
                    description: "Ce QR code ne semble pas être un profil valide de l'application.",
                });
                setIsProcessing(false);
                if (scanner.getState() === 2 /* PAUSED */) scanner.resume();
            }
        };

        const onScanFailure = (error: any) => {
            // This is called frequently, so we don't log it to avoid console spam.
        };
        
        const config = { fps: 10, qrbox: {width: 250, height: 250} };
        scanner.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
            .catch(err => {
                console.error("Scanner failed to start", err);
                toast({ variant: 'destructive', title: "Erreur du scanner", description: "Impossible de démarrer le scanner."});
            });

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(error => {
                    console.error("Failed to stop html5-qrcode scanner.", error);
                });
                scannerRef.current = null;
            }
        };
    }, [hasCameraPermission, isProcessing, currentUser, firestore, router, toast]);

    
    return (
        <div className="relative flex flex-col h-screen w-full bg-black text-white">
            <header className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-full bg-black/30 hover:bg-black/50">
                    <ArrowLeft />
                </Button>
                <h1 className="font-semibold text-lg">Scanner un QR Code</h1>
                 <div className="w-9"></div>
            </header>

            <div id="qr-reader" className="w-full flex-1 flex items-center justify-center">
                 {hasCameraPermission === null && <Loader2 className="w-10 h-10 animate-spin" />}
            </div>

            {hasCameraPermission === false && (
                 <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/80">
                     <Alert variant="destructive" className="max-w-sm">
                        <CameraOff className="h-4 w-4" />
                        <AlertTitle>Accès Caméra Requis</AlertTitle>
                        <AlertDescription>
                            Pour scanner un QR code, l'application a besoin d'accéder à votre caméra. Veuillez l'autoriser dans les paramètres de votre navigateur.
                        </AlertDescription>
                    </Alert>
                 </div>
            )}

             {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                    <Loader2 className="w-10 h-10 animate-spin" />
                </div>
            )}
            
             <footer className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-sm">Visez le QR code d'un membre</p>
            </footer>
        </div>
    );
}
