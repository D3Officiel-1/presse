'use client';

import React, { useEffect, useState } from 'react';
import { LogOut, GraduationCap, Briefcase, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const INTEREST_OPTIONS = ["VFX & 3D", "Montage Vidéo", "Scénario", "Humour & Acting", "Danse", "Musique", "Cadrage"];

export default function ProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid && fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setEditBio(data.bio || '');
          setEditInterests(data.interests || []);
        }
      });
    }
  }, [fs]);

  const handleSaveProfile = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(fs, 'users', uid), { bio: editBio, interests: editInterests }, { merge: true });
      setProfile((prev: any) => ({ ...prev, bio: editBio, interests: editInterests }));
      toast({ title: 'Profil mis à jour' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleInterestTag = (interest: string) => {
    setEditInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast({ title: 'Déconnexion' });
    router.replace('/auth');
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] pt-6 bg-[#F9F9FC] min-h-screen">
      <div className="bg-white border border-neutral-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-200 p-6 border-b border-neutral-100 flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 bg-primary rounded-[2.2rem] flex items-center justify-center text-white text-2xl font-black border-2 border-white">
            {profile?.name?.substring(0, 2) || 'Z'}
          </div>
          <div>
            <h3 className="text-lg font-black text-neutral-950">{profile?.name || 'Créateur'}</h3>
            <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest mt-0.5">Matricule : {profile?.matricule}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs font-bold uppercase">
              <GraduationCap className="w-4 h-4 text-primary" /> Classe : {profile?.classe?.toUpperCase()}
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs font-bold">
              <Briefcase className="w-4 h-4 text-neutral-900" /> {profile?.company || 'Établissement'}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Ma Biographie</label>
            <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="text-base rounded-xl bg-neutral-50/50" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Spécialités</label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((interest) => (
                <button key={interest} onClick={() => handleToggleInterestTag(interest)} className={cn("px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all", editInterests.includes(interest) ? "bg-primary text-white border-primary" : "bg-white text-neutral-600 border-neutral-200")}>
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full bg-neutral-900 text-white rounded-xl h-11 text-xs">
            {savingProfile ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
          <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-11 text-xs text-rose-600 border-rose-100 bg-rose-50/30">
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
