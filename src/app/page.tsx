'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, User, Phone, BadgeCheck, Award, Briefcase, Sparkles, 
  Film, Play, Flame, Heart, MessageSquare, Share2, Compass, 
  Plus, TrendingUp, Zap, Tv, Eye, Sliders, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/logo';
import { generateSmartReplySuggestions } from '@/ai/flows/smart-reply-suggestions';

// Projets vidéo simulés haut de gamme pour l'expérience élève
const MOCK_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Court-métrage : "L\'Énigme du Code 2027"',
    creator: 'Yannick Koffi',
    role: 'Créateur Étoile',
    institution: 'Lycée Scientifique',
    views: '1.2k',
    likes: 342,
    comments: 48,
    image: 'https://picsum.photos/seed/zap1/600/400',
    hint: 'cyberpunk student coding movie',
    tag: 'Cinéma'
  },
  {
    id: 'vid-2',
    title: 'Pitch d\'Avenir : Révolutionner le transport vert à Abidjan',
    creator: 'Aminata Diop',
    role: 'Visiteur Inspiré',
    institution: 'Espaces Créatifs CTI',
    views: '920',
    likes: 215,
    comments: 32,
    image: 'https://picsum.photos/seed/zap2/600/400',
    hint: 'african young woman speech presentation',
    tag: 'Tech Challenge'
  },
  {
    id: 'vid-3',
    title: 'Performance Art : Danse Urbaine Traditionnelle réinventée',
    creator: 'Marc-Aurèle Yao',
    role: 'Partenaire Club',
    institution: 'Académie des Arts',
    views: '2.5k',
    likes: 890,
    comments: 112,
    image: 'https://picsum.photos/seed/zap3/600/400',
    hint: 'urban artistic modern dance',
    tag: 'Art & Culture'
  }
];

