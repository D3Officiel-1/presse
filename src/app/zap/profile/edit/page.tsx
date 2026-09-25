'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  Loader2, 
  Camera,
  ChevronRight
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [commune, setCommune] = useState('');

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }

    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setLink(data.link || '');
          setCommune(data.commune || '');
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [fs, router]);

  const handleSave = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;

    if (!username.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le pseudo unique est obligatoire." });
      return;
    }

    setSaving(true);
    try {
      const updatePayload = { 
        name: name.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        bio: bio.trim(), 
        link: link.trim(),
        commune: commune.trim(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(fs, 'users', uid), updatePayload, { merge: true });
      toast({ title: 'Profil mis à jour !', description: 'Vos préférences ont été enregistrées.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder les modifications.' });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)]">
      <header className="sticky top-0 z-50 bg-[#F9F9FC]/80 backdrop-blur-md border-b border-neutral-100 px-4 h-14 flex items-center justify-center relative">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 p-2 rounded-xl text-neutral-600 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">modifier le profil</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Section Avatar */}
        <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-3">
          <div 
            className="w-28 h-28 rounded-full bg-neutral-200/80 flex items-center justify-center cursor-pointer active:opacity-80 transition-all shadow-sm relative overflow-hidden"
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <Camera className="w-8 h-8 text-white/90" />
            </div>
          </div>
          <button 
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Changer ma photo
          </button>
        </div>

        {/* Bloc d'informations : Lignes de liste élégantes */}
        <div className="space-y-6">
          
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-2">Informations de base</p>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
              
              <div className="flex items-center px-4 py-3.5">
                <span className="w-24 text-xs font-bold text-neutral-500">Nom</span>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ajouter un nom"
                  className="flex-1 h-8 bg-transparent border-none px-0 text-xs font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
                />
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-1 shrink-0" />
              </div>

              <div className="flex items-center px-4 py-3.5">
                <span className="w-24 text-xs font-bold text-neutral-500">Pseudo</span>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} 
                  placeholder="Identifiant unique"
                  className="flex-1 h-8 bg-transparent border-none px-0 text-xs font-mono font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
                />
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-1 shrink-0" />
              </div>

              <div className="flex items-center px-4 py-3.5">
                <span className="w-24 text-xs font-bold text-neutral-500">Lien web</span>
                <Input 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  placeholder="zap.ci/ton-portfolio"
                  className="flex-1 h-8 bg-transparent border-none px-0 text-xs font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
                />
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-1 shrink-0" />
              </div>

              <div className="flex items-center px-4 py-3.5">
                <span className="w-24 text-xs font-bold text-neutral-500">Commune</span>
                <Input 
                  value={commune} 
                  onChange={(e) => setCommune(e.target.value)} 
                  placeholder="Ex: Marcory, Koumassi"
                  className="flex-1 h-8 bg-transparent border-none px-0 text-xs font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
                />
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-1 shrink-0" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-2">Description & Univers</p>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden p-4 space-y-3">
              <span className="text-xs font-bold text-neutral-500 block">Biographie</span>
              <Textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Décris ton univers créatif en quelques mots..."
                className="min-h-[90px] rounded-xl bg-neutral-50/50 border-neutral-100 font-medium text-xs p-3 resize-none focus:ring-primary/10 shadow-none"
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
