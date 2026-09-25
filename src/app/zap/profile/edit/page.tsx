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
  ChevronRight,
  Copy,
  Save
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
  const [school, setSchool] = useState('');

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
          setSchool(data.company || '');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Lien copié dans le presse-papier." });
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
      {/* Header épuré */}
      <header className="sticky top-0 z-50 bg-[#F9F9FC] border-b border-neutral-100 px-4 h-14 flex items-center justify-center relative">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 p-2 rounded-xl text-neutral-600 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">modifier le profil</h1>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="absolute right-4 p-2 text-teal-600 font-bold text-xs uppercase tracking-widest active:opacity-70 disabled:opacity-30"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* Section Avatar & Photo */}
        <div className="flex flex-col items-center justify-center pt-6 space-y-4">
          <div 
            className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer active:opacity-80 transition-all shadow-inner relative overflow-hidden group"
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 transition-opacity">
              <Camera className="w-8 h-8 text-white/90" />
            </div>
            <img 
              src={`https://picsum.photos/seed/${username}/200/200`} 
              alt="Avatar" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <button 
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
            className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Changer ma photo
          </button>
        </div>

        {/* Bloc Identification */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
            <div 
              onClick={() => router.push('/zap/profile/edit#nom')}
              className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50"
            >
              <span className="w-28 text-[13px] font-bold text-neutral-500">Nom</span>
              <Input 
                id="nom"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ajouter un nom"
                className="flex-1 h-6 bg-transparent border-none px-0 text-[13px] font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
              />
              <ChevronRight className="w-4 h-4 text-neutral-300 ml-2 shrink-0" />
            </div>

            <div 
              onClick={() => router.push('/zap/profile/edit#username')}
              className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50"
            >
              <span className="w-28 text-[13px] font-bold text-neutral-500">Pseudo</span>
              <Input 
                id="username"
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} 
                placeholder="Identifiant unique"
                className="flex-1 h-6 bg-transparent border-none px-0 text-[13px] font-mono font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
              />
              <ChevronRight className="w-4 h-4 text-neutral-300 ml-2 shrink-0" />
            </div>

            <div className="flex items-center px-4 py-4">
              <span className="w-28 text-[13px] font-bold text-neutral-500">zap.ci/@{username || '...'}</span>
              <div className="flex-1 flex justify-end">
                <button 
                  onClick={() => copyToClipboard(`zap.ci/@${username}`)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 active:scale-90 transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Section Infos de base */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-4 mb-2">Informations de base</p>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
              <div 
                onClick={() => router.push('/zap/profile/edit#bio')}
                className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50"
              >
                <span className="w-28 text-[13px] font-bold text-neutral-500">Bio</span>
                <Input 
                  id="bio"
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Décrivez votre univers..."
                  className="flex-1 h-6 bg-transparent border-none px-0 text-[13px] font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
                />
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-2 shrink-0" />
              </div>

              <div 
                onClick={() => router.push('/zap/profile/edit#commune')}
                className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50"
              >
                <span className="w-28 text-[13px] font-bold text-neutral-500">Commune</span>
                <Input 
                  id="commune"
                  value={commune} 
                  onChange={(e) => setCommune(e.target.value)} 
                  placeholder="Ex: Marcory"
                  className="flex-1 h-6 bg-transparent border-none px-0 text-[13px] font-bold text-neutral-900 text-right focus-visible:ring-0 shadow-none placeholder:text-neutral-300"
                />
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-2 shrink-0" />
              </div>
            </div>
          </div>

          {/* Section Autres */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-4 mb-2">Autres</p>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
              <div className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50">
                <span className="w-28 text-[13px] font-bold text-neutral-500">Établissement</span>
                <span className="flex-1 text-[13px] font-bold text-neutral-400 text-right truncate">
                  {school || 'Non défini'}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-2 shrink-0" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
