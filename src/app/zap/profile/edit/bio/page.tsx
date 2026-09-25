'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TextQuote, X, AtSign, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

interface SuggestionUser {
  uid: string;
  username: string;
  name: string;
}

export default function EditBioPage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [bio, setBio] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  
  const BIO_LIMIT = 180;

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
        
        getDocs(query(collection(fs, 'users'), limit(10))).then(usersSnap => {
          const fetched: SuggestionUser[] = [];
          usersSnap.forEach(uDoc => {
            const data = uDoc.data();
            if (data.username && uDoc.id !== uid) {
              fetched.push({
                uid: uDoc.id,
                username: data.username,
                name: data.name || data.username
              });
            }
          });
          
          if (fetched.length === 0) {
            setSuggestions([
              { uid: 'u1', username: 'yannick_vfx', name: 'Yannick Koffi' },
              { uid: 'u2', username: 'amina_diop', name: 'Aminata Diop' },
              { uid: 'u3', username: 'marc_dance', name: 'Marc-Aurèle Yao' }
            ]);
          } else {
            setSuggestions(fetched);
          }
          setLoading(false);
        }).catch(() => {
          setSuggestions([
            { uid: 'u1', username: 'yannick_vfx', name: 'Yannick Koffi' },
            { uid: 'u2', username: 'amina_diop', name: 'Aminata Diop' },
            { uid: 'u3', username: 'marc_dance', name: 'Marc-Aurèle Yao' }
          ]);
          setLoading(false);
        });
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

  const handleSelectMention = (username: string) => {
    const mentionStr = `@${username} `;
    if ((bio + mentionStr).length > BIO_LIMIT) return;
    setBio(prev => (prev + mentionStr).substring(0, BIO_LIMIT));
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
                className="pl-12 pr-12 min-h-[140px] bg-white/70 backdrop-blur-sm border border-neutral-200/80 rounded-2xl text-base font-medium focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary shadow-sm resize-none pt-3"
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
            
            <div className="flex items-center justify-between px-1 pt-1">
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-black tracking-tight shadow-sm hover:bg-neutral-800 transition-all"
              >
                <AtSign className="w-3.5 h-3.5" /> Mentionner
              </button>

              <div className="text-[11px] font-bold text-neutral-400">
                {bio.length}/{BIO_LIMIT}
              </div>
            </div>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="pt-2 space-y-2"
                >
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1 px-1">
                    <Sparkles className="w-3 h-3 text-primary fill-primary" /> Créateurs suivis & membres
                  </p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-0.5 px-0.5">
                    {suggestions.map((user) => (
                      <button
                        key={user.uid}
                        type="button"
                        onClick={() => handleSelectMention(user.username)}
                        className="flex items-center gap-2 p-2 bg-white border border-neutral-200 hover:border-primary/40 rounded-2xl shrink-0 text-left shadow-sm active:scale-95 transition-all"
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
                          <img src={`https://picsum.photos/seed/${user.username}/60/60`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="pr-1">
                          <p className="text-[11px] font-black text-neutral-900 leading-tight">@{user.username}</p>
                          <p className="text-[9px] font-bold text-neutral-400 max-w-[90px] truncate leading-none mt-0.5">{user.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </main>
    </div>
  );
}