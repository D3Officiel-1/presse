'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

export default function EditUsernamePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
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
        if (snap.exists()) setUsername(snap.data().username || '');
        setLoading(false);
      });
    }
  }, [fs, router]);

  const handleSave = async () => {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) return;
    
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { username: cleanUsername, updatedAt: new Date() }, { merge: true });
      toast({ title: 'Modifié !', description: 'Votre pseudo a été mis à jour.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Pseudo indisponible ou erreur.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const cleanVal = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  return (
    <div className="min-h-screen bg-white text-neutral-900 animate-fade-up">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm font-bold text-neutral-600">Annuler</button>
        <h1 className="text-sm font-black text-neutral-950">Nom d'utilisateur</h1>
        <button 
          onClick={handleSave} 
          disabled={saving || !cleanVal}
          className="text-sm font-black text-primary disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </button>
      </header>
      <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
        <div className="relative border-b border-neutral-200 pb-1 flex items-center justify-between">
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="Pseudo unique"
            className="w-full bg-transparent border-none outline-none text-base font-mono font-bold py-1.5 focus:ring-0"
            autoFocus
          />
          {cleanVal.length >= 3 && <Check className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
        </div>
        <div className="space-y-3">
          <p className="text-xs text-primary font-bold tracking-tight">zap.ci/@{cleanVal || 'votre_pseudo'}</p>
          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            Les pseudos uniques ne peuvent contenir que des lettres minuscules, des chiffres, des tirets du bas (_) et des traits d'union (-). La modification de votre pseudo changera également le lien vers votre portfolio créatif public ZAP.
          </p>
        </div>
      </main>
    </div>
  );
}
