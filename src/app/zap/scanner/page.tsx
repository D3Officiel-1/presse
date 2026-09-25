'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Image as ImageIcon, 
  Zap, 
  ZapOff, 
  X,
  Loader2,
  QrCode as QrIcon
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'react-qr-code';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';

export default function ScannerPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMyQr, setShowMyQr] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          aspectRatio: window.innerWidth / window.innerHeight
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {}
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
      const parts = decodedText.split('@');
      const username = parts[parts.length - 1];
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          router.push(`/zap/profile?user=${username}`);
        });
      }
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
    setIsFlashOn(!isFlashOn);
    toast({ title: "Flash", description: "Le contrôle du flash dépend du navigateur." });
  };

  const myQrUrl = `https://zap.ci/@${user?.username || 'user'}`;

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-[100] overflow-hidden h-[100dvh]">
      <div className="absolute inset-0 z-0 bg-black">
        <div 
          id={regionId} 
          className="w-full h-full [&>video]:object-cover [&>video]:h-full [&>video]:w-full"
        ></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
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

        <div className="flex-1" />

        <footer className="h-36 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-around px-6 pb-[env(safe-area-inset-bottom,20px)] shrink-0 pointer-events-auto">
          <div className="flex flex-col items-center gap-2">
            <label className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-xl border border-white/10 backdrop-blur-md">
              <ImageIcon className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadFromGallery} />
            </label>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Galerie</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowMyQr(true)}
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center transition-all active:scale-90 shadow-[0_0_20px_rgba(255,39,0,0.4)] border-4 border-white"
            >
              <QrIcon className="w-7 h-7 text-white" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Mon QR</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={toggleFlash}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl border backdrop-blur-md",
                isFlashOn ? "bg-white border-white text-black" : "bg-white/10 border-white/10 text-white"
              )}
            >
              {isFlashOn ? <Zap className="w-6 h-6 fill-current" /> : <ZapOff className="w-6 h-6" />}
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Flash</span>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showMyQr && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMyQr(false)}
              className="fixed inset-0 bg-black/90 z-[110] backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <button onClick={() => setShowMyQr(false)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">Mon Pass ZAP</h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">@{user?.username || 'createur'}</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border-8 border-neutral-50 shadow-inner">
                  <QRCode value={myQrUrl} size={200} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} fgColor="#000000" />
                </div>
                <p className="text-[11px] font-medium text-neutral-400 leading-relaxed max-w-[200px]">Partagez ce code pour être ajouté instantanément.</p>
                <Button onClick={() => setShowMyQr(false)} className="w-full h-12 rounded-2xl bg-neutral-900 text-white font-black text-xs uppercase tracking-widest">Fermer</Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInitializing && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Activation de la caméra...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
