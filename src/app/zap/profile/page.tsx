'use client';

import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Heart, 
  Lock, 
  Bookmark, 
  Settings, 
  Share2, 
  Edit2, 
  LogOut,
  Check,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import placeholderData from '@/lib/placeholder-images.json';

const INTEREST_OPTIONS = ["VFX & 3D", "Montage Vidéo", "Scénario", "Humour", "Danse", "Musique", "Cadrage"];

export default function TikTokProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editName, setEditName] = useState('');
  const [editClasse, setEditClasse] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'bookmarked'>('videos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const mediaImages = placeholderData.placeholderImages.filter(img => img.id.startsWith('media-'));

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid && fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setEditBio(data.bio || "Pas encore de description.");
          setEditInterests(data.interests || []);
          setEditName(data.name || '');
          setEditClasse(data.classe || '3e');
        }
      });
    }
  }, [fs]);

  const handleSaveProfile = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSavingProfile(true);
    try {
      const updatePayload = { 
        bio: editBio, 
        interests: editInterests,
        name: editName,
        classe: editClasse
      };
      await setDoc(doc(fs, 'users', uid), updatePayload, { merge: true });
      setProfile((prev: any) => ({ ...prev, ...updatePayload }));
      toast({ title: 'Succès', description: 'Profil mis à jour.' });
      setIsEditModalOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleInterestTag = (interest: string) => {
    setEditInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    toast({ title: 'Déconnexion', description: 'À bientôt sur ZAP !' });
    router.replace('/auth');
  };

  const handleShareProfile = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/zap/profile`);
      toast({ title: 'Lien copié !', description: 'Lien du profil copié dans le presse-papiers.' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-24 font-sans select-none max-w-2xl mx-auto border-x border-neutral-100 shadow-sm">
      
      {/* Top sticky bar matching iOS/TikTok header action */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 flex items-center justify-between px-4 h-14 border-b border-neutral-100">
        <h1 className="font-bold text-base tracking-tight text-neutral-900 mx-auto">
          {profile?.name || 'Profil'}
        </h1>
        <div className="absolute right-4 flex items-center gap-1">
          <button onClick={handleShareProfile} className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-full transition">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main TikTok User Block */}
      <div className="px-6 pt-6 pb-4 space-y-4">
        <div className="flex items-center gap-5">
          {/* Large round Avatar with primary gradient border ring */}
          <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-primary to-orange-500 shadow-md">
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-neutral-100 flex items-center justify-center text-neutral-400 font-black text-2xl uppercase">
              {profile?.name?.substring(0, 2) || '@'}
            </div>
          </div>

          {/* Core profile details */}
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
              @{profile?.username || 'username'}
              <span className="text-[10px] bg-neutral-100 text-neutral-600 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                {profile?.classe || '6e'}
              </span>
            </h2>
            <p className="text-sm font-medium text-neutral-500">
              {profile?.name || 'Nom complet'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                variant="outline" 
                size="sm" 
                className="h-9 px-4 rounded-md border-neutral-200 text-xs font-bold bg-neutral-50 text-neutral-900 hover:bg-neutral-100"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Modifier le profil
              </Button>
            </div>
          </div>
        </div>

        {/* Counter Stats Band identical to TikTok Layout */}
        <div className="flex items-center justify-start gap-7 py-2 border-y border-neutral-50 text-center">
          <div className="flex items-center gap-1">
            <span className="font-bold text-base text-neutral-900">124</span>
            <span className="text-xs text-neutral-400 font-medium">abonnements</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-base text-neutral-900">4.8K</span>
            <span className="text-xs text-neutral-400 font-medium">abonnés</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-base text-neutral-900">12.5K</span>
            <span className="text-xs text-neutral-400 font-medium">j'aime</span>
          </div>
        </div>

        {/* Biography Block */}
        <div className="space-y-1.5 pt-1">
          <p className="text-sm text-neutral-800 font-normal leading-relaxed whitespace-pre-line">
            {profile?.bio || "Pas encore de description de créateur."}
          </p>
          <p className="text-xs font-semibold text-primary uppercase tracking-tight flex items-center gap-1">
            🏫 {profile?.company || 'Établissement non renseigné'}
          </p>
        </div>

        {/* Badges / Tag pills block */}
        <div className="flex flex-wrap gap-1 pt-1">
          {profile?.interests?.map((tag: string) => (
            <span key={tag} className="text-[10px] bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Selector Navigation Bar like TikTok */}
      <div className="flex border-b border-neutral-200">
        {[
          { id: 'videos', icon: Grid, count: null },
          { id: 'liked', icon: Heart, count: null },
          { id: 'bookmarked', icon: Bookmark, count: null }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-3 flex items-center justify-center relative transition-colors",
                isSelected ? "text-neutral-900" : "text-neutral-400"
              )}
            >
              <Icon className={cn("w-5 h-5", isSelected && tab.id === 'liked' && "fill-neutral-900")} />
              {isSelected && (
                <motion.div 
                  layoutId="tiktokActiveLine" 
                  className="absolute bottom-0 inset-x-12 h-0.5 bg-neutral-900"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents View Grid matching the exact standard TikTok aspect ratio feed */}
      <div className="p-1">
        <AnimatePresence mode="wait">
          {activeTab === 'videos' && (
            <motion.div 
              key="videos" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-0.5"
            >
              {mediaImages.map((img) => (
                <div 
                  key={img.id} 
                  className="relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-pointer group active:opacity-90"
                  onClick={() => router.push('/zap')}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={img.description} 
                    className="w-full h-full object-cover"
                    data-ai-hint={img.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white flex items-center gap-0.5">
                    <Play className="w-2.5 h-2.5 fill-white stroke-none" /> 1.2K
                  </span>
                </div>
              ))}

              {/* Simulation fallback grid values */}
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div 
                  key={`sim-${num}`}
                  className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer group active:opacity-90"
                  onClick={() => router.push('/zap')}
                >
                  <img 
                    src={`https://picsum.photos/seed/pref-${num}/300/400`} 
                    alt="Miniature" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-black text-white flex items-center gap-0.5 drop-shadow">
                    <Play className="w-2.5 h-2.5 fill-white stroke-none" /> {num * 243}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'liked' && (
            <motion.div 
              key="liked" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center text-neutral-400 space-y-2"
            >
              <Lock className="w-8 h-8 text-neutral-300" />
              <p className="text-xs font-bold text-neutral-800">Vidéos aimées masquées</p>
              <p className="text-[11px] max-w-xs leading-normal">Les vidéos aimées par cet utilisateur sont privées conformément aux paramètres TikTok.</p>
            </motion.div>
          )}

          {activeTab === 'bookmarked' && (
            <motion.div 
              key="bookmarked" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-0.5"
            >
              {[3, 1].map((num) => (
                <div 
                  key={`fav-${num}`}
                  className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer"
                  onClick={() => router.push('/zap')}
                >
                  <img 
                    src={`https://picsum.photos/seed/fav-${num}/300/400`} 
                    alt="Favoris" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-up dialog/drawer form simulation for editing matching modern design guidelines */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div 
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 z-50 space-y-5 text-left shadow-2xl border-t border-neutral-100 max-w-2xl mx-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-base text-neutral-900">Modifier le profil</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-600"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Nom complet</label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="text-sm font-bold bg-neutral-50 border-neutral-200 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Classe</label>
                  <Input 
                    value={editClasse} 
                    onChange={(e) => setEditClasse(e.target.value)} 
                    className="text-sm font-bold bg-neutral-50 border-neutral-200 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Description / Biographie</label>
                  <Textarea 
                    value={editBio} 
                    onChange={(e) => setEditBio(e.target.value)} 
                    className="text-xs font-medium bg-neutral-50 border-neutral-200 rounded-lg min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Spécialités créatives</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_OPTIONS.map((interest) => {
                      const isSelected = editInterests.includes(interest);
                      return (
                        <button 
                          key={interest} 
                          type="button"
                          onClick={() => handleToggleInterestTag(interest)} 
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all", 
                            isSelected 
                              ? "bg-neutral-900 text-white border-neutral-900" 
                              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={savingProfile} 
                className="w-full bg-neutral-900 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider shadow-sm mt-4"
              >
                {savingProfile ? "Sauvegarde..." : "Enregistrer les modifications"}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
