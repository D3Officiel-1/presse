'use client';

import React, { useEffect, useState } from 'react';
import { 
  LogOut, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  Award, 
  Film, 
  Heart, 
  Flame, 
  Settings, 
  FolderGit, 
  Layers, 
  Share2, 
  Check, 
  UserCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import placeholderData from '@/lib/placeholder-images.json';

const INTEREST_OPTIONS = ["VFX & 3D", "Montage Vidéo", "Scénario", "Humour & Acting", "Danse", "Musique", "Cadrage"];

export default function ProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editName, setEditName] = useState('');
  const [editClasse, setEditClasse] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'pass' | 'projects' | 'badges' | 'settings'>('pass');

  // Récupération des images depuis le fichier de placeholders officiel
  const mediaImages = placeholderData.placeholderImages.filter(img => img.id.startsWith('media-'));
  const fallbackImage = placeholderData.placeholderImages[0]?.imageUrl;

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid && fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setEditBio(data.bio || "Pas encore de devise de créateur... Écris ton histoire 🎬");
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
      toast({ title: 'Studio ZAP !', description: 'Passeport créateur mis à jour avec succès.' });
      setActiveTab('pass');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder les modifications.' });
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
    toast({ title: 'Déconnexion', description: 'À bientôt dans le Studio ZAP !' });
    router.replace('/auth');
  };

  const handleSharePass = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Rejoins mon Studio ZAP! Je suis @${profile?.username || 'creator'}`);
      toast({ title: 'Lien copié !', description: 'Partage ton pass de créateur avec ton équipe.' });
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+7rem)] pt-6 bg-[#F9F9FC] min-h-screen select-none">
      
      {/* Top modern bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-[1000] tracking-tighter text-neutral-950 uppercase">
            Studio ID <span className="text-primary font-serif italic">!</span>
          </h2>
          <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest">
            {profile?.commune || 'Abidjan Côte d\'Ivoire'}
          </p>
        </div>
        <button 
          onClick={() => setActiveTab(activeTab === 'settings' ? 'pass' : 'settings')}
          className={cn(
            "p-3 rounded-2xl border transition-all active:scale-95",
            activeTab === 'settings' ? "bg-neutral-950 border-neutral-950 text-white" : "bg-white border-neutral-200 text-neutral-600 shadow-sm"
          )}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation tabs row */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-200/50 rounded-2xl border border-neutral-200/30">
        {[
          { id: 'pass', label: 'Mon Pass', icon: UserCircle },
          { id: 'projects', label: 'Projets', icon: Film },
          { id: 'badges', label: 'Succès', icon: Award },
          { id: 'settings', label: 'Profil', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all gap-1",
                isSelected ? "bg-white text-primary shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area based on tabs */}
      <AnimatePresence mode="wait">
        
        {activeTab === 'pass' && (
          <motion.div 
            key="pass" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Holographic ZAP pass ticket representation */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-neutral-950 via-purple-950 to-neutral-950 text-white p-6 shadow-xl border border-white/10 group">
              <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
              
              {/* Card ticket Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Pass Officiel Créateur
                  </span>
                  <h3 className="text-xl font-[1000] tracking-tight mt-1 truncate max-w-[220px]">
                    {profile?.name || 'ZAP Membre'}
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-400 font-bold tracking-tight">
                    @{profile?.username || 'pseudo'}
                  </p>
                </div>
                
                {/* Visual Identity Block */}
                <div className="w-14 h-14 bg-gradient-to-tr from-primary to-orange-500 rounded-2xl flex items-center justify-center text-white text-xl font-[1000] border-2 border-white/20 shadow-md shrink-0">
                  {profile?.name?.substring(0, 2).toUpperCase() || 'ZP'}
                </div>
              </div>

              {/* Card ticket Body data */}
              <div className="py-4 space-y-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-bold">Niveau d'étude :</span> 
                  <span className="bg-white/10 px-2 py-0.5 rounded-md font-mono uppercase text-white font-black text-[10px]">
                    {profile?.classe?.toUpperCase() || '6E'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-neutral-300">
                  <Briefcase className="w-4 h-4 text-neutral-300 shrink-0" />
                  <span className="font-bold truncate max-w-[280px]">
                    {profile?.company || 'Établissement scolaire'}
                  </span>
                </div>

                {editBio && (
                  <p className="text-neutral-400 italic font-medium leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 text-[11px]">
                    "{editBio}"
                  </p>
                )}
              </div>

              {/* Card ticket footer specialties tags */}
              <div className="border-t border-white/10 pt-4 flex flex-wrap gap-1">
                {editInterests.length > 0 ? editInterests.map(tag => (
                  <span key={tag} className="text-[10px] bg-white/10 text-white font-bold px-2.5 py-1 rounded-lg">
                    ⚡ {tag}
                  </span>
                )) : (
                  <span className="text-[10px] text-neutral-500 italic">Aucune spécialité configurée.</span>
                )}
              </div>
            </div>

            {/* Quick dashboard metrics panels grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-white border border-neutral-200/70 rounded-2xl shadow-sm text-center space-y-1">
                <div className="flex justify-center text-primary"><Film className="w-4 h-4" /></div>
                <p className="text-base font-[1000] tracking-tight">12</p>
                <p className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Créations</p>
              </div>

              <div className="p-3 bg-white border border-neutral-200/70 rounded-2xl shadow-sm text-center space-y-1">
                <div className="flex justify-center text-rose-500"><Heart className="w-4 h-4 fill-rose-500 stroke-none" /></div>
                <p className="text-base font-[1000] tracking-tight">4.8 K</p>
                <p className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Likes reçus</p>
              </div>

              <div className="p-3 bg-white border border-neutral-200/70 rounded-2xl shadow-sm text-center space-y-1">
                <div className="flex justify-center text-amber-500"><Flame className="w-4 h-4 fill-amber-500 stroke-none animate-bounce" /></div>
                <p className="text-base font-[1000] tracking-tight">5 j</p>
                <p className="text-[9px] uppercase font-black text-neutral-400 tracking-wider">Série active</p>
              </div>
            </div>

            {/* Share Pass Action Bar */}
            <Button onClick={handleSharePass} variant="outline" className="w-full bg-white border-neutral-200 rounded-2xl text-neutral-800 text-xs font-black uppercase tracking-wider h-12 shadow-sm gap-2">
              <Share2 className="w-4 h-4" /> Diffuser mon code Pass
            </Button>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div 
            key="projects" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Mes productions vidéo du Studio
              </p>
              <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">
                {mediaImages.length || 2} projets
              </span>
            </div>

            {/* Grid display using placeholder-images file assets as mock visual projects */}
            <div className="grid grid-cols-2 gap-3">
              {mediaImages.map((img, index) => (
                <div key={img.id} className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm group relative aspect-[4/5]">
                  <img 
                    src={img.imageUrl} 
                    alt={img.description} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={img.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                    <p className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{img.description}</p>
                    <span className="text-[9px] text-white/70 font-mono mt-0.5 flex items-center gap-1">
                      🎬 Rendu #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Backup tiles if images list is tiny */}
              {mediaImages.length === 0 && [1, 2].map((item) => (
                <div key={item} className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm aspect-[4/5] relative bg-neutral-100 flex flex-col justify-end p-3">
                  <div className="absolute inset-0 bg-neutral-900/5" />
                  <p className="text-[11px] font-black text-neutral-800 uppercase tracking-tight">Court-métrage {item}</p>
                  <span className="text-[9px] text-neutral-400 font-mono mt-0.5">Projet sauvegardé</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div 
            key="badges" 
            initial={{ opacity: 0, x: -15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 15 }}
            className="space-y-3"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 mb-2">
              Trophées et distinctions obtenues
            </p>

            {[
              { title: "ZAP d'Or Nominee", desc: "Sélectionné pour la meilleure vidéo de la commune.", color: "from-amber-400 to-orange-500", achieved: true },
              { title: "Pionnier Créatif", desc: "Inscrit dès le lancement officiel du Studio ZAP.", color: "from-purple-500 to-indigo-600", achieved: true },
              { title: "Maître du Montage", desc: "A généré au moins 5 structures de scripts avec l'IA.", color: "from-cyan-400 to-blue-500", achieved: false },
            ].map((badge, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-4 bg-white border rounded-2xl shadow-sm flex items-center gap-4 transition-all",
                  badge.achieved ? "border-neutral-200 opacity-100" : "border-neutral-200/40 opacity-50 grayscale"
                )}
              >
                <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shrink-0 shadow-sm", badge.color)}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-xs text-neutral-900 uppercase tracking-tight">{badge.title}</h4>
                  <p className="text-[11px] text-neutral-500 font-medium leading-snug">{badge.desc}</p>
                </div>
                {badge.achieved && (
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5 bg-white border border-neutral-200 rounded-[2rem] p-5 shadow-sm"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">
              Configuration de mon profil public
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Nom Public</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-sm font-bold rounded-xl bg-neutral-50/50 h-11 border-neutral-200" placeholder="Ton nom complet" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Classe Scolaire</label>
                <Input value={editClasse} onChange={(e) => setEditClasse(e.target.value)} className="text-sm font-mono font-bold rounded-xl bg-neutral-50/50 h-11 border-neutral-200" placeholder="Ex: Tle, 1ère, 2nde" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Ma Biographie & Devise</label>
                <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="text-xs font-medium rounded-xl bg-neutral-50/50 border-neutral-200 min-h-[70px] leading-relaxed" placeholder="Raconte ton univers créatif..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Mes Spécialités Créatives</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = editInterests.includes(interest);
                    return (
                      <button 
                        key={interest} 
                        type="button"
                        onClick={() => handleToggleInterestTag(interest)} 
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95", 
                          isSelected 
                            ? "bg-primary text-white border-primary shadow-sm font-black" 
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

            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full bg-neutral-900 text-white rounded-xl h-12 text-xs font-black uppercase tracking-wider shadow-sm">
                {savingProfile ? "Mise à jour en cours..." : "Enregistrer les modifications"}
              </Button>
              
              <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-12 text-xs font-black uppercase tracking-wider text-rose-600 border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors">
                <LogOut className="w-4 h-4 mr-2" /> Déconnecter la session
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
