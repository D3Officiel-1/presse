'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function EditNamePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  const [name, setName] = useState('');
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
        if (snap.exists()) setName(snap.data().name || '');
        setLoading(false);
      });
    }
  }, [fs, router]);

  const handleSave = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { name: name.trim(), updatedAt: new Date() }, { merge: true });
      toast({ title: 'Modifié !', description: 'Votre nom a été mis à jour.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Annuler
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">Nom</h1>
        <button 
          onClick={handleSave} 
          disabled={saving || !name.trim()}
          className="text-sm font-black text-primary disabled:opacity-30 transition-opacity"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </button>
      </header>
      
      <main className="max-w-md mx-auto p-6 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
              Nom complet
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <Input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Yannick Koffi"
                className="pl-12 pr-12 border-none shadow-md"
                autoFocus
              />
              {name.length > 0 && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-neutral-600 rounded-full bg-neutral-100 transition-all hover:scale-110 active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <p className="text-[11px] font-medium text-neutral-400 leading-relaxed px-1">
            Utilisez votre vrai nom pour que vos camarades et professeurs puissent vous identifier facilement dans le studio.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
