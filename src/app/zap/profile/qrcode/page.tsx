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

export default function MyQRCodePage(props: { params: Promise<any>; searchParams: Promise<any> }) {
  const _params = React.use(props.params);
  const _searchParams = React.use(props.searchParams);
  
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
      const dataUrl = await toPng(qrCardRef.current, { cacheBust: true, backgroundColor: '#FFFFFF' });
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

  return (
    <div className="min-h-[100dvh] bg-[#F9F9FC] text-neutral-900 flex flex-col relative overflow-hidden">
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-neutral-100 px-4 h-16 flex items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-black uppercase tracking-widest">Mon Code QR</h1>
        <button onClick={handleCopyLink} className="p-2 -mr-2 active:scale-90 transition-transform">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-10 z-10 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} ref={qrCardRef} className="w-full bg-white rounded-[3rem] p-8 shadow-xl border border-neutral-100 flex flex-col items-center text-center">
          <div className="space-y-4 mb-8">
            <div className="mx-auto w-20 h-20 rounded-[1.75rem] bg-gradient-to-tr from-primary to-violet-600 p-0.5">
              <img src={`https://picsum.photos/seed/${user?.username || 'avatar'}/200/200`} className="w-full h-full rounded-[1.65rem] border-2 border-white object-cover" alt="Profile" />
            </div>
            <div>
              <h3 className="text-xl font-black">{user?.name || 'Créateur ZAP'}</h3>
              <p className="text-xs text-primary font-black uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 fill-current" /> @{user?.username || 'pseudo'}
              </p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-[2.5rem] border-8 border-neutral-50 shadow-inner">
            <QRCode value={profileUrl} size={210} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} fgColor="#000000" level="H" />
          </div>
          <p className="mt-8 text-[11px] font-medium text-neutral-400">Scannez pour découvrir mes vidéos</p>
        </motion.div>

        <div className="w-full space-y-3">
          <Button onClick={handleDownloadImage} disabled={isExporting} className="w-full h-14 rounded-2xl bg-neutral-950 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Enregistrer le Pass
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="w-full h-14 rounded-2xl border-2 border-neutral-200 bg-white text-neutral-900 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            Copier le lien
          </Button>
        </div>
      </main>

      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Préparation...</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
