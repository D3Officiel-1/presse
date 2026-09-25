'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Check, 
  Sparkles, 
  Loader2,
  Users,
  QrCode
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, query, getDocs, limit, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FindFriendsPage(props: { params: Promise<any>; searchParams: Promise<any> }) {
  const _params = React.use(props.params);
  const _searchParams = React.use(props.searchParams);
  
  const router = useRouter();
  const fs = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !fs) return;

    const userRef = doc(fs, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setFollowingIds(snap.data().following || []);
      }
    });

    const fetchSuggestions = async () => {
      try {
        const usersRef = collection(fs, 'users');
        const q = query(usersRef, limit(30));
        const snap = await getDocs(q);
        const users = snap.docs
          .map(d => ({ uid: d.id, ...d.data() }))
          .filter(u => u.uid !== user.uid);
        
        setSuggestedUsers(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    return () => unsubUser();
  }, [user?.uid, fs]);

  const handleFollow = async (targetUid: string) => {
    if (!user?.uid || !fs) return;
    
    const isFollowing = followingIds.includes(targetUid);
    const userRef = doc(fs, 'users', user.uid);

    try {
      await updateDoc(userRef, {
        following: isFollowing ? arrayRemove(targetUid) : arrayUnion(targetUid)
      });
      
      toast({
        title: isFollowing ? 'Abonnement retiré' : 'Abonné !',
        description: isFollowing ? 'Vous ne suivez plus ce créateur.' : 'Vous suivez maintenant ce créateur.',
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour.' });
    }
  };

  const filteredUsers = suggestedUsers.filter(u => 
    (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1 active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold">Trouver des amis</h1>
        <button onClick={() => router.push('/zap/scanner')} className="p-1 active:scale-90 transition-transform">
          <QrCode className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-neutral-100 border-none rounded-md text-base"
            />
          </div>
        </div>

        <div className="px-6 pt-2 pb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
          <h2 className="text-[13px] font-bold">Comptes suggérés</h2>
        </div>

        <div className="px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-neutral-50">
              {filteredUsers.map((item) => {
                const isFollowing = followingIds.includes(item.uid);
                return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.uid} className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-neutral-50/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden bg-neutral-100 shrink-0">
                        <img src={`https://picsum.photos/seed/${item.username || item.uid}/120/120`} alt={item.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[15px] truncate flex items-center gap-1">
                          {item.username || 'createur_zap'}
                          <Check className="w-3 h-3 bg-sky-400 rounded-full text-white p-0.5" />
                        </h4>
                        <p className="text-[13px] text-neutral-400 truncate">{item.name || 'Élève créateur'}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleFollow(item.uid)}
                      className={cn(
                        "h-8 px-5 rounded-[4px] text-[13px] font-bold shadow-none border-none",
                        !isFollowing ? "bg-[#fe2c55] text-white" : "bg-neutral-100 text-neutral-900"
                      )}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-24 text-center px-10">
              <Users className="w-10 h-10 text-neutral-200 mb-4" />
              <p className="text-base font-bold text-neutral-800">Aucun créateur trouvé</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
