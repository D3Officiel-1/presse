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
  Repeat2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import placeholderData from '@/lib/placeholder-images.json';
import { ProfileHeader } from '@/components/zap/profile-header';
import { ProfileHero } from '@/components/zap/profile-hero';
import { ProfileVideoGrid } from '@/components/zap/profile-video-grid';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { XAxis, CartesianGrid, Area, AreaChart } from 'recharts';

const GROWTH_DATA = [
  { day: 'Lun', views: 400, followers: 12 },
  { day: 'Mar', views: 300, followers: 8 },
  { day: 'Mer', views: 900, followers: 25 },
  { day: 'Jeu', views: 700, followers: 18 },
  { day: 'Ven', views: 1200, followers: 32 },
  { day: 'Sam', views: 1500, followers: 45 },
  { day: 'Dim', views: 1100, followers: 38 },
];

export default function TikTokProfilePage(props: { params: Promise<any>; searchParams: Promise<any> }) {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const searchParams = React.use(props.searchParams);
  const scannedUsername = searchParams?.user;

  const [profile, setProfile] = useState<any>(null);
  const [isScannedProfile, setIsScannedProfile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'reposts' | 'liked' | 'bookmarked' | 'private' | 'insights'>('videos');

  const mediaImages = placeholderData.placeholderImages.filter(img => img.id.startsWith('media-'));

  const getDisplayName = (prof: any) => {
    if (prof?.name && prof.name.trim() !== '') return prof.name;
    return `@${prof?.username || 'STUDIO'}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const myUid = localStorage.getItem('userId');
      if (!myUid && !scannedUsername) {
        router.replace('/auth');
        return;
      }

      try {
        if (scannedUsername) {
          const usersRef = collection(fs!, 'users');
          const q = query(usersRef, where('username', '==', scannedUsername), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setProfile(snap.docs[0].data());
            setIsScannedProfile(true);
          } else {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Profil introuvable.' });
            router.replace('/zap');
          }
        } else {
          const snap = await getDoc(doc(fs!, 'users', myUid!));
          if (snap.exists()) setProfile(snap.data());
          setIsScannedProfile(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsHydrated(true);
      }
    };

    if (fs) fetchProfile();
  }, [fs, router, scannedUsername, toast]);

  if (!isHydrated || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Chargement...</p>
      </div>
    );
  }

  const displayedTitleName = getDisplayName(profile);

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-28 font-sans">
      <ProfileHeader 
        name={displayedTitleName} 
        onEditClick={() => router.push('/zap/profile/edit')}
        onViewProfileClick={() => router.push('/zap/profile/vue')}
      />

      <div className="max-w-4xl mx-auto px-4">
        <ProfileHero
          displayName={displayedTitleName}
          username={profile.username}
          bio={profile.bio}
          commune={profile.commune}
          company={profile.company}
        />

        {isScannedProfile && (
          <div className="flex gap-2 mb-6">
            <Button className="flex-1 bg-[#fe2c55] hover:bg-[#e6284d] text-white font-bold rounded-md h-11 border-none shadow-none">Suivre</Button>
            <Button variant="outline" className="flex-1 font-bold rounded-md h-11 border-neutral-200">Message</Button>
          </div>
        )}

        <div className="flex border-b border-neutral-100 bg-white sticky top-14 z-30 w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'videos', icon: Grid },
            { id: 'reposts', icon: Repeat2 },
            { id: 'bookmarked', icon: Bookmark },
            { id: 'liked', icon: Heart },
            ...(!isScannedProfile ? [{ id: 'private', icon: Lock }, { id: 'insights', icon: BarChart3 }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("flex-1 min-w-[56px] py-3.5 flex items-center justify-center relative transition-colors outline-none", isSelected ? "text-neutral-950" : "text-neutral-300")}>
                <Icon className={cn("w-5 h-5", isSelected && "scale-110")} />
                {isSelected && <motion.div layoutId="tiktokActiveLineTab" className="absolute bottom-0 inset-x-2 h-0.5 bg-neutral-950 rounded-full" />}
              </button>
            );
          })}
        </div>

        <div className="mt-1">
          <AnimatePresence mode="wait">
            {activeTab === 'videos' && (
              <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileVideoGrid items={mediaImages} />
              </motion.div>
            )}
            {/* Autres onglets simplifiés pour l'exemple */}
            {activeTab !== 'videos' && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center text-neutral-400">
                <p className="text-sm font-bold uppercase">Aucun contenu</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
