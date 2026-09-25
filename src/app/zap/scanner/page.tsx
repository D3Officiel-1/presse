'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Zap, 
  ZapOff, 
  X,
  Loader2,
  ScanLine
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    // Initialisation du scanner après montage du composant
    const initializeScanner = async () => {
      try {
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Ignorer les erreurs de scan continu
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
    // Logique pour traiter le code scanné
    // Si c'est un lien ZAP, on redirige vers le profil
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
        description: "Aucun code QR valide n'a été trouvé sur cette image." 
      });
    }
  };

  const toggleFlash = () => {
    // Note: Le contrôle du flash dépend du navigateur et du matériel
    // Html5Qrcode ne supporte pas nativement le flash via API standard sur tous les navigateurs
    toast({ title: "Prochainement", description: "Le contrôle du flash sera bientôt disponible." });
    setIsFlashOn(!isFlashOn);
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-[100] overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/10 backdrop-blur-md rounded-full active:scale-90 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-white/90">Scanner</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Camera Region */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <div id={regionId} className="w-full h-full object-cover"></div>
        
        {/* Overlay Scanner UI */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-64 h-64 border-2 border-white/30 rounded-3xl overflow-hidden">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            
            {/* Animated Scan Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"
            />
          </div>

          <div className="absolute top-[calc(50%+160px)] text-center w-full px-10">
            <p className="text-[13px] font-bold text-white/70 bg-black/40 backdrop-blur-sm py-2 px-4 rounded-full inline-block">
              Placez le code QR dans le cadre pour scanner
            </p>
          </div>
        </div>

        <AnimatePresence>
          {isInitializing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex flex-col items-center justify-center space-y-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-white/40" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Initialisation...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black flex flex-col items-center justify-center p-10 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
                <X className="w-10 h-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black tracking-tight">{error}</p>
                <p className="text-xs text-white/40 font-medium leading-relaxed">
                  ZAP! a besoin de l'accès à votre caméra pour scanner les codes QR de vos amis.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-white text-black px-8 h-12 rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
                Réessayer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <footer className="h-32 bg-black flex items-center justify-center gap-16 px-10 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex flex-col items-center gap-2">
          <label className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-xl border border-white/10">
            <ImageIcon className="w-6 h-6 text-white" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUploadFromGallery}
            />
          </label>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Album</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={toggleFlash}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl border",
              isFlashOn ? "bg-white border-white" : "bg-white/10 border-white/10"
            )}
          >
            {isFlashOn ? (
              <Zap className="w-6 h-6 text-black fill-black" />
            ) : (
              <ZapOff className="w-6 h-6 text-white" />
            )}
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Flash</span>
        </div>
      </footer>
    </div>
  );
}
