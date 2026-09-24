'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, User, Briefcase, Flame, Heart, MessageSquare, Share2, Compass, 
  Plus, Zap, Tv, Eye, Sliders, GraduationCap, Phone, Play, Film, MoreVertical, Music, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/logo';
import { generateSmartReplySuggestions } from '@/ai/flows/smart-reply-suggestions';
import { cn } from '@/lib/utils';

const MOCK_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Court-métrage : "L\'Énigme du Code 2027"',
    creator: 'yannick_vfx',
    fullName: 'Yannick Koffi',
    institution: 'Lycée Scientifique',
    likes: '12.4k',
    comments: '856',
    bookmarks: '2.1k',
    shares: '432',
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
    likes: '8.2k',
    comments: '420',
    bookmarks: '1.2k',
    shares: '128',
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
    likes: '45.1k',
    comments: '2.3k',
    bookmarks: '8.4k',
    shares: '1.5k',
    image: 'https://picsum.photos/seed/zap3/600/1000',
    hint: 'urban artistic modern dance',
    audioName: 'Coupé Décalé Remix 2024',
    description: 'La fusion entre tradition et modernité. #dance #culture #zap'
  }
];

export default function ZapPage(props: { params?: Promise<any>; searchParams?: Promise<any> }) {
  if (props?.params) { React.use(props.params); }
  if (props?.searchParams) { React.use(props.searchParams); }

  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  
  const [sampleMessage, setSampleMessage] = useState("Félicitations pour ta vidéo ! Quel logiciel de montage as-tu utilisé ?");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

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

  const handleAiSmartReply = async () => {
    setGeneratingAi(true);
    try {
      const result = await generateSmartReplySuggestions({ messageContent: sampleMessage });
      setAiSuggestions(result.suggestions || []);
      toast({
        title: 'IA ZAP générée',
        description: 'Suggestions prêtes à être publiées.',
      });
    } catch (error) {
      setAiSuggestions([
        "Incroyable réalisation !",
        "Merci ! J'utilise principalement DaVinci Resolve.",
        "Le projet a pris 2 semaines de travail."
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
    toast({ title: 'Déconnexion réussie' });
    router.replace('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Logo className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-black text-white", activeTab !== 'feed' && "bg-[#F4F4F9] text-neutral-900")}>
      {/* Barre de navigation simplifiée pour le flux */}
      {activeTab === 'feed' && (
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-center h-16 pointer-events-none">
          <div className="flex items-center gap-6 pointer-events-auto">
            <button className="text-sm font-black opacity-60 hover:opacity-100 transition-opacity">Suivis</button>
            <div className="relative">
              <button className="text-sm font-black border-b-2 border-primary pb-1">Pour toi</button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "h-screen w-full relative",
        activeTab !== 'feed' && "h-auto overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+5rem)]"
      )}>
        {activeTab === 'feed' ? (
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {MOCK_VIDEOS.map((video) => (
              <section 
                key={video.id} 
                className="h-screen w-full snap-start relative flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={video.image} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                    data-ai-hint={video.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                </div>

                {/* Right Interaction Bar */}
                <div className="absolute right-3 bottom-[120px] z-20 flex flex-col items-center gap-5">
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-neutral-800">
                      <img src={`https://picsum.photos/seed/${video.creator}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute -bottom-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => handleToggleLike(video.id)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-full transition-transform active:scale-75",
                        likedVideos.includes(video.id) ? "text-primary" : "text-white"
                      )}
                    >
                      <Heart className={cn("w-8 h-8", likedVideos.includes(video.id) && "fill-primary")} />
                    </button>
                    <span className="text-[10px] font-bold mt-1 shadow-sm">{video.likes}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="w-12 h-12 flex items-center justify-center text-white active:scale-75 transition-transform">
                      <MessageSquare className="w-8 h-8 fill-none" />
                    </button>
                    <span className="text-[10px] font-bold mt-1 shadow-sm">{video.comments}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="w-12 h-12 flex items-center justify-center text-white active:scale-75 transition-transform">
                      <Bookmark className="w-8 h-8" />
                    </button>
                    <span className="text-[10px] font-bold mt-1 shadow-sm">{video.bookmarks}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="w-12 h-12 flex items-center justify-center text-white active:scale-75 transition-transform">
                      <Share2 className="w-8 h-8" />
                    </button>
                    <span className="text-[10px] font-bold mt-1 shadow-sm">{video.shares}</span>
                  </div>

                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full border-4 border-neutral-700/50 bg-neutral-900 flex items-center justify-center overflow-hidden p-1 mt-4"
                  >
                     <Music className="w-4 h-4 text-white/50" />
                  </motion.div>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute left-4 bottom-[120px] right-20 z-20 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight">@{video.creator}</span>
                    <Badge className="bg-white/20 text-white border-none font-bold text-[9px]">
                      {video.institution}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug drop-shadow-md">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                    <Music className="w-3.5 h-3.5" />
                    <div className="overflow-hidden whitespace-nowrap w-40">
                      <motion.div 
                        animate={{ x: [-160, 160] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        {video.audioName}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : activeTab === 'studio' ? (
          <div className="p-6 space-y-6 max-w-md mx-auto animate-fade-up text-neutral-900">
             <div className="p-5 bg-gradient-to-r from-neutral-950 to-orange-950 text-white rounded-[2rem] shadow-xl">
              <h2 className="text-xl font-black tracking-tight">ZAP Studio</h2>
              <p className="text-xs text-neutral-300 mt-1">Génère tes idées de vidéos avec l'IA.</p>
            </div>

            <Card className="border-primary/20 bg-white rounded-[2rem] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-primary font-black flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-primary" /> Assistant Répliques IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-700 italic">
                  "{sampleMessage}"
                </div>

                <Button 
                  onClick={handleAiSmartReply}
                  disabled={generatingAi}
                  className="w-full bg-neutral-900 text-white rounded-xl font-bold h-12"
                >
                  {generatingAi ? "Gemini réfléchit..." : "Générer des réponses"}
                </Button>

                <AnimatePresence>
                  {aiSuggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      {aiSuggestions.map((sug, i) => (
                        <div key={i} className="p-3 bg-neutral-100 hover:bg-primary/5 border border-neutral-200 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                          {sug}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-2">
                <Film className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-sm">Scripts IA</h4>
                <p className="text-[10px] text-neutral-500">Prépare tes tournages.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-2">
                <Sliders className="w-5 h-5 text-accent" />
                <h4 className="font-bold text-sm">Réglages</h4>
                <p className="text-[10px] text-neutral-500">Optimise tes vidéos.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-w-md mx-auto animate-fade-up text-neutral-900">
            <div className="bg-white border border-neutral-200 rounded-[2.5rem] shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 border-b border-neutral-100">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-[2rem] flex items-center justify-center text-white shadow-lg">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-950">{profile?.name || 'Créateur ZAP'}</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">ID: {profile?.matricule}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs uppercase">{profile?.classe}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs truncate">{profile?.company}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button variant="outline" className="rounded-xl h-12 font-bold border-neutral-200">Éditer le Pass</Button>
                  <Button onClick={handleLogout} variant="destructive" className="rounded-xl h-12 font-bold bg-rose-500 text-white border-none shadow-md">
                    <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center">
                <span className="block text-lg font-black">2.4k</span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase">Likes</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center">
                <span className="block text-lg font-black text-primary">12</span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase">Projets</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center">
                <span className="block text-lg font-black">1.1k</span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase">Abonnés</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Floating Bottom Nav */}
      <nav className={cn(
        "fixed bottom-6 left-6 right-6 h-16 rounded-[2rem] flex items-center justify-around px-4 z-50 transition-all duration-300",
        activeTab === 'feed' 
          ? "bg-black/20 backdrop-blur-md border border-white/10" 
          : "bg-white/80 backdrop-blur-xl border border-neutral-200/60 shadow-xl"
      )}>
        <button 
          onClick={() => setActiveTab('feed')}
          className={cn(
            "flex flex-col items-center justify-center transition-all",
            activeTab === 'feed' ? "text-white scale-110" : "text-neutral-400"
          )}
        >
          <Compass className="w-6 h-6" />
          <span className="text-[8px] font-black mt-1 uppercase">Flux</span>
        </button>

        <button 
          onClick={() => setActiveTab('studio')}
          className="w-12 h-12 bg-primary rounded-full text-white shadow-[0_0_20px_rgba(255,39,0,0.4)] flex items-center justify-center -translate-y-4 active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center justify-center transition-all",
            activeTab === 'profile' ? (activeTab === 'feed' ? "text-white scale-110" : "text-primary scale-110") : "text-neutral-400"
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-[8px] font-black mt-1 uppercase">Profil</span>
        </button>
      </nav>
    </div>
  );
}
