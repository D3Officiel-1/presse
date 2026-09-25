'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Image as ImageIcon, 
  Zap, 
  ZapOff, 
  X,
  Loader2
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        // Configuration pour couvrir l'écran
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: window.innerWidth / window.innerHeight
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Scan continu
          }
        );
        
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Scanner error:", err);
        setError("Impossible d'accéder à la caméra. Vérifiez vos permissions.");
        setIsInitializing(false);
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    if (decodedText.includes('zap.ci/@')) {
      const username = decodedText.split('@')[1];
      toast({ title: "Profil trouvé", description: `Redirection vers @${username}` });
      router.push(`/zap/profile?user=${username}`);
    } else {
      toast({ title: "Code scanné", description: decodedText });
    }
  };

  const handleUploadFromGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    try {
      const decodedText = await scannerRef.current.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: "Erreur", 
        description: "Aucun code QR valide trouvé." 
      });
    }
  };

  const toggleFlash = () => {
    toast({ title: "Note", description: "Le contrôle du flash dépend des capacités de votre navigateur." });
    setIsFlashOn(!isFlashOn);
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-[100] overflow-hidden h-[100dvh]">
      {/* Conteneur Caméra - Prend tout l'écran en arrière-plan */}
      <div className="absolute inset-0 z-0 bg-black">
        <div 
          id={regionId} 
          className="w-full h-full [&>video]:object-cover [&>video]:h-full [&>video]:w-full"
        ></div>
      </div>
      
      {/* Overlays UI - Superposés sur la caméra */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Header */}
        <header className="flex items-center justify-between px-4 h-16 bg-gradient-to-b from-black/60 to-transparent shrink-0 pointer-events-auto">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/10 backdrop-blur-md rounded-full active:scale-90 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-white/90">Scanner</h1>
          <div className="w-10" />
        </header>

        {/* Zone de scan centrale */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 border-2 border-white/20 rounded-[40px] overflow-hidden shadow-[0_0_0_100vmax_rgba(0,0,0,0.4)]">
            {/* Coins du viseur */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            
            {/* Ligne animée */}
            <motion.div 
              animate={{ top: ['5%', '95%', '5%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-4 right-4 h-0.5 bg-white/80 shadow-[0_0_12px_rgba(255,255,255,1)] z-10"
            />
          </div>

          <div className="mt-8 text-center px-10">
            <p className="text-[13px] font-bold text-white/90 bg-black/40 backdrop-blur-md py-2.5 px-6 rounded-full inline-block">
              Placez le code QR au centre
            </p>
          </div>
        </div>

        {/* Footer Controls */}
        <footer className="h-32 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-16 px-10 pb-[env(safe-area-inset-bottom,20px)] shrink-0 pointer-events-auto">
          <div className="flex flex-col items-center gap-2">
            <label className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-xl border border-white/10 backdrop-blur-md">
              <ImageIcon className="w-6 h-6 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleUploadFromGallery}
              />
            </label>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Album</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={toggleFlash}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl border backdrop-blur-md",
                isFlashOn ? "bg-white border-white text-black" : "bg-white/10 border-white/10 text-white"
              )}
            >
              {isFlashOn ? (
                <Zap className="w-6 h-6 fill-current" />
              ) : (
                <ZapOff className="w-6 h-6" />
              )}
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Flash</span>
          </div>
        </footer>
      </div>

      {/* Chargement & Erreur */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Activation de la caméra...</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-neutral-950 z-[60] flex flex-col items-center justify-center p-10 text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
              <X className="w-10 h-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black tracking-tight">{error}</p>
              <p className="text-xs text-white/40 font-medium leading-relaxed">
                L'accès à la caméra est nécessaire pour scanner les codes de vos amis.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              Autoriser & Réessayer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
