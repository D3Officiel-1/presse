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
  Contact,
  QrCode,
  Facebook,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, query, getDocs, limit, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-white text-neutral-900 pb-20 overflow-x-hidden selection:bg-primary/10">
      {/* Header TikTok Style */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="p-1 text-neutral-900 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold text-neutral-900">Trouver des amis</h1>
        <div className="w-8" /> {/* Spacer */}
      </header>

      <main className="max-w-md mx-auto">
        {/* Search Bar Section */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" />
            <Input 
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-neutral-100 border-none rounded-md text-base shadow-none focus-visible:ring-0 placeholder:text-neutral-500 font-medium"
            />
          </div>
        </div>

        {/* Invite Friends Options */}
        <div className="px-4 space-y-0.5">
          <div className="flex items-center justify-between py-4 group cursor-pointer active:bg-neutral-50 rounded-xl transition-colors px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ff0050]/5 flex items-center justify-center">
                <Contact className="w-5 h-5 text-[#ff0050]" />
              </div>
              <span className="text-[15px] font-bold">Contacts</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-400 font-medium">Trouver</span>
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 group cursor-pointer active:bg-neutral-50 rounded-xl transition-colors px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00f2ea]/5 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-[#00f2ea]" />
              </div>
              <span className="text-[15px] font-bold">Amis Facebook</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-400 font-medium">Trouver</span>
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 group cursor-pointer active:bg-neutral-50 rounded-xl transition-colors px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-neutral-600" />
              </div>
              <span className="text-[15px] font-bold">Mon Code QR</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </div>
        </div>

        {/* Suggestions Title */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
            <h2 className="text-[13px] font-bold text-neutral-900">Comptes suggérés</h2>
          </div>
        </div>

        {/* User List */}
        <div className="px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Chargement...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-neutral-50">
              {filteredUsers.map((item) => {
                const isFollowing = followingIds.includes(item.uid);
                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={item.uid}
                    className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden bg-neutral-100 shrink-0">
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
                        <h4 className="font-bold text-[15px] text-neutral-900 truncate flex items-center gap-1">
                          {item.username || 'createur_zap'}
                          <span className="w-3.5 h-3.5 bg-sky-400 rounded-full flex items-center justify-center text-white shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                          </span>
                        </h4>
                        <p className="text-[13px] font-medium text-neutral-400 truncate">
                          {item.name || 'Élève créateur'}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-[150px]">
                          {item.company || 'Établissement ZAP'}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleFollow(item.uid)}
                      variant={isFollowing ? "outline" : "default"}
                      className={cn(
                        "h-8 px-5 rounded-[4px] text-[13px] font-bold transition-all active:scale-95 shadow-none border-none",
                        !isFollowing 
                          ? "bg-[#fe2c55] hover:bg-[#e6284d] text-white" 
                          : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                      )}
                    >
                      {isFollowing ? 'Abonné' : 'Suivre'}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 px-10">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-neutral-200" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-neutral-800">Aucun créateur trouvé</p>
                <p className="text-[13px] text-neutral-400 leading-relaxed">Nous n'avons trouvé personne correspondant à votre recherche.</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="pt-12 pb-24 px-10 text-center">
          <p className="text-[12px] leading-relaxed text-neutral-400 font-medium">
            Trouve des amis pour collaborer sur tes prochains projets ZAP! Studio et partager vos meilleures créations scolaires.
          </p>
        </div>
      </main>
    </div>
  );
}
