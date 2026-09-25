'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronLeft, 
  Loader2, 
  Sparkles, 
  AtSign, 
  User, 
  Globe, 
  Lock, 
  Link2, 
  MapPin,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCOUNT_CATEGORIES = [
  "Créateur Digital", 
  "Monteur VFX", 
  "Scénariste", 
  "Acteur/Humoriste", 
  "Danseur Urbain", 
  "Cadreur / Réalisateur"
];

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
  const [category, setCategory] = useState('Créateur Digital');
  const [isPublic, setIsPublic] = useState(true);

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
          setCategory(data.category || 'Créateur Digital');
          setIsPublic(data.isPublic !== false);
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
        category,
        isPublic,
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
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-14 flex items-center justify-center relative">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 p-2 rounded-xl text-neutral-600 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">Modifier mon profil</h1>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-orange-400 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-neutral-100 border-4 border-white overflow-hidden flex items-center justify-center shadow-inner">
                <User className="w-12 h-12 text-neutral-300 stroke-[1.5]" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 p-2.5 bg-neutral-950 text-white rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Changer ma photo</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Nom ZAP (Nom de Profil)</label>
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Marc l'Artiste"
                className="pl-12 h-14 rounded-2xl bg-white border-neutral-200 font-bold focus:ring-primary/10 transition-all shadow-sm"
              />
            </div>
            <p className="text-[9px] text-neutral-400 italic ml-1 leading-tight opacity-80">Laissez vide pour utiliser votre identifiant par défaut.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Pseudo Unique (@)</label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} 
                placeholder="pseudo_zap"
                className="pl-12 h-14 rounded-2xl bg-white border-neutral-200 font-mono font-bold focus:ring-primary/10 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Catégorie Créateur</label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[11px] font-bold border transition-all active:scale-95",
                      isSelected 
                        ? "bg-neutral-950 text-white border-neutral-950 shadow-md" 
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 shadow-sm"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Biographie</label>
            <Textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Décris ton univers créatif en quelques mots..."
              className="min-h-[110px] rounded-2xl bg-white border-neutral-200 font-medium text-sm p-4 resize-none focus:ring-primary/10 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Lien Portfolio</label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  className="pl-12 h-14 rounded-2xl bg-white border-neutral-200 font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Commune</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                  value={commune} 
                  onChange={(e) => setCommune(e.target.value)} 
                  className="pl-12 h-14 rounded-2xl bg-white border-neutral-200 font-medium shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-neutral-200 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {isPublic ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                <p className="text-xs font-black text-neutral-900 uppercase tracking-tight">Visibilité Publique</p>
              </div>
              <p className="text-[10px] font-medium text-neutral-400 max-w-[220px]">Rend vos créations visibles par toute la communauté scolaire ZAP.</p>
            </div>
            <Switch 
              checked={isPublic} 
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-neutral-800 transition-all active:scale-[0.98]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Enregistrer les modifications
          </Button>
        </div>
      </main>
    </div>
  );
}
