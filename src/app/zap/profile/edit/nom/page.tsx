'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, User, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';

export default function EditNamePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
          if (data.nameLastUpdatedAt) {
            setLastUpdate(data.nameLastUpdatedAt.toDate());
          }
        }
        setLoading(false);
      });
    }
  }, [fs, router]);

  const daysSinceLastUpdate = lastUpdate ? differenceInDays(new Date(), lastUpdate) : 8;
  const isRestricted = daysSinceLastUpdate < 7;
  const daysRemaining = 7 - daysSinceLastUpdate;

  const handleSave = async () => {
    if (isRestricted) return;

    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { 
        name: name.trim(), 
        nameLastUpdatedAt: new Date(),
        updatedAt: new Date() 
      }, { merge: true });
      
      toast({ title: 'Modifié !', description: 'Votre nom a été mis à jour.' });
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
          disabled={saving || !name.trim() || isRestricted}
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
              Nom
            </h1>
            <p className="text-[11px] font-bold text-neutral-400 leading-tight">
              Tu ne peux modifier ton nom qu'une fois tous les 7 jours.
            </p>
          </div>

          {isRestricted && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start animate-fade-up">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Modification restreinte</p>
                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                  Vous avez modifié votre nom récemment. Vous pourrez le changer à nouveau dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
              Nom complet
            </label>
            <div className="relative group w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <Input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Yannick Koffi"
                className="pl-12 pr-12 border-none shadow-md w-full"
                autoFocus={!isRestricted}
                disabled={isRestricted}
              />
              {name.length > 0 && !isRestricted && (
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
