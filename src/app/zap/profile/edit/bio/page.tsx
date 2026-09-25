'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TextQuote, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

export default function EditBioPage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [bio, setBio] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const BIO_LIMIT = 80;

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }
    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const currentBio = snap.data().bio || '';
          setBio(currentBio);
          setInitialBio(currentBio);
        }
        setLoading(false);
      });
    }
  }, [fs, router]);

  const hasChanges = bio.trim() !== initialBio;

  const handleSave = async () => {
    if (!hasChanges || saving) return;

    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { 
        bio: bio.trim(), 
        updatedAt: new Date() 
      }, { merge: true });
      
      toast({ title: 'Modifié !', description: 'Votre bio a été mise à jour.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder la bio.' });
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
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 w-full">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center justify-between w-full">
        <button 
          onClick={() => router.back()} 
          className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Annuler
        </button>
        
        <button 
          onClick={handleSave} 
          disabled={saving || !hasChanges}
          className="text-sm font-black text-primary disabled:opacity-30 transition-opacity"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </button>
      </header>
      
      <main className="w-full px-4 py-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 w-full"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-neutral-950 text-left">
              Biographie
            </h1>
            <p className="text-[11px] font-bold text-neutral-400 leading-tight">
              Tu peux modifier ta biographie à tout moment.
            </p>
          </div>

          <div className="space-y-2 w-full">
            <div className="relative group w-full">
              <div className="absolute left-4 top-4 text-neutral-400 group-focus-within:text-primary transition-colors">
                <TextQuote className="w-5 h-5" />
              </div>
              <Textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value.substring(0, BIO_LIMIT))}
                placeholder="Décrivez votre univers créatif..."
                className="pl-12 pr-12 min-h-[120px] bg-white/70 backdrop-blur-sm border border-neutral-200/80 rounded-2xl text-base font-medium focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary shadow-sm resize-none pt-3"
                autoFocus
                maxLength={BIO_LIMIT}
              />
              {bio.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBio('')}
                  className="absolute right-4 top-4 p-1 text-neutral-300 hover:text-neutral-600 rounded-full bg-neutral-100 transition-all hover:scale-110 active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex justify-end text-[11px] font-bold text-neutral-400 px-1">
              {bio.length}/{BIO_LIMIT}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
