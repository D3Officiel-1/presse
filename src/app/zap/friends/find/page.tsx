'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Check, 
  Sparkles, 
  Loader2,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs, limit, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FindFriendsPage() {
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

    // Listen to current user's following list
    const userRef = doc(fs, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setFollowingIds(snap.data().following || []);
      }
    });

    // Fetch initial suggestions (e.g., from the same institution or general)
    const fetchSuggestions = async () => {
      try {
        const usersRef = collection(fs, 'users');
        // Simple suggestion: fetch 10 random users
        const q = query(usersRef, limit(20));
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
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour votre abonnement.',
      });
    }
  };

  const filteredUsers = suggestedUsers.filter(u => 
    (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-1 text-neutral-900 hover:bg-neutral-50 rounded-full transition active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-neutral-900">Trouver des amis</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Rechercher des créateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 bg-neutral-100 border-none rounded-xl text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        {/* Suggestions Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-primary fill-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">Suggestions pour vous</h2>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Recherche en cours...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((item) => {
                const isFollowing = followingIds.includes(item.uid);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.uid}
                    className="flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 shrink-0">
                        <img 
                          src={`https://picsum.photos/seed/${item.username || item.uid}/120/120`} 
                          alt={item.username} 
                          className="w-full h-full object-cover" 
                        />
                        {item.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="font-bold text-sm text-neutral-900 truncate flex items-center gap-1">
                          {item.username || 'createur_zap'}
                          <span className="w-3 h-3 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                            <Check className="w-2 h-2 stroke-[4]" />
                          </span>
                        </h4>
                        <p className="text-[11px] font-medium text-neutral-400 truncate max-w-[140px]">
                          {item.company || 'Élève créateur'}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleFollow(item.uid)}
                      variant={isFollowing ? "outline" : "default"}
                      className={cn(
                        "h-8 px-4 rounded-lg text-[12px] font-black transition-all active:scale-95 shadow-none",
                        !isFollowing ? "bg-primary text-white border-none hover:bg-primary/90" : "border-neutral-200 text-neutral-600"
                      )}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </Button>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-neutral-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-800">Aucun résultat</p>
                  <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">Essayez une recherche différente pour trouver des amis.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informative Footer */}
        <div className="pt-8 px-6 text-center">
          <p className="text-[11px] leading-relaxed text-neutral-400 font-medium">
            Connectez-vous avec d'autres élèves de votre établissement pour collaborer sur vos futurs projets créatifs.
          </p>
        </div>
      </main>
    </div>
  );
}
