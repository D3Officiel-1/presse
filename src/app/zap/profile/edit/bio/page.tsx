'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditBioPage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  const [bio, setBio] = useState('');
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
        if (snap.exists()) setBio(snap.data().bio || '');
        setLoading(false);
      });
    }
  }, [fs, router]);

  const handleSave = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSaving(true);
    try {
      await setDoc(doc(fs, 'users', uid), { bio: bio.trim(), updatedAt: new Date() }, { merge: true });
      toast({ title: 'Modifié !', description: 'Votre bio a été mise à jour.' });
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
        <h1 className="text-sm font-black text-neutral-950">Biographie</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="text-sm font-black text-primary disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </button>
      </header>
      <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
        <div className="border-b border-neutral-200 pb-2">
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value.substring(0, BIO_LIMIT))}
            placeholder="Décrivez votre univers créatif en quelques mots..."
            rows={3}
            className="w-full bg-transparent border-none outline-none text-base font-medium resize-none focus:ring-0"
            autoFocus
            maxLength={BIO_LIMIT}
          />
          <div className="flex justify-end text-[11px] font-bold text-neutral-400">
            {bio.length}/{BIO_LIMIT}
          </div>
        </div>
        <p className="text-xs text-neutral-400 leading-normal font-medium">
          Présentez succinctement vos passions (VFX, montage, réalisation, comédie, danse...) pour inspirer les autres élèves de la communauté ZAP.
        </p>
      </main>
    </div>
  );
}
