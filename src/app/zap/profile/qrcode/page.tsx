'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MyQRCodePage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const qrCardRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const profileUrl = `https://zap.ci/@${user?.username || 'user'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "Lien copié !", description: "Votre pass peut maintenant être partagé." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!qrCardRef.current) return;
    setIsExporting(true);
    
    try {
      const dataUrl = await toPng(qrCardRef.current, { 
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        style: {
          borderRadius: '0' // On enlève les coins arrondis pour l'export image propre
        }
      });
      const link = document.createElement('a');
      link.download = `zap-pass-${user?.username || 'user'}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Image enregistrée", description: "Votre pass est dans votre galerie." });
    } catch (err) {
      toast({ variant: 'destructive', title: "Erreur", description: "Impossible de générer l'image." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Pass ZAP!',
          text: `Retrouvez-moi sur ZAP! Studio. Mon pseudo : @${user?.username}`,
          url: profileUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F9F9FC] text-neutral-900 flex flex-col relative overflow-x-hidden selection:bg-primary/10">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,39,0,0.06) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)' }}
        />
      </div>

      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-neutral-100 px-4 h-16 flex items-center justify-between shrink-0">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-neutral-900 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-black uppercase tracking-widest text-neutral-900">Mon Code QR</h1>
        <button 
          onClick={handleShare}
          className="p-2 -mr-2 text-neutral-900 active:scale-90 transition-transform"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-10 z-10 max-w-md mx-auto w-full">
        
        {/* The QR Card - Exportable */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          ref={qrCardRef}
          className="w-full bg-white rounded-[3rem] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col items-center text-center relative overflow-hidden group"
        >
          {/* Decorative Corner Gradients */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl -ml-10 -mb-10" />

          {/* Profile Section */}
          <div className="space-y-4 mb-8">
            <div className="relative mx-auto w-20 h-20 rounded-[1.75rem] bg-gradient-to-tr from-primary to-violet-600 p-0.5 shadow-xl transition-transform group-hover:scale-105 duration-500">
              <div className="w-full h-full rounded-[1.65rem] border-2 border-white overflow-hidden bg-neutral-50">
                <img 
                  src={`https://picsum.photos/seed/${user?.username || 'avatar'}/200/200`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                </div>
              </div>
            </div>
            
            <div className="space-y-0.5">
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                {user?.name || 'Créateur ZAP'}
              </h3>
              <p className="text-xs text-primary font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 fill-current" /> @{user?.username || 'pseudo'}
              </p>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative p-6 bg-white rounded-[2.5rem] border-8 border-neutral-50 shadow-inner flex items-center justify-center overflow-hidden">
             {/* Subtle animated lines in the QR background */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="h-full w-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
             </div>
             
             <div className="relative z-10">
               <QRCode 
                 value={profileUrl}
                 size={210}
                 style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                 viewBox={`0 0 256 256`}
                 fgColor="#000000"
                 level="H"
               />
             </div>
          </div>

          <div className="mt-8 space-y-1">
            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">Studio ZAP!</p>
            <p className="text-[11px] font-medium text-neutral-400">Scanne pour t'abonner au profil</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-4">
          <Button 
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="w-full h-14 rounded-2xl bg-neutral-950 text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
            {isExporting ? 'Génération...' : 'Enregistrer le Pass'}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={handleCopyLink}
              className="h-14 rounded-2xl border-2 border-neutral-200 bg-white text-neutral-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              Lien
            </Button>
            <Button 
              variant="outline"
              onClick={handleShare}
              className="h-14 rounded-2xl border-2 border-neutral-200 bg-white text-neutral-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
          </div>
        </div>

        <p className="text-[12px] text-neutral-400 font-medium leading-relaxed text-center px-6 pt-4">
          Partage ton Pass avec d'autres élèves pour qu'ils découvrent tes meilleures vidéos scolaires !
        </p>
      </main>

      {/* Fullscreen Overlay for Exporting */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">Préparation de votre Pass...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
