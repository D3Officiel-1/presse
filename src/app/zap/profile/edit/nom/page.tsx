'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-white text-neutral-900 animate-fade-up">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm font-bold text-neutral-600">Annuler</button>
        <h1 className="text-sm font-black text-neutral-950">Nom</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="text-sm font-black text-primary disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </button>
      </header>
      <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
        <div className="relative border-b border-neutral-200 pb-1 flex items-center justify-between">
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ajouter votre nom"
            className="w-full bg-transparent border-none outline-none text-base font-medium py-1.5 focus:ring-0"
            autoFocus
          />
          {name.trim().length > 0 && <Check className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
        </div>
      </main>
    </div>
  );
}
