'use client';

import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Heart, 
  Lock, 
  Bookmark, 
  BarChart3,
  TrendingUp,
  Video,
  Repeat2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import placeholderData from '@/lib/placeholder-images.json';
import { ProfileHeader } from '@/components/zap/profile-header';
import { ProfileHero } from '@/components/zap/profile-hero';
import { ProfileVideoGrid } from '@/components/zap/profile-video-grid';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  XAxis, 
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

const GROWTH_DATA = [
  { day: 'Lun', views: 400, followers: 12 },
  { day: 'Mar', views: 300, followers: 8 },
  { day: 'Mer', views: 900, followers: 25 },
  { day: 'Jeu', views: 700, followers: 18 },
  { day: 'Ven', views: 1200, followers: 32 },
  { day: 'Sam', views: 1500, followers: 45 },
  { day: 'Dim', views: 1100, followers: 38 },
];

const CHART_CONFIG = {
  views: {
    label: "Vues",
    color: "hsl(var(--primary))",
  },
  followers: {
    label: "Abonnés",
    color: "#7C3AED",
  },
};

export default function TikTokProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'reposts' | 'liked' | 'bookmarked' | 'private' | 'insights'>('videos');

  const mediaImages = placeholderData.placeholderImages.filter(img => img.id.startsWith('media-'));

  const getDisplayName = (prof: any) => {
    if (prof?.name && prof.name.trim() !== '') {
      return prof.name;
    }
    const shortId = prof?.uid ? prof.uid.substring(0, 6).toUpperCase() : 'STUDIO';
    return `ZAP_${shortId}`;
  };

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }

    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          setProfile(snap.data());
        }
        setIsHydrated(true);
      }).catch(() => {
        setIsHydrated(true);
      });
    }
  }, [fs, router]);

  if (!isHydrated || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-neutral-400 space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider opacity-60">Chargement du studio...</p>
      </div>
    );
  }

  const displayedTitleName = getDisplayName(profile);

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-28 font-sans">
      
      <ProfileHeader 
        name={displayedTitleName} 
        onEditClick={() => router.push('/zap/profile/edit')}
        onViewProfileClick={() => toast({ title: "Vues du profil", description: "42 membres ont visité votre pass cette semaine." })}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ProfileHero
          displayName={displayedTitleName}
          username={profile.username}
          category={profile.category}
          bio={profile.bio}
          link={profile.link}
          commune={profile.commune}
          company={profile.company}
          isPublic={profile.isPublic}
        />

        <div className="flex border-b border-neutral-100 bg-white sticky top-14 z-30 w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'videos', icon: Grid },
            { id: 'reposts', icon: Repeat2 },
            { id: 'bookmarked', icon: Bookmark },
            { id: 'liked', icon: Heart },
            { id: 'private', icon: Lock },
            { id: 'insights', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 min-w-[56px] py-3.5 flex items-center justify-center relative transition-colors outline-none",
                  isSelected ? "text-neutral-950" : "text-neutral-300 hover:text-neutral-400"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform", isSelected && "scale-110", isSelected && tab.id === 'liked' && "fill-neutral-950 text-neutral-950")} />
                {isSelected && (
                  <motion.div 
                    layoutId="tiktokActiveLineTab" 
                    className="absolute bottom-0 inset-x-2 md:inset-x-4 h-0.5 bg-neutral-950 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-1">
          <AnimatePresence mode="wait">
            {activeTab === 'videos' && (
              <motion.div 
                key="videos" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <ProfileVideoGrid items={mediaImages} />
              </motion.div>
            )}

            {activeTab === 'reposts' && (
              <motion.div 
                key="reposts" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center text-neutral-400 space-y-3 px-6"
              >
                <Repeat2 className="w-8 h-8 text-neutral-300 stroke-[2.5]" />
                <p className="text-xs md:text-sm font-black text-neutral-800 uppercase tracking-wider">Aucun repost</p>
                <p className="text-[11px] md:text-xs max-w-xs leading-normal font-medium text-neutral-400">Les vidéos que vous repartagez apparaîtront ici.</p>
              </motion.div>
            )}

            {activeTab === 'private' && (
              <motion.div 
                key="private" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center text-neutral-400 space-y-3 px-6"
              >
                <Lock className="w-8 h-8 text-neutral-300 stroke-[2.5]" />
                <p className="text-xs md:text-sm font-black text-neutral-800 uppercase tracking-wider">Vidéos privées</p>
                <p className="text-[11px] md:text-xs max-w-xs leading-normal font-medium text-neutral-400">Vos vidéos privées ne sont visibles que par vous.</p>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div 
                key="insights" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 pt-6 pb-12"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Tableau de bord créateur</h3>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary">Derniers 7 jours</Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="rounded-2xl border-neutral-100 bg-neutral-50/50 shadow-none">
                    <CardHeader className="p-4 pb-0">
                      <CardDescription className="text-[9px] font-black uppercase tracking-tighter opacity-100 text-neutral-400">Vues Vidéos</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black tracking-tight">45.2 K</span>
                        <div className="flex items-center text-[9px] font-black text-emerald-500">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +12%
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-neutral-100 bg-neutral-50/50 shadow-none">
                    <CardHeader className="p-4 pb-0">
                      <CardDescription className="text-[9px] font-black uppercase tracking-tighter opacity-100 text-neutral-400">Vues Profil</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black tracking-tight">1.8 K</span>
                        <div className="flex items-center text-[9px] font-black text-emerald-500">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +5%
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-neutral-100 bg-neutral-50/50 shadow-none">
                    <CardHeader className="p-4 pb-0">
                      <CardDescription className="text-[9px] font-black uppercase tracking-tighter opacity-100 text-neutral-400">Reposts</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black tracking-tight">842</span>
                        <Repeat2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-neutral-100 bg-neutral-50/50 shadow-none">
                    <CardHeader className="p-4 pb-0">
                      <CardDescription className="text-[9px] font-black uppercase tracking-tighter opacity-100 text-neutral-400">Publications</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black tracking-tight">33</span>
                        <Video className="w-3.5 h-3.5 text-neutral-900" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-3xl border-neutral-100 shadow-sm overflow-hidden">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Croissance de l'Audience
                    </CardTitle>
                    <CardDescription className="normal-case text-[11px] font-medium tracking-normal text-neutral-500">Performances quotidiennes combinées (Vues & Abonnés)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 px-2">
                    <ChartContainer config={CHART_CONFIG} className="aspect-[2/1] w-full">
                      <AreaChart data={GROWTH_DATA}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#A3A3A3' }} 
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorViews)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="followers" 
                          stroke="#7C3AED" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorFollowers)" 
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'liked' && (
              <motion.div 
                key="liked" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center text-neutral-400 space-y-3 px-6"
              >
                <Lock className="w-8 h-8 text-neutral-300 stroke-[2.5]" />
                <p className="text-xs md:text-sm font-black text-neutral-800 uppercase tracking-wider">Vidéos aimées privées</p>
                <p className="text-[11px] md:text-xs max-w-xs leading-normal font-medium text-neutral-400">Les vidéos aimées par cet élève créateur sont masquées conformément aux options de confidentialité.</p>
              </motion.div>
            )}

            {activeTab === 'bookmarked' && (
              <motion.div 
                key="bookmarked" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-2"
              >
                {[2, 4, 6].map((num) => (
                  <div 
                    key={`fav-grid-${num}`}
                    className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer group rounded-sm md:rounded-lg"
                    onClick={() => router.push('/zap')}
                  >
                    <img 
                      src={`https://picsum.photos/seed/fav-img-${num}/300/400`} 
                      alt="Favoris" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 flex justify-center text-xs font-bold text-neutral-400 uppercase tracking-widest opacity-60">
          pas d'autre resultat
        </div>
      </div>
    </div>
  );
}
