
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  Loader2, 
  Camera,
  ChevronRight,
  Copy,
  Link2
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }

    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          setProfile(snap.data());
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [fs, router]);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast({ title: "Copié !", description: "Lien copié dans le presse-papier." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FC] flex flex-col items-center justify-center text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">Chargement du studio...</p>
      </div>
    );
  }

  const linksCount = profile?.links?.length || 0;

  return (
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)]">
      <header className="sticky top-0 z-50 bg-[#F9F9FC] border-b border-neutral-100 px-4 h-14 flex items-center justify-center relative">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 p-2 rounded-xl text-neutral-600 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">modifier le profil</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        <div className="flex flex-col items-center justify-center pt-6 space-y-4">
          <div 
            className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer active:opacity-80 transition-all shadow-inner relative overflow-hidden group"
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
              <Camera className="w-8 h-8 text-white/90" />
            </div>
            <img 
              src={`https://picsum.photos/seed/${profile?.username || 'avatar'}/200/200`} 
              alt="Avatar" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <button 
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
            className="text-[13px] font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Changer ma photo
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden divide-y divide-neutral-100">
            <Link href="/zap/profile/edit/nom" className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between">
              <span className="text-[13px] font-bold text-neutral-500">Nom</span>
              <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                <span className="text-[13px] font-bold text-neutral-900 truncate max-w-[200px]">
                  {profile?.name || 'Ajouter un nom'}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
              </div>
            </Link>

            <Link href="/zap/profile/edit/username" className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between">
              <span className="text-[13px] font-bold text-neutral-500">Pseudo</span>
              <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                <span className="text-[13px] font-mono font-bold text-neutral-900 truncate max-w-[200px]">
                  {profile?.username || 'Pseudo unique'}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
              </div>
            </Link>

            <div className="flex items-center px-4 py-4 justify-between">
              <span className="text-[13px] font-bold text-neutral-500">Lien du pass</span>
              <div className="flex items-center space-x-1.5 justify-end flex-1 min-w-0">
                <span className="text-[12px] font-mono font-medium text-neutral-400 truncate max-w-[220px]">
                  zap.ci/@{profile?.username || '...'}
                </span>
                <button 
                  onClick={() => copyToClipboard(`zap.ci/@${profile?.username}`)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 active:scale-90 transition-all shrink-0 ml-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-4 mb-2">À propos de toi</p>
            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden divide-y divide-neutral-100">
              <Link href="/zap/profile/edit/bio" className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between">
                <span className="text-[13px] font-bold text-neutral-500">Bio</span>
                <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                  <span className="text-[13px] font-bold text-neutral-400 truncate max-w-[220px]">
                    {profile?.bio || 'Décrivez votre univers...'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
                </div>
              </Link>

              <Link href="/zap/profile/edit/links" className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-neutral-400" />
                  <span className="text-[13px] font-bold text-neutral-500">Liens</span>
                </div>
                <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                  <span className="text-[13px] font-bold text-primary">
                    {linksCount > 0 ? `${linksCount} lien${linksCount > 1 ? 's' : ''}` : 'Ajouter'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
                </div>
              </Link>

              <div className="flex items-center px-4 py-4 justify-between">
                <span className="text-[13px] font-bold text-neutral-500">Commune</span>
                <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                  <span className="text-[13px] font-bold text-neutral-900 truncate">
                    {profile?.commune || 'Abidjan'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1 opacity-0" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-4 mb-2">Etablissement scolaire</p>
            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden divide-y divide-neutral-100">
              <div className="flex items-center px-4 py-4 justify-between bg-neutral-50/50">
                <span className="text-[13px] font-bold text-neutral-500">Établissement</span>
                <span className="text-[12px] font-black text-neutral-400 text-right truncate max-w-[240px] uppercase tracking-tight">
                  {profile?.company || 'Non défini'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
