'use client';

import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Heart, 
  Lock, 
  Bookmark, 
  Share2, 
  Edit2, 
  LogOut,
  Check,
  Play,
  MoreHorizontal,
  MapPin,
  Link2,
  Globe,
  UserCheck,
  MessageCircle,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import placeholderData from '@/lib/placeholder-images.json';

const ACCOUNT_CATEGORIES = [
  "Créateur Digital", 
  "Monteur VFX", 
  "Scénariste", 
  "Acteur/Humoriste", 
  "Danseur Urbain", 
  "Cadreur / Réalisateur"
];

export default function TikTokProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  // États du profil utilisateur
  const [profile, setProfile] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'bookmarked'>('videos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSimulatingFollow, setIsSimulatingFollow] = useState(false);

  // Formulaire d'édition du profil
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCommune, setEditCommune] = useState('');
  const [editCategory, setEditCategory] = useState('Créateur Digital');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Récupération des placeholders de la galerie
  const mediaImages = placeholderData.placeholderImages.filter(img => img.id.startsWith('media-'));

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }

    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          // Initialisation des champs d'édition
          setEditName(data.name || '');
          setEditBio(data.bio || "Pas encore de description de créateur.");
          setEditLink(data.link || 'zap.ci/studio');
          setEditCommune(data.commune || 'Abidjan');
          setEditCategory(data.category || 'Créateur Digital');
          setEditIsPublic(data.isPublic !== false);
        }
        setIsHydrated(true);
      }).catch(() => {
        setIsHydrated(true);
      });
    }
  }, [fs, router]);

  const handleSaveProfile = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;
    setSavingProfile(true);

    const updatePayload = { 
      name: editName,
      bio: editBio, 
      link: editLink,
      commune: editCommune,
      category: editCategory,
      isPublic: editIsPublic
    };

    try {
      await setDoc(doc(fs, 'users', uid), updatePayload, { merge: true });
      setProfile((prev: any) => ({ ...prev, ...updatePayload }));
      toast({ title: 'Profil mis à jour !', description: 'Vos modifications ont été enregistrées avec succès.' });
      setIsEditModalOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder les données.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast({ title: 'Déconnexion', description: 'À bientôt sur ZAP !' });
    router.replace('/auth');
  };

  const handleShareProfile = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/zap/profile`);
      toast({ title: 'Lien copié !', description: 'Le lien d\'accès à votre profil a été partagé.' });
    }
  };

  if (!isHydrated || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-neutral-400 space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider opacity-60">Chargement de votre Pass...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-28 font-sans max-w-xl mx-auto border-x border-neutral-100 shadow-sm relative">
      
      {/* Barre de navigation haute TikTok Style */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 flex items-center justify-between px-4 h-14 border-b border-neutral-100">
        <div className="w-10">
          <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
            {profile.classe || 'Pass'}
          </span>
        </div>
        
        <h1 className="font-black text-sm tracking-tight text-neutral-950 flex items-center gap-1">
          {profile.name || 'Mon Profil'}
          <span className="w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center text-white shrink-0" title="Compte Vérifié">
            <Check className="w-2.5 h-2.5 stroke-[4]" />
          </span>
        </h1>

        <div className="flex items-center gap-1">
          <button onClick={handleShareProfile} className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition" title="Partager le profil">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={() => toast({ title: 'Paramètres', description: 'Options de confidentialité TikTok activées.' })} className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Identité Centrale Visuelle */}
      <div className="flex flex-col items-center pt-5 pb-4 px-6 text-center space-y-3">
        {/* Photo d'avatar avec anneau dégradé dynamique */}
        <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-primary to-orange-500 shadow-sm">
          <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-neutral-100 flex items-center justify-center text-neutral-900 font-black text-3xl uppercase tracking-tighter">
            {profile.name?.substring(0, 2) || '@'}
          </div>
          {profile.isPublic !== false ? (
            <span className="absolute bottom-0 right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow" title="Compte Public">
              <Globe className="w-3 h-3" />
            </span>
          ) : (
            <span className="absolute bottom-0 right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white shadow" title="Compte Privé">
              <Lock className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Noms et Badge de certification */}
        <div className="space-y-0.5">
          <h2 className="text-base font-black tracking-tight text-neutral-950 flex items-center justify-center gap-1">
            @{profile.username || 'username'}
            <span className="w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" title="Vérifié par l'établissement">
              <Check className="w-2.5 h-2.5 stroke-[4]" />
            </span>
          </h2>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-primary">
            {profile.category || 'Créateur Digital'}
          </p>
        </div>

        {/* Boutons d'actions principaux TikTok */}
        <div className="flex items-center justify-center gap-2 w-full max-w-sm pt-1">
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            variant="outline" 
            className="flex-1 h-10 border-neutral-200 text-xs font-black bg-neutral-50 rounded-md text-neutral-900 hover:bg-neutral-100 transition-all active:scale-[0.98]"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5 text-neutral-500" /> Modifier le profil
          </Button>

          <Button 
            onClick={() => {
              setIsSimulatingFollow(!isSimulatingFollow);
              toast({
                title: !isSimulatingFollow ? 'Abonnement activé' : 'Abonnement retiré',
                description: 'Simulation de vue visiteur public.'
              });
            }}
            variant={isSimulatingFollow ? "secondary" : "default"}
            className={cn("h-10 text-xs font-black px-4 rounded-md transition-all active:scale-[0.98]", !isSimulatingFollow && "bg-neutral-900 text-white hover:bg-neutral-800 shadow-none")}
          >
            {isSimulatingFollow ? (
              <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Suivi</span>
            ) : 'Suivre'}
          </Button>

          <Button
            onClick={() => router.push('/zap/chat')}
            variant="outline"
            className="h-10 w-10 border-neutral-200 rounded-md flex items-center justify-center p-0 bg-neutral-50 hover:bg-neutral-100"
            title="Envoyer un message privé"
          >
            <MessageCircle className="w-4 h-4 text-neutral-700" />
          </Button>
        </div>

        {/* Ligne des compteurs officiels TikTok */}
        <div className="flex items-center justify-center gap-8 w-full py-3.5 border-y border-neutral-100 text-center">
          <div className="flex flex-col items-center">
            <span className="font-black text-base text-neutral-950 tracking-tight">142</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">abonnements</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-base text-neutral-950 tracking-tight">3.5 K</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">abonnés</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-base text-neutral-950 tracking-tight">18.2 K</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">j'aime</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-base text-neutral-950 tracking-tight">8</span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">vidéos</span>
          </div>
        </div>

        {/* Bloc Biographie complète, Lien Externe et Ville */}
        <div className="w-full text-left space-y-2 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100">
          <p className="text-xs text-neutral-700 font-medium leading-relaxed whitespace-pre-line">
            {profile.bio || "Pas encore de description de créateur configurée."}
          </p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] font-bold text-neutral-500">
            <span className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
              <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />
              {profile.link || 'zap.ci/studio'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {profile.commune || 'Abidjan'}, Côte d'Ivoire
            </span>
            <span className="flex items-center gap-1 text-neutral-400">
              🏫 {profile.company || 'Établissement Club'}
            </span>
          </div>
        </div>
      </div>

      {/* Sélecteur d'onglets TikTok Icons */}
      <div className="flex border-b border-neutral-100 bg-white sticky top-14 z-30">
        {[
          { id: 'videos', icon: Grid },
          { id: 'liked', icon: Heart },
          { id: 'bookmarked', icon: Bookmark }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-3 flex items-center justify-center relative transition-colors outline-none",
                isSelected ? "text-neutral-950" : "text-neutral-300 hover:text-neutral-400"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isSelected && "scale-110", isSelected && tab.id === 'liked' && "fill-neutral-950 text-neutral-950")} />
              {isSelected && (
                <motion.div 
                  layoutId="tiktokActiveLineTab" 
                  className="absolute bottom-0 inset-x-12 h-0.5 bg-neutral-950 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Grille de miniatures vidéos 3 colonnes comme sur TikTok */}
      <div className="p-0.5">
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
                  className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer group active:opacity-95"
                  onClick={() => router.push('/zap')}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={img.description} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={img.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-black text-white flex items-center gap-0.5 drop-shadow-sm">
                    <Play className="w-2.5 h-2.5 fill-white stroke-none" /> 2.4 K
                  </span>
                </div>
              ))}

              {[1, 2, 3, 4, 5].map((num) => (
                <div 
                  key={`fallback-grid-${num}`}
                  className="relative aspect-[3/4] bg-neutral-950 overflow-hidden cursor-pointer group active:opacity-95"
                  onClick={() => router.push('/zap')}
                >
                  <img 
                    src={`https://picsum.photos/seed/tiktok-grid-${num}/300/400`} 
                    alt="Miniature" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-black text-white flex items-center gap-0.5 drop-shadow-sm">
                    <Play className="w-2.5 h-2.5 fill-white stroke-none" /> {num * 342}
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
              className="flex flex-col items-center justify-center py-20 text-center text-neutral-400 space-y-2 px-6"
            >
              <Lock className="w-7 h-7 text-neutral-300 stroke-[2.5]" />
              <p className="text-xs font-black text-neutral-800 uppercase tracking-wider">Vidéos aimées privées</p>
              <p className="text-[11px] max-w-xs leading-normal font-medium text-neutral-400">Les vidéos aimées par cet élève créateur sont masquées conformément aux options de confidentialité de l'école.</p>
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
              {[2, 4].map((num) => (
                <div 
                  key={`fav-grid-${num}`}
                  className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer"
                  onClick={() => router.push('/zap')}
                >
                  <img 
                    src={`https://picsum.photos/seed/fav-img-${num}/300/400`} 
                    alt="Favoris enregistré" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section basse : Déconnexion rapide d'urgence */}
      <div className="p-4 flex justify-center pt-8">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-xs font-bold text-neutral-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Déconnecter mon pass de l'appareil
        </Button>
      </div>

      {/* Modal / Slide-up Drawer de modification complète du profil */}
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
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[2.5rem] max-h-[85vh] overflow-y-auto p-6 z-50 space-y-5 text-left shadow-2xl border-t border-neutral-100 max-w-xl mx-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-black text-sm text-neutral-950 uppercase tracking-tight flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Mettre à jour mon Pass
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-md"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4">
                {/* Nom d'affichage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Nom complet affiché</label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="text-sm font-bold bg-neutral-50 border-neutral-200 rounded-xl h-11 focus-visible:ring-primary/20"
                    placeholder="Ex: Jean-Marc Yao"
                  />
                </div>

                {/* Catégorie Professionnelle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Catégorie Créateur</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCOUNT_CATEGORIES.map((cat) => {
                      const isSelected = editCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditCategory(cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                            isSelected 
                              ? "bg-neutral-950 text-white border-neutral-950 shadow-sm" 
                              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Biographie de créateur */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Biographie / Slogan</label>
                  <Textarea 
                    value={editBio} 
                    onChange={(e) => setEditBio(e.target.value)} 
                    className="text-xs font-medium bg-neutral-50 border-neutral-200 rounded-xl min-h-[80px] focus-visible:ring-primary/20"
                    placeholder="Racontez votre univers en quelques mots..."
                  />
                </div>

                {/* Lien dans la bio */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Lien personnalisé (Portfolio, YouTube...)</label>
                  <Input 
                    value={editLink} 
                    onChange={(e) => setEditLink(e.target.value)} 
                    className="text-sm font-bold bg-neutral-50 border-neutral-200 rounded-xl h-11 focus-visible:ring-primary/20 font-mono"
                    placeholder="zap.ci/ton-portfolio"
                  />
                </div>

                {/* Commune / Localisation */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Commune d'Abidjan</label>
                  <Input 
                    value={editCommune} 
                    onChange={(e) => setEditCommune(e.target.value)} 
                    className="text-sm font-bold bg-neutral-50 border-neutral-200 rounded-xl h-11 focus-visible:ring-primary/20"
                    placeholder="Ex: Marcory, Koumassi..."
                  />
                </div>

                {/* Visibilité publique ou privée */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-black text-neutral-900 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-neutral-500" /> Mode Compte Public
                    </p>
                    <p className="text-[10px] font-medium text-neutral-400">Permet à tout le club de voir vos statistiques et vos vidéos.</p>
                  </div>
                  <Switch 
                    checked={editIsPublic} 
                    onCheckedChange={(checked) => setEditIsPublic(checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={savingProfile} 
                className="w-full bg-primary text-white font-black h-12 rounded-xl text-xs uppercase tracking-wider shadow-md mt-4 transition-all"
              >
                {savingProfile ? "Mise à jour en cours..." : "Sauvegarder mon Pass Digital"}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
