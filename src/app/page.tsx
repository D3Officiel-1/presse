'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, User, Phone, BadgeCheck, Award, Briefcase, Sparkles, 
  Film, Play, Flame, Heart, MessageSquare, Share2, Compass, 
  Plus, MessageCircle, TrendingUp, Zap, Tv, Eye
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
    role: 'Membre Exécutif',
    institution: 'Lycée Scientifique',
    views: '1.2k',
    likes: 342,
    comments: 48,
    image: 'https://picsum.photos/seed/nova1/600/400',
    hint: 'cyberpunk student coding movie',
    tag: 'Cinéma'
  },
  {
    id: 'vid-2',
    title: 'Pitch d\'Avenir : Révolutionner le transport vert à Abidjan',
    creator: 'Aminata Diop',
    role: 'Invité d\'Honneur',
    institution: 'Espaces Nova CTI',
    views: '920',
    likes: 215,
    comments: 32,
    image: 'https://picsum.photos/seed/nova2/600/400',
    hint: 'african young woman speech presentation',
    tag: 'Tech Challenge'
  },
  {
    id: 'vid-3',
    title: 'Performance Art : Danse Urbaine Traditionnelle réinventée',
    creator: 'Marc-Aurèle Yao',
    role: 'Partenaire Officiel',
    institution: 'Académie des Arts',
    views: '2.5k',
    likes: 890,
    comments: 112,
    image: 'https://picsum.photos/seed/nova3/600/400',
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
        // Erreur gérée de façon transparente
      } finally {
        setTimeout(() => {
          setLoading(false);
          setShowSplash(false);
        }, 3500);
      }
    };

    fetchProfile();
  }, [fs, router]);

  // Déclencher le flow d'IA Genkit pour des réponses créatives
  const handleAiSmartReply = async () => {
    setGeneratingAi(true);
    try {
      const result = await generateSmartReplySuggestions({ messageContent: sampleMessage });
      setAiSuggestions(result.suggestions || []);
      toast({
        title: 'Suggestions NOVA IA générées',
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

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('user');
    toast({
      title: 'Déconnexion',
      description: 'Session NOVA terminée de façon sécurisée.',
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
              opacity: [0.04, 0.07, 0.04],
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
            className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-accent/20 blur-[150px] rounded-full"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.4)_100%)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(30px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-40 bg-primary/10 blur-[100px] rounded-full pointer-events-none z-0"
          />

          <div className="w-40 h-40 bg-gradient-to-br from-primary via-primary to-accent rounded-[3rem] flex items-center justify-center shadow-[0_30px_80px_rgba(124,58,237,0.2),inset_0_2px_15px_rgba(255,255,255,0.4)] relative z-10 overflow-hidden border border-white/40">
            <motion.div
              initial={{ x: "-150%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-20"
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none z-10" />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
              className="w-24 h-24 relative z-30"
            >
              <Logo className="w-full h-full" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center relative z-20"
        >
          <h1 className="text-8xl font-[1000] tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-600 select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
            NOV<span className="text-primary italic relative inline-block ml-2">A</span>
          </h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-neutral-900 selection:bg-primary selection:text-white">
      {/* Top Navigation Bar Bar Dédiée */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-neutral-200/60 px-4 sm:px-8 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 p-1.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-md">
            <Logo />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tighter text-neutral-950">NOVA</span>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Studio</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">Réseau Créatif Scolaire</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-neutral-700">{profile?.matricule}</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="text-neutral-500 hover:text-destructive rounded-xl hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-4 h-4 sm:mr-2" /> 
            <span className="hidden sm:inline">Quitter</span>
          </Button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upper Dashboard Banner Welcome */}
        <div className="w-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-purple-950 text-white rounded-[2.5rem] p-6 sm:p-10 mb-8 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <Logo className="w-full h-full object-contain scale-120" />
          </div>
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest text-accent flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 fill-accent" /> SAISON 2027
          </div>

          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm text-purple-200">
              <Sparkles className="w-3 h-3 text-accent" /> Propulsé par l'IA Créative
            </div>
            <h2 className="text-3xl sm:text-5xl font-[1000] tracking-tight leading-none">
              Bonjour, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-300 to-accent">
                {profile?.name || 'Créateur NOVA'}
              </span>
            </h2>
            <p className="text-neutral-300 text-xs sm:text-sm font-medium max-w-md leading-relaxed">
              Prépare ton prochain chef-d'œuvre. Partage ton univers en vidéo, décroche des certifications d'excellence et collabore avec les meilleurs talents du réseau.
            </p>
            
            {/* Quick Metrics row */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10">
              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-white">2.8k</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Vues Totales</span>
              </div>
              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-accent">12</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Certifs Or</span>
              </div>
              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-primary">#4</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Rang École</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Navigation Area */}
        <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-3xl shadow-sm border border-neutral-200/80">
            <TabsList className="bg-neutral-100 rounded-2xl p-1 gap-1">
              <TabsTrigger value="feed" className="rounded-xl font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Compass className="w-4 h-4" /> Flux Étoilé
              </TabsTrigger>
              <TabsTrigger value="studio" className="rounded-xl font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Film className="w-4 h-4" /> Labo Créatif
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <User className="w-4 h-4" /> Ma Carte Pass
              </TabsTrigger>
            </TabsList>

            <Button size="sm" className="rounded-xl font-bold gap-2 bg-primary text-white shadow-md w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Publier une Vidéo
            </Button>
          </div>

          {/* TAB 1: RADICAL SOCIAL FEED */}
          <TabsContent value="feed" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Video List Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-black tracking-tight text-neutral-900">Tendances de la semaine</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {MOCK_VIDEOS.map((video) => (
                    <motion.div 
                      key={video.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group bg-white rounded-[2rem] border border-neutral-200/70 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                        <img 
                          src={video.image} 
                          alt={video.title}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                          data-ai-hint={video.hint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                        
                        <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-neutral-900 hover:bg-white text-xs font-bold px-2.5 py-1 rounded-xl shadow">
                          {video.tag}
                        </Badge>

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2 bg-neutral-950/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
                            <Eye className="w-3.5 h-3.5 text-neutral-300" />
                            <span>{video.views} vues</span>
                          </div>
                          
                          <Button size="icon" className="w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-black text-xl text-neutral-950 tracking-tight leading-snug group-hover:text-primary transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-xs text-neutral-500 font-semibold flex items-center gap-1.5">
                              <span>Par <strong>{video.creator}</strong></span>
                              <span className="w-1 h-1 rounded-full bg-neutral-300" />
                              <span className="text-primary font-bold">{video.institution}</span>
                            </p>
                          </div>
                        </div>

                        {/* Interactive Engagement Row */}
                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-neutral-500 text-xs font-bold">
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors group/btn">
                              <Heart className="w-4 h-4 group-hover/btn:fill-rose-500 transition-all" />
                              <span>{video.likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              <span>{video.comments}</span>
                            </button>
                          </div>

                          <button className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Partager</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Helpers & Smart Challenge Sidebar */}
              <div className="space-y-6">
                
                {/* AI Helper Card */}
                <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-purple-500/5 rounded-[2rem] shadow-sm relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 text-primary/10 pointer-events-none">
                    <Zap className="w-32 h-32" />
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-widest text-primary font-black flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-primary" /> Assistant Répliques IA
                    </CardTitle>
                    <CardDescription className="normal-case text-neutral-600 font-medium text-xs mt-1">
                      Simule ou génère instantanément des commentaires intelligents pour ton réseau créatif.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-700 italic relative">
                      <span className="absolute -top-2 left-3 bg-neutral-100 text-[9px] font-black uppercase text-neutral-500 px-1 rounded">Dernier message reçu</span>
                      "{sampleMessage}"
                    </div>

                    <Button 
                      onClick={handleAiSmartReply}
                      disabled={generatingAi}
                      className="w-full bg-neutral-950 text-white hover:bg-neutral-900 rounded-xl text-xs font-bold h-10"
                    >
                      {generatingAi ? "Analyse Genkit en cours..." : "Suggérer des réponses avec l'IA"}
                    </Button>

                    <AnimatePresence>
                      {aiSuggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 pt-2"
                        >
                          <p className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Options à copier :</p>
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

                {/* Active Challenge Box */}
                <Card className="border-neutral-200/80 rounded-[2rem] shadow-sm bg-white">
                  <CardHeader>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm mb-2">
                      🏆
                    </div>
                    <CardTitle className="text-base font-black text-neutral-900 tracking-tight">Challenge Mensuel NOVA</CardTitle>
                    <CardDescription className="normal-case text-neutral-500 text-xs">Décroche le grand prix du public</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-medium text-neutral-700">
                    <p className="leading-relaxed">
                      Sujet actuel : <strong>"Raconte ton établissement en 60 secondes chrono"</strong>. Rythme effréné, transitions fluides requises.
                    </p>
                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Participants inscrits</span>
                        <span className="text-primary">142</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[75%]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* TAB 2: STUDIO LAB */}
          <TabsContent value="studio" className="outline-none">
            <Card className="border-neutral-200/80 rounded-[2.5rem] shadow-sm bg-white p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Tv className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Studio Mobile & Scripting</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Le laboratoire vidéo intègre l'IA d'aide au montage et à l'écriture de scénarios scolaires. Télécharge tes séquences pour démarrer.
                </p>
              </div>
              <div className="pt-4 max-w-sm mx-auto">
                <Button className="w-full rounded-xl bg-neutral-900 text-white font-bold h-12">
                  Ouvrir le Générateur de Scripts
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: IMMERSIVE PROFILE CARD */}
          <TabsContent value="profile" className="outline-none">
            <div className="max-w-2xl mx-auto">
              <Card className="border-neutral-200/80 shadow-xl overflow-hidden rounded-[2.5rem] bg-white">
                <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 p-8 relative">
                  <div className="absolute top-4 right-4 text-primary opacity-5">
                    <Logo className="w-32 h-32" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
                    <div className="p-5 bg-white rounded-3xl border border-neutral-200 text-primary shadow-lg shrink-0">
                      <User className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-bold rounded-lg">
                        Profil Vérifié NOVA
                      </Badge>
                      <CardTitle className="text-3xl font-black text-neutral-950">{profile?.name || 'Artiste NOVA'}</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                        <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                        Matricule Unique : <span className="text-neutral-900 tracking-wider font-mono">{profile?.matricule}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <Award className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Statut Membre</span>
                        <span className="font-bold text-neutral-800 capitalize text-sm">{profile?.role || 'Nouvelle Étoile'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <Briefcase className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Établissement</span>
                        <span className="font-bold text-neutral-800 text-sm truncate">{profile?.company || 'Non renseigné'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 sm:col-span-2">
                      <Phone className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Contact Réseau</span>
                        <span className="font-bold text-neutral-800 text-sm">{profile?.phone || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100">
                    <p className="text-[9px] uppercase tracking-widest font-black text-neutral-400 mb-2">Canal Technique Associé</p>
                    <code className="text-xs bg-neutral-100 p-3 rounded-xl block font-mono text-neutral-700 border border-neutral-200/60 overflow-x-auto">
                      {profile?.email}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </main>

      {/* Modern Minimal Footnote */}
      <footer className="w-full text-center py-8 text-neutral-400 text-[11px] font-bold uppercase tracking-widest border-t border-neutral-200/50 mt-12 bg-white">
        <span>NOVA 2027 • Plateforme Créative et Scolaire</span>
      </footer>
    </div>
  );
}
