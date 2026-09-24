'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  LogOut, User, Briefcase, Heart, MessageSquare, Share2, 
  Plus, Zap, Sliders, GraduationCap, Film, Music, Bookmark, Send, Sparkles, Search,
  ArrowLeft, CheckCircle2, UserCircle, MessageCircle, PenSquare, Award, Flame, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/logo';
import { generateSmartReplySuggestions } from '@/ai/flows/smart-reply-suggestions';
import { ZapNavigation } from '@/components/zap-navigation';
import { cn } from '@/lib/utils';

const INTEREST_OPTIONS = ["VFX & 3D", "Montage Vidéo", "Scénario", "Humour & Acting", "Danse", "Musique & Beatmaking", "Cadrage"];

export default function ZapPage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  // Profil utilisateur
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  
  // Gestion des vidéos et des likes dynamiques
  const [videos, setVideos] = useState([
    {
      id: 'vid-1',
      title: 'Court-métrage : "L\'Énigme du Code 2027"',
      creator: 'yannick_vfx',
      fullName: 'Yannick Koffi',
      institution: 'Lycée Scientifique',
      likes: 12400,
      comments: 856,
      bookmarks: 2100,
      shares: 432,
      image: 'https://picsum.photos/seed/zap1/600/1000',
      hint: 'cyberpunk student coding movie',
      audioName: 'Original Audio - Yannick VFX',
      description: 'Premier test de rendu 3D sur le campus. #vfx #coding #zapstudio'
    },
    {
      id: 'vid-2',
      title: 'Pitch d\'Avenir : Révolutionner le transport',
      creator: 'amina_diop',
      fullName: 'Aminata Diop',
      institution: 'Espaces Créatifs CTI',
      likes: 8200,
      comments: 420,
      bookmarks: 1200,
      shares: 128,
      image: 'https://picsum.photos/seed/zap2/600/1000',
      hint: 'african young woman speech presentation',
      audioName: 'Tech Talk - Innovation Hub',
      description: 'Comment nous allons changer la mobilité à Abidjan. #tech #startup #ivorycoast'
    },
    {
      id: 'vid-3',
      title: 'Danse Urbaine réinventée',
      creator: 'marc_dance',
      fullName: 'Marc-Aurèle Yao',
      institution: 'Académie des Arts',
      likes: 45100,
      comments: 2300,
      bookmarks: 8400,
      shares: 1500,
      image: 'https://picsum.photos/seed/zap3/600/1000',
      hint: 'urban artistic modern dance',
      audioName: 'Coupé Décalé Remix 2024',
      description: 'La fusion entre tradition et modernité. #dance #culture #zap'
    }
  ]);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<string[]>([]);

  // Onglet Amis / École Wall
  const [friendsPosts, setFriendsPosts] = useState([
    { id: 'f-1', user: 'marie_kh', name: 'Marie Koné', school: 'Lycée Moderne Marcory', action: 'a partagé un nouveau script de court-métrage', time: 'Il y a 5 min', avatarSeed: 'marie' },
    { id: 'f-2', user: 'gilles_art', name: 'Gilles Touré', school: 'Collège Notre Dame', action: 'a remporté le ZAP d\'Or de la semaine en montage', time: 'Il y a 2h', avatarSeed: 'gilles' },
    { id: 'f-3', user: 'fatim_creative', name: 'Fatim Cissé', school: 'Lycée Moderne Amagou', action: 'recherche un cadreur pour son projet de science', time: 'Il y a 5h', avatarSeed: 'fatim' }
  ]);
  const [newPostText, setNewPostText] = useState('');

  // Messagerie & Suggestions d'IA
  const [chats, setChats] = useState([
    { id: 'c-1', name: 'Yannick Koffi', user: 'yannick_vfx', lastMsg: 'Tu as vu mon dernier rendu VFX ?', online: true, avatarSeed: 'yannick', messages: [{ sender: 'them', text: 'Tu as vu mon dernier rendu VFX ?' }] },
    { id: 'c-2', name: 'Aminata Diop', user: 'amina_diop', lastMsg: 'On se capte au studio demain à 14h.', online: false, avatarSeed: 'amina', messages: [{ sender: 'them', text: 'On se capte au studio demain à 14h.' }] },
    { id: 'c-3', name: 'Marc-Aurèle Yao', user: 'marc_dance', lastMsg: 'Le remix audio est prêt pour la danse !', online: true, avatarSeed: 'marc', messages: [{ sender: 'them', text: 'Le remix audio est prêt pour la danse !' }] }
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Édition de profil
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Studio créatif
  const [scriptIdeaInput, setScriptIdeaInput] = useState('');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(fs, 'users', uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!data.onboarded) {
            router.replace('/auth/onboarding');
            return;
          }
          setProfile(data);
          setEditBio(data.bio || '');
          setEditInterests(data.interests || []);
        } else {
          router.replace('/auth/onboarding');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [fs, router]);

  // Actions de likes et favoris façon TikTok
  const handleToggleLike = (id: string) => {
    if (likedVideos.includes(id)) {
      setLikedVideos(prev => prev.filter(v => v !== id));
      setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: v.likes - 1 } : v));
    } else {
      setLikedVideos(prev => [...prev, id]);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: v.likes + 1 } : v));
    }
  };

  const handleToggleBookmark = (id: string) => {
    if (bookmarkedVideos.includes(id)) {
      setBookmarkedVideos(prev => prev.filter(v => v !== id));
    } else {
      setBookmarkedVideos(prev => [...prev, id]);
    }
  };

  // Publier un statut sur le fil de l'école
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

  // Lancement de l'IA de réponse intelligente (Genkit)
  const handleRequestAiReplies = async (messageContent: string) => {
    setGeneratingAi(true);
    try {
      const result = await generateSmartReplySuggestions({ messageContent });
      setAiSuggestions(result.suggestions || []);
    } catch (error) {
      // Fallback convivial si hors ligne
      setAiSuggestions([
        "C'est incroyable ! Hâte de voir la suite.",
        "Propre ! Tu as fait ça sur quel logiciel ?",
        "Force à toi l'équipe ! 🔥"
      ]);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Envoyer un message dans le chat
  const handleSendMessage = () => {
    if (!typedMessage.trim() || !activeChatId) return;

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMsg: typedMessage.trim(),
          messages: [...c.messages, { sender: 'me', text: typedMessage.trim() }]
        };
      }
      return c;
    }));

    setTypedMessage('');
    setAiSuggestions([]);

    toast({
      title: 'Message envoyé',
      description: 'Envoyé avec succès.'
    });
  };

  // Sauvegarder le profil dans Firestore
  const handleSaveProfile = () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;

    setSavingProfile(true);
    const userDocRef = doc(fs, 'users', uid);

    setDoc(userDocRef, {
      bio: editBio,
      interests: editInterests,
      updatedAt: new Date()
    }, { merge: true })
      .then(() => {
        setProfile((prev: any) => ({ ...prev, bio: editBio, interests: editInterests }));
        toast({
          title: 'Profil mis à jour',
          description: 'Vos centres d\'intérêt et votre bio ont été enregistrés.',
        });
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de mettre à jour le profil.'
        });
      })
      .finally(() => {
        setSavingProfile(false);
      });
  };

  // Simuler un pitch ou script d'idées créatives dans le Studio
  const handleGenerateScriptIdea = () => {
    if (!scriptIdeaInput.trim()) return;
    setGeneratedScript("Chargement de l'inspiration...");
    
    setTimeout(() => {
      setGeneratedScript(`🎬 IDÉE DE SCRIPT ZAP :\n\nTitre suggéré: "Les Gardiens du Tableau"\n\n[Scène 1 - Intérieur Classe] Un élève découvre que les craies de couleur dessinent des objets réels dans la cour. \n\nConseil technique : Utilisez des effets d'incrustation vidéo simples (Cut & Mask) pour faire apparaître les objets au rythme de la musique !`);
    }, 1200);
  };

  const handleToggleInterestTag = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests(prev => prev.filter(i => i !== interest));
    } else {
      setEditInterests(prev => [...prev, interest]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('user');
    toast({ title: 'Déconnexion réussie' });
    router.replace('/auth');
  };

  const currentChat = chats.find(c => c.id === activeChatId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Logo className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-black text-white", activeTab !== 'feed' && "bg-[#F9F9FC] text-neutral-900")}>
      
      {/* Barre de navigation simplifiée pour le flux plein écran */}
      {activeTab === 'feed' && (
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-center h-16 pointer-events-none">
          <div className="flex items-center gap-6 pointer-events-auto bg-black/20 px-5 py-2 rounded-full backdrop-blur-md mt-2">
            <button className="text-xs font-black opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest text-white">Abonnements</button>
            <button className="text-xs font-black border-b-2 border-primary pb-0.5 uppercase tracking-widest text-white">Pour toi</button>
          </div>
        </header>
      )}

      {/* Zone principale des pages */}
      <main className={cn(
        "h-screen w-full relative",
        activeTab !== 'feed' && "h-auto overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] pt-4"
      )}>
        
        {/* ================= ONTLET 1: FLUX TIKTOK / REELS ================= */}
        {activeTab === 'feed' && (
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {videos.map((video) => (
              <section 
                key={video.id} 
                className="h-screen w-full snap-start relative flex flex-col items-center justify-center overflow-hidden bg-neutral-950"
              >
                {/* Image Plein écran avec simulateur vidéo */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={video.image} 
                    alt={video.title} 
                    className="w-full h-full object-cover opacity-95"
                    data-ai-hint={video.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
                </div>

                {/* Interactions superposées à droite (style TikTok) */}
                <div className="absolute right-4 bottom-[120px] z-20 flex flex-col items-center gap-5">
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-neutral-800 shadow-md">
                      <img src={`https://picsum.photos/seed/${video.creator}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute -bottom-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg border border-white">
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => handleToggleLike(video.id)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-full transition-transform active:scale-75 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg text-white",
                        likedVideos.includes(video.id) && "text-primary"
                      )}
                    >
                      <Heart className={cn("w-6 h-6", likedVideos.includes(video.id) && "fill-primary stroke-primary")} />
                    </button>
                    <span className="text-[11px] font-bold mt-1 text-white shadow-sm">{video.likes.toLocaleString()}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => {
                        // Ouvre directement la messagerie avec le créateur
                        const matchedChat = chats.find(c => c.user === video.creator);
                        if (matchedChat) {
                          setActiveChatId(matchedChat.id);
                          setActiveTab('chat');
                        }
                      }}
                      className="w-12 h-12 flex items-center justify-center text-white active:scale-75 transition-transform bg-black/40 backdrop-blur-md border border-white/10 shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] font-bold mt-1 text-white shadow-sm">{video.comments}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => handleToggleBookmark(video.id)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center text-white active:scale-75 transition-transform bg-black/40 backdrop-blur-md border border-white/10 shadow-lg",
                        bookmarkedVideos.includes(video.id) && "text-yellow-400"
                      )}
                    >
                      <Bookmark className={cn("w-5 h-5", bookmarkedVideos.includes(video.id) && "fill-yellow-400")} />
                    </button>
                    <span className="text-[11px] font-bold mt-1 text-white shadow-sm">{video.bookmarks}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="w-12 h-12 flex items-center justify-center text-white active:scale-75 transition-transform bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] font-bold mt-1 text-white shadow-sm">{video.shares}</span>
                  </div>

                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full border-2 border-white/30 bg-neutral-900 flex items-center justify-center overflow-hidden p-1.5 shadow-xl mt-2"
                  >
                     <Music className="w-5 h-5 text-primary" />
                  </motion.div>
                </div>

                {/* Légende en bas de la vidéo */}
                <div className="absolute left-4 bottom-[120px] right-20 z-20 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base tracking-tight text-white drop-shadow">@{video.creator}</span>
                    <Badge className="bg-primary text-white border-none font-bold text-[9px] px-2 py-0.5">
                      {video.institution}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold leading-snug drop-shadow-md text-white/90">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
                    <Music className="w-3 h-3 text-primary animate-pulse" />
                    <span className="truncate w-48 font-mono">{video.audioName}</span>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ================= ONTLET 2: AMIS / MUR DE L'ÉCOLE ================= */}
        {activeTab === 'friends' && (
          <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Mon Équipe <Badge variant="default" className="text-[10px] font-mono">{profile?.commune || 'Abidjan'}</Badge>
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Le fil d'actualité créatif de votre école.</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Carte Challenge Hebdomadaire */}
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

            {/* Formulaire de partage dynamique */}
            <form onSubmit={handleCreatePost} className="p-4 bg-white rounded-3xl border border-neutral-200/80 shadow-sm space-y-3">
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black uppercase">
                  {profile?.name?.substring(0,2) || 'Z'}
                </div>
                <Input 
                  placeholder="Partager une idée de tournage ou un besoin de monteur..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="border-none focus-visible:ring-0 px-0 placeholder:text-neutral-400 text-base font-medium bg-transparent"
                />
              </div>
              <div className="flex justify-end pt-2 border-t border-neutral-100">
                <Button type="submit" size="sm" className="rounded-xl px-4 text-xs font-bold gap-1.5">
                  <PenSquare className="w-3.5 h-3.5" /> Publier sur le mur
                </Button>
              </div>
            </form>

            {/* Flux de posts des amis de l'école */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Publications récentes</p>
              {friendsPosts.map((post) => (
                <div key={post.id} className="p-4 bg-white rounded-3xl border border-neutral-200/60 shadow-sm flex gap-3 items-start hover:border-neutral-300 transition-all">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 shadow-inner">
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
        )}

        {/* ================= ONTLET 3: MESSAGERIE & IA SUGGESTIONS ================= */}
        {activeTab === 'chat' && (
          <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900 h-full flex flex-col">
            {!activeChatId ? (
              <>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Messages</h2>
                  <p className="text-xs text-neutral-500 font-medium">Discutez et collaborez avec d'autres élèves créateurs.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input 
                    placeholder="Rechercher un membre du club..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="pl-9 h-11 bg-white border-neutral-200 rounded-2xl text-base"
                  />
                </div>

                <div className="space-y-2.5">
                  {chats.filter(c => c.name.toLowerCase().includes(chatSearch.toLowerCase())).map((chat) => (
                    <div 
                      key={chat.id} 
                      onClick={() => {
                        setActiveChatId(chat.id);
                        // Pré-charger des suggestions d'IA adaptées au dernier message reçu
                        handleRequestAiReplies(chat.lastMsg);
                      }}
                      className="p-3.5 bg-white hover:bg-neutral-50/80 border border-neutral-200/60 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200 shadow-inner">
                            <img src={`https://picsum.photos/seed/${chat.avatarSeed}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-neutral-950">@{chat.user}</h4>
                          <p className="text-xs text-neutral-500 truncate max-w-[200px] mt-0.5 font-medium">{chat.lastMsg}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="rounded-xl text-neutral-400 bg-neutral-50">
                        <MessageCircle className="w-4 h-4 text-neutral-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Interface Discussion Active */
              <div className="flex flex-col h-[75dvh] bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                {/* En-tête du chat */}
                <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-3">
                  <Button size="icon" variant="ghost" onClick={() => setActiveChatId(null)} className="rounded-xl">
                    <ArrowLeft className="w-5 h-5 text-neutral-700" />
                  </Button>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200">
                    <img src={`https://picsum.photos/seed/${currentChat?.avatarSeed}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-neutral-950">{currentChat?.name}</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">@{currentChat?.user}</p>
                  </div>
                </div>

                {/* Zone des messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50">
                  {currentChat?.messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex w-full",
                        msg.sender === 'me' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl text-xs max-w-[80%] font-medium shadow-sm",
                        msg.sender === 'me' 
                          ? "bg-neutral-900 text-white rounded-tr-none" 
                          : "bg-white text-neutral-900 rounded-tl-none border border-neutral-100"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Barre IA de suggestions intelligentes (Genkit Integration) */}
                <div className="p-2 bg-purple-50/60 border-t border-purple-100 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600 fill-purple-600" /> Réponses suggérées par l'IA
                    </span>
                    <button 
                      onClick={() => currentChat && handleRequestAiReplies(currentChat.lastMsg)}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Régénérer
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 px-1 no-scrollbar">
                    {generatingAi ? (
                      <span className="text-xs text-neutral-400 font-medium italic animate-pulse p-1">Gemini analyse le contexte...</span>
                    ) : (
                      aiSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => setTypedMessage(sug)}
                          className="p-2 bg-white hover:bg-purple-100/80 border border-purple-200 text-purple-900 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap shrink-0 shadow-sm transition-colors"
                        >
                          {sug}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Input d'envoi */}
                <div className="p-3 border-t border-neutral-100 bg-white flex gap-2 items-center">
                  <Input 
                    placeholder="Votre réponse créative..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 h-11 border-neutral-200 rounded-xl text-base font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="icon" onClick={handleSendMessage} className="rounded-xl h-11 w-11 bg-neutral-950 text-white shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ONTLET 4: STUDIO CRÉATIF / ASSISTANT DE SCRIPT ================= */}
        {activeTab === 'studio' && (
          <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900">
             <div className="p-6 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-orange-950 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap className="w-32 h-32 fill-white stroke-none" />
              </div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary fill-primary" /> ZAP Studio
              </h2>
              <p className="text-xs text-neutral-300 mt-1 font-medium">L'incubateur d'idées propulsé par l'IA pour vos projets scolaires.</p>
            </div>

            <Card className="border-neutral-200 bg-white rounded-[2rem] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-primary font-black flex items-center gap-1.5">
                  <Film className="w-4 h-4 fill-primary stroke-none" /> Générateur de Script IA
                </CardTitle>
                <CardDescription className="text-[11px] font-medium text-neutral-400 normal-case tracking-normal">
                  Saisissez un sujet de cours ou un thème pour obtenir instantanément une structure de vidéo type TikTok/Short.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Input 
                    placeholder="Ex: Loi de la gravité, guerre de Troie, court-métrage SF..."
                    value={scriptIdeaInput}
                    onChange={(e) => setScriptIdeaInput(e.target.value)}
                    className="h-11 text-base border-neutral-200 rounded-xl font-medium"
                  />
                </div>

                <Button 
                  onClick={handleGenerateScriptIdea}
                  disabled={!scriptIdeaInput.trim()}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold h-12 text-xs"
                >
                  Générer une structure de script
                </Button>

                <AnimatePresence>
                  {generatedScript && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl text-xs text-neutral-800 leading-relaxed font-medium whitespace-pre-line"
                    >
                      {generatedScript}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-2 hover:border-neutral-300 transition-colors">
                <Music className="w-5 h-5 text-primary" />
                <h4 className="font-black text-xs text-neutral-900">Audio Trends</h4>
                <p className="text-[10px] text-neutral-400 font-medium leading-tight">Musiques tendances autorisées.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-2 hover:border-neutral-300 transition-colors">
                <Sliders className="w-5 h-5 text-neutral-900" />
                <h4 className="font-black text-xs text-neutral-900">Tutos Vidéo</h4>
                <p className="text-[10px] text-neutral-400 font-medium leading-tight">Astuces de cadrage smartphone.</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONTLET 5: PROFIL / FIRESTORE CONCURRENT UPDATE ================= */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900">
            <div className="bg-white border border-neutral-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              {/* Entête avec couleur dégradée */}
              <div className="bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 p-6 border-b border-neutral-100 relative">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-20 h-20 bg-gradient-to-tr from-primary to-orange-500 rounded-[2.2rem] flex items-center justify-center text-white shadow-md border-2 border-white">
                    <span className="text-2xl font-black uppercase">{profile?.name?.substring(0, 2) || 'C'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-neutral-950 tracking-tight">{profile?.name || 'Créateur anonyme'}</h3>
                    <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest mt-0.5">
                      Matricule : {profile?.matricule || 'Inconnu'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu modifiable connecté à Firestore */}
              <div className="p-5 space-y-5">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-bold text-xs uppercase text-neutral-800">Classe : Éélève en {profile?.classe?.toUpperCase() || '6e'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <Briefcase className="w-4 h-4 text-neutral-900 shrink-0" />
                    <span className="font-bold text-xs truncate text-neutral-800">{profile?.company || 'Aucun établissement renseigné'}</span>
                  </div>
                </div>

                {/* Édition de la Biographie */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Ma Biographie de Créateur</label>
                  <Textarea 
                    placeholder="Écrivez votre devise de vidéaste ou vos projets actuels..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="text-base font-medium border-neutral-200 rounded-xl bg-neutral-50/50 min-h-[70px] focus-visible:ring-primary/20"
                  />
                </div>

                {/* Sélection des Intérêts créatifs */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Mes Spécialités Créatives</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_OPTIONS.map((interest) => {
                      const isSelected = editInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleToggleInterestTag(interest)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                            isSelected 
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                          )}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bouton de sauvegarde */}
                <Button 
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl h-11 text-xs"
                >
                  {savingProfile ? "Enregistrement..." : "Sauvegarder mon profil"}
                </Button>

                <div className="pt-2 border-t border-neutral-100">
                  <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-11 text-xs font-bold text-rose-600 border-rose-100 bg-rose-50/30 hover:bg-rose-50">
                    <LogOut className="w-4 h-4 mr-2" /> Déconnexion du compte
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistiques Studio */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 text-center shadow-sm">
                <span className="block text-base font-black text-neutral-900">2.4k</span>
                <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Likes</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 text-center shadow-sm">
                <span className="block text-base font-black text-primary">12</span>
                <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Projets</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 text-center shadow-sm">
                <span className="block text-base font-black text-neutral-900">1.1k</span>
                <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Abonnés</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barre de navigation globale et réutilisable */}
      <ZapNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