export default function Home() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  
  // États pour l'IA Smart Reply intégrée
  const [sampleMessage, setSampleMessage] = useState("Félicitations pour ta vidéo ! Quel logiciel de montage as-tu utilisé ?");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      const timer = setTimeout(() => {
        router.push('/auth');
      }, 3500);
      return () => clearTimeout(timer);
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(fs, 'users', uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!data.onboarded) {
            router.push('/auth/onboarding');
            return;
          }
          setProfile(data);
        } else {
          router.push('/auth/onboarding');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setShowSplash(false);
        }, 2000);
      }
    };

    fetchProfile();
  }, [fs, router]);

  const handleAiSmartReply = async () => {
    setGeneratingAi(true);
    try {
      const result = await generateSmartReplySuggestions({ messageContent: sampleMessage });
      setAiSuggestions(result.suggestions || []);
      toast({
        title: 'Suggestions ZAP IA générées',
        description: 'Trois réponses percutantes créées avec Gemini.',
      });
    } catch (error) {
      setAiSuggestions([
        "Incroyable réalisation, hâte de voir la suite !",
        "Merci beaucoup ! J'ai principalement travaillé sur DaVinci Resolve.",
        "Le projet a nécessité 2 semaines de script intense !"
      ]);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleToggleLike = (id: string) => {
    if (likedVideos.includes(id)) {
      setLikedVideos(prev => prev.filter(v => v !== id));
    } else {
      setLikedVideos(prev => [...prev, id]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('user');
    toast({
      title: 'Déconnexion',
      description: 'Session ZAP terminée de façon sécurisée.',
    });
    router.push('/auth');
  };

  if (showSplash || loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDFDFD] overflow-hidden select-none z-[9999]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [-100, 100, -100],
              y: [-50, 50, -50],
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-primary/20 blur-[150px] rounded-full"
          />
          <motion.div
            animate={{
              x: [100, -100, 100],
              y: [50, -50, 50],
              scale: [1.2, 1, 1.2],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-orange-400/20 blur-[150px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(30px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(255,39,0,0.15)] border border-white/20">
            <div className="w-16 h-16">
              <Logo className="w-full h-full" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <h1 className="text-4xl font-black tracking-tighter text-neutral-900">
            ZAP<span className="text-primary italic">!</span>
          </h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F9] text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+5rem)]">
      {/* Custom Designed Studio Native Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-neutral-200/60 px-5 py-4 transition-all duration-300">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 p-2 bg-gradient-to-tr from-primary to-orange-600 rounded-xl shadow-sm text-white flex items-center justify-center">
              <Logo />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-neutral-950">ZAP!</span>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest -mt-1">
                {profile?.company ? profile.company : "Studio Créatif"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end mr-1">
              <span className="text-xs font-bold text-neutral-800 truncate max-w-[100px]">
                {profile?.name ? profile.name.split(' ')[0] : 'Créateur'}
              </span>
              <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/10">
                {profile?.matricule}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 active:scale-95 transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="px-4 py-4 max-w-md mx-auto space-y-5">
        
        {/* TAB 1: IMMERSIVE VIDEO FLUX */}
        {activeTab === 'feed' && (
          <div className="space-y-5 animate-fade-up">
            {/* Live Tendance Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <Badge className="bg-primary text-white border-none px-3 py-1 text-xs font-bold rounded-full shrink-0 flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3 fill-white" /> À la une
              </Badge>
              <Badge variant="outline" className="bg-white border-neutral-200 text-neutral-700 px-3 py-1 text-xs font-bold rounded-full shrink-0">
                🎬 Cinéma
              </Badge>
              <Badge variant="outline" className="bg-white border-neutral-200 text-neutral-700 px-3 py-1 text-xs font-bold rounded-full shrink-0">
                💡 Pitchs
              </Badge>
              <Badge variant="outline" className="bg-white border-neutral-200 text-neutral-700 px-3 py-1 text-xs font-bold rounded-full shrink-0">
                🎨 Arts
              </Badge>
            </div>

            {/* Immersive Vertical Video Cards */}
            <div className="space-y-6">
              {MOCK_VIDEOS.map((video) => (
                <div 
                  key={video.id}
                  className="bg-white rounded-[2rem] border border-neutral-200/80 overflow-hidden shadow-md relative"
                >
                  {/* Media Content Viewport */}
                  <div className="relative aspect-[4/5] w-full bg-neutral-950 overflow-hidden">
                    <img 
                      src={video.image} 
                      alt={video.title}
                      className="w-full h-full object-cover opacity-95"
                      data-ai-hint={video.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    
                    {/* Top Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] bg-white/20 backdrop-blur-md border border-white/20 text-white font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
                        {video.tag}
                      </span>
                    </div>

                    {/* Middle Play Action overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-14 h-14 rounded-full bg-primary/90 text-white shadow-xl flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-1" />
                      </button>
                    </div>

                    {/* Immersive Overlay Info Text */}
                    <div className="absolute bottom-4 left-4 right-16 text-white space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{video.views} vues</span>
                      </div>
                      <h3 className="font-black text-lg tracking-tight text-white leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-[11px] text-neutral-300 font-semibold">
                        @{video.creator} • <span className="text-accent font-bold">{video.institution}</span>
                      </p>
                    </div>

                    {/* Right-Side Vertical Engagement Action Bar */}
                    <div className="absolute bottom-4 right-3 flex flex-col gap-4 items-center">
                      <button 
                        onClick={() => handleToggleLike(video.id)}
                        className={`w-11 h-11 rounded-full flex flex-col items-center justify-center backdrop-blur-md shadow-lg active:scale-75 transition-all ${
                          likedVideos.includes(video.id) ? 'bg-rose-500 text-white' : 'bg-black/30 text-white border border-white/10'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${likedVideos.includes(video.id) ? 'fill-white' : ''}`} />
                        <span className="text-[9px] font-bold mt-0.5">{video.likes + (likedVideos.includes(video.id) ? 1 : 0)}</span>
                      </button>

                      <button className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex flex-col items-center justify-center shadow-lg active:scale-75 transition-all">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[9px] font-bold mt-0.5">{video.comments}</span>
                      </button>

                      <button className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg active:scale-75 transition-all">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STUDIO LAB */}
        {activeTab === 'studio' && (
          <div className="space-y-5 animate-fade-up">
            <div className="p-5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-orange-950 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/10 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest text-accent flex items-center gap-1">
                <Flame className="w-3 h-3 fill-accent" /> CHALLENGE LANCE
              </div>
              <h2 className="text-xl font-black tracking-tight mt-2">"Mon lycée en 60s"</h2>
              <p className="text-xs text-neutral-300 font-medium mt-1 leading-relaxed">
                Le grand concours de vidéos courtes de la saison. Publie ton chef-d'œuvre et gagne le badge Éclair d'Or.
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs font-bold">
                <span className="text-orange-300">142 participants actifs</span>
                <span className="text-accent">Délai : 6 jours</span>
              </div>
            </div>

            {/* Smart IA Interaction Card */}
            <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-accent/5 rounded-[2rem] shadow-sm relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-primary font-black flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-primary" /> Assistant Répliques IA
                </CardTitle>
                <CardDescription className="normal-case text-neutral-600 font-medium text-xs mt-1">
                  Génère instantanément des commentaires intelligents pour booster l'engagement sur ton réseau créatif.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="p-3 bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-700 italic relative">
                  <span className="absolute -top-2 left-3 bg-neutral-100 text-[9px] font-black uppercase text-neutral-400 px-1 rounded">Message simulé</span>
                  "{sampleMessage}"
                </div>

                <Button 
                  onClick={handleAiSmartReply}
                  disabled={generatingAi}
                  className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-bold h-11"
                >
                  {generatingAi ? "Analyse Gemini en cours..." : "Suggérer des réponses avec l'IA"}
                </Button>

                <AnimatePresence>
                  {aiSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 pt-1"
                    >
                      <p className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Options créées :</p>
                      {aiSuggestions.map((sug, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            toast({ title: "Copié !", description: "Réponse sélectionnée avec succès." });
                          }}
                          className="p-2.5 bg-white hover:bg-primary/5 border border-neutral-200 rounded-xl text-xs font-medium cursor-pointer transition-colors text-neutral-800"
                        >
                          {sug}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Studio Tools Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm">Générateur Scripts</h4>
                <p className="text-[11px] text-neutral-500 leading-snug">Crée tes scripts vidéo minutés via l'IA.</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Tv className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm">Prompteur Vocal</h4>
                <p className="text-[11px] text-neutral-500 leading-snug">Défilement calé sur le rythme de ta voix.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE VIRTUAL PASS */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fade-up">
            {/* Holographic Hologram look profile pass card */}
            <div className="bg-white border border-neutral-200 rounded-[2.5rem] shadow-xl overflow-hidden relative">
              <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-orange-500/10 p-6 relative border-b border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white shadow-md">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-bold rounded-lg text-[9px]">
                      Pass Scolaire Certifié
                    </Badge>
                    <h3 className="text-xl font-black text-neutral-950 tracking-tight">{profile?.name || 'Artiste ZAP'}</h3>
                    <p className="text-[10px] text-neutral-500 font-bold tracking-wider font-mono">
                      ID: {profile?.matricule}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <Award className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Statut</span>
                      <span className="font-bold text-neutral-800 text-xs capitalize">{profile?.role || 'Nouvelle Étoile'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <Briefcase className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Établissement Lycée</span>
                      <span className="font-bold text-neutral-800 text-xs truncate max-w-[240px]">{profile?.company || 'Non renseigné'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">WhatsApp</span>
                      <span className="font-bold text-neutral-800 text-xs">{profile?.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <span className="text-[9px] uppercase tracking-widest font-black text-neutral-400 block mb-1">Canal Technique Unique</span>
                  <code className="text-xs bg-neutral-50 p-2.5 rounded-xl block font-mono text-neutral-600 border border-neutral-100 overflow-x-auto">
                    {profile?.email}
                  </code>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-sm">
                <span className="block text-lg font-black text-neutral-900">3.4k</span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Vues</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-sm">
                <span className="block text-lg font-black text-accent">18</span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Zaps d'Or</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-sm">
                <span className="block text-lg font-black text-primary">#1</span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Rang</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ULTRA STYLISH FLOATING GLASS BOTTOM NAVIGATION BAR BAR DEDIEE */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-2xl shadow-xl flex items-center justify-around px-2 z-50">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'feed' ? 'text-primary scale-110' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Flux</span>
        </button>

        {/* Center High-Action Trigger upload button */}
        <button 
          onClick={() => {
            setActiveTab('studio');
            toast({ title: "ZAP Studio ouvert", description: "Préparez votre enregistrement mobile." });
          }}
          className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full text-white shadow-lg flex items-center justify-center -translate-y-3 active:scale-90 transition-transform relative"
        >
          <Plus className="w-6 h-6" />
          <span className="absolute -inset-1 bg-primary/20 blur-md rounded-full -z-10" />
        </button>

        <button 
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'studio' ? 'text-primary scale-110' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Studio</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-primary scale-110' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Mon Pass</span>
        </button>
      </nav>
    </div>
  );
}
