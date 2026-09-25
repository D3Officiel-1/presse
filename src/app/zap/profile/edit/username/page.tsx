'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, AtSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function EditUsernamePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const USERNAME_LIMIT = 24;

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }
    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const currentUsername = snap.data().username || '';
          setUsername(currentUsername);
          setInitialUsername(currentUsername);
        }
        setLoading(false);
      });
    }
  }, [fs, router]);

  const cleanVal = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const hasChanges = cleanVal !== initialUsername;
  const isNotEmpty = cleanVal.length >= 3;

  const handleSave = async () => {
    if (!isNotEmpty || !hasChanges || saving) return;

    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { 
        username: cleanVal, 
        updatedAt: new Date() 
      }, { merge: true });
      
      toast({ title: 'Modifié !', description: 'Votre pseudo a été mis à jour.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Pseudo indisponible ou erreur.' });
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
          disabled={saving || !isNotEmpty || !hasChanges}
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
              Nom d'utilisateur
            </h1>
            <p className="text-[11px] font-bold text-neutral-400 leading-tight">
              Tu ne peux modifier ton nom d'utilisateur qu'une tous les 30 jours. La modification de ton nom d'utilisateur modifira aussi ton lien de profil. Les nom d'utilisateur ne peuvent contenir que des lettres, des chiffres, des tirets bas et des points.
            </p>
          </div>

          <div className="space-y-3 w-full">
            <div className="relative group w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                <AtSign className="w-5 h-5" />
              </div>
              <Input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="Pseudo unique"
                className="pl-12 pr-12 border-none shadow-md w-full font-mono text-base font-bold"
                autoFocus
                maxLength={USERNAME_LIMIT}
              />
              {username.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUsername('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-neutral-600 rounded-full bg-neutral-100 transition-all hover:scale-110 active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between px-1 pt-1 text-[11px] font-bold text-neutral-400">
              <p className="text-primary font-bold tracking-tight text-left">
                zap.ci/@{cleanVal || 'votre_pseudo'}
              </p>
              <span>
                {username.length}/{USERNAME_LIMIT}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
