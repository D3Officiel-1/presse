
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  ExternalLink,
  GripVertical,
  X,
  Link2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, Reorder } from 'framer-motion';

interface ProfileLink {
  id: string;
  title: string;
  url: string;
}

export default function EditLinksPage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
          setLinks(data.links || []);
        }
        setLoading(false);
      });
    }
  }, [fs, router]);

  const handleAddLink = () => {
    if (links.length >= 5) {
      toast({ variant: 'destructive', title: 'Limite atteinte', description: 'Vous pouvez ajouter 5 liens maximum.' });
      return;
    }
    const newLink: ProfileLink = {
      id: Math.random().toString(36).substring(7),
      title: '',
      url: ''
    };
    setLinks([...links, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleUpdateLink = (id: string, field: 'title' | 'url', value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs || saving) return;

    // Validation simple
    const validLinks = links.filter(l => l.title.trim() !== '' && l.url.trim() !== '');
    
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { 
        links: validLinks,
        updatedAt: new Date() 
      }, { merge: true });
      
      toast({ title: 'Enregistré !', description: 'Vos liens ont été mis à jour.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9F9FC] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 w-full pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center justify-between w-full">
        <button 
          onClick={() => router.back()} 
          className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Annuler
        </button>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="text-sm font-black text-primary disabled:opacity-30 transition-opacity"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </button>
      </header>
      
      <main className="w-full px-4 py-6 space-y-6 max-w-md mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-neutral-950">
            Liens
          </h1>
          <p className="text-[11px] font-bold text-neutral-400 leading-tight">
            Ajoutez jusqu'à 5 liens vers vos réseaux sociaux, votre portfolio ou vos projets créatifs.
          </p>
        </div>

        <Reorder.Group axis="y" values={links} onReorder={setLinks} className="space-y-4">
          {links.map((link) => (
            <Reorder.Item 
              key={link.id} 
              value={link}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 relative group"
            >
              <div className="flex items-center gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab active:cursor-grabbing" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nouveau Lien</span>
                <button 
                  onClick={() => handleRemoveLink(link.id)}
                  className="ml-auto p-1.5 text-neutral-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Input 
                    placeholder="Titre (ex: Mon Portfolio)"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                    className="h-10 text-sm bg-neutral-50/50 border-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <Input 
                      placeholder="URL (https://...)"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                      className="h-10 text-sm pl-9 bg-neutral-50/50 border-neutral-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {links.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center">
              <Link2 className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Aucun lien ajouté</p>
          </div>
        )}

        <Button 
          onClick={handleAddLink}
          disabled={links.length >= 5}
          variant="outline"
          className="w-full h-14 rounded-2xl border-dashed border-2 border-neutral-200 text-neutral-500 font-bold hover:bg-neutral-50 transition-all gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un lien
        </Button>
      </main>
    </div>
  );
}
