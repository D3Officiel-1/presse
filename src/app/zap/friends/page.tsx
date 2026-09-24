'use client';

import React, { useState, useEffect } from 'react';
import { Users, Flame, Award, PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export default function FriendsPage() {
  const { toast } = useToast();
  const fs = useFirestore();
  const [profile, setProfile] = useState<any>(null);
  const [newPostText, setNewPostText] = useState('');
  const [friendsPosts, setFriendsPosts] = useState([
    { id: 'f-1', user: 'marie_kh', name: 'Marie Koné', school: 'Lycée Moderne Marcory', action: 'a partagé un nouveau script de court-métrage', time: 'Il y a 5 min', avatarSeed: 'marie' },
    { id: 'f-2', user: 'gilles_art', name: 'Gilles Touré', school: 'Collège Notre Dame', action: 'a remporté le ZAP d\'Or de la semaine en montage', time: 'Il y a 2h', avatarSeed: 'gilles' },
    { id: 'f-3', user: 'fatim_creative', name: 'Fatim Cissé', school: 'Lycée Moderne Amagou', action: 'recherche un cadreur pour son projet de science', time: 'Il y a 5h', avatarSeed: 'fatim' }
  ]);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid && fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => snap.exists() && setProfile(snap.data()));
    }
  }, [fs]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `f-custom-${Date.now()}`,
      user: profile?.username || 'mon_pseudo',
      name: profile?.name || 'Moi',
      school: profile?.company || 'Mon Établissement',
      action: newPostText.trim(),
      time: 'À l\'instant',
      avatarSeed: 'moi'
    };

    setFriendsPosts([newPost, ...friendsPosts]);
    setNewPostText('');
    toast({
      title: 'Publié !',
      description: 'Votre idée a été partagée sur le mur de l\'école.',
    });
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] pt-6 bg-[#F9F9FC] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-neutral-950">
            Mon Équipe <Badge variant="default" className="text-[10px] font-mono">{profile?.commune || 'Abidjan'}</Badge>
          </h2>
          <p className="text-xs text-neutral-500 font-medium">Le fil d'actualité créatif de votre école.</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-neutral-900 via-purple-950 to-neutral-900 rounded-[2rem] text-white shadow-lg border border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <Award className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5 fill-primary stroke-none animate-bounce" /> Challenge en cours
        </div>
        <h3 className="font-black text-base mt-1 tracking-tight">ZAP d'Or de l'Établissement</h3>
        <p className="text-xs text-neutral-300 mt-1">
          Votre école <strong>{profile?.company || 'Chargement...'}</strong> concourt pour le meilleur court-métrage de la commune.
        </p>
      </div>

      <form onSubmit={handleCreatePost} className="p-4 bg-white rounded-3xl border border-neutral-200/80 shadow-sm space-y-3">
        <div className="flex gap-2.5 items-start">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black uppercase">
            {profile?.name?.substring(0,2) || 'Z'}
          </div>
          <Input 
            placeholder="Partager une idée ou un besoin..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            className="border-none focus-visible:ring-0 px-0 placeholder:text-neutral-400 text-base font-medium bg-transparent"
          />
        </div>
        <div className="flex justify-end pt-2 border-t border-neutral-100">
          <Button type="submit" size="sm" className="rounded-xl px-4 text-xs font-bold gap-1.5">
            <PenSquare className="w-3.5 h-3.5" /> Publier
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Publications récentes</p>
        {friendsPosts.map((post) => (
          <div key={post.id} className="p-4 bg-white rounded-3xl border border-neutral-200/60 shadow-sm flex gap-3 items-start hover:border-neutral-300 transition-all">
            <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
              <img src={`https://picsum.photos/seed/${post.avatarSeed}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-neutral-900">@{post.user}</h4>
                <span className="text-[10px] font-bold text-neutral-400 font-mono">{post.time}</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">{post.action}</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-wider pt-0.5">{post.school}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
