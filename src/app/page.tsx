'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Phone, BadgeCheck, Award, Briefcase, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

export default function Home() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

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
        }, 3500);
      }
    };

    fetchProfile();
  }, [fs, router]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('user');
    toast({
      title: 'Déconnexion',
      description: 'Session terminée.',
    });
    router.push('/auth');
  };

  if (showSplash || loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090B] overflow-hidden select-none z-[9999]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[20%] w-[100%] h-[100%] bg-primary/20 blur-[150px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.05, 0.15, 0.05],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[20%] w-[100%] h-[100%] bg-accent/30 blur-[150px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -20, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-24 bg-primary/20 blur-[80px] rounded-full pointer-events-none"
          />

          <div className="w-40 h-40 bg-[#18181B] rounded-[3rem] flex items-center justify-center shadow-2xl relative overflow-hidden border border-white/10">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
            
            <div className="w-28 h-28 p-2">
              <Logo />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 text-center"
        >
          <h1 className="text-7xl font-black tracking-tighter leading-none text-white">
            NOV<span className="text-primary italic">A</span>
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground mt-4 opacity-70">
            Explosion de Talents
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 flex flex-col items-center">
      <header className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 p-1.5 bg-primary/5 rounded-2xl shadow-inner border border-primary/10">
            <Logo />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">NOVA</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Plateforme de Talents</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive rounded-xl transition-all">
          <LogOut className="w-4 h-4 mr-2" /> Quitter
        </Button>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          <Card className="border-border/60 shadow-2xl" variant="premium">
            <CardHeader className="bg-primary/5 relative">
              <div className="absolute top-4 right-4 text-primary opacity-20">
                <Sparkles className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-5 bg-background rounded-3xl border-2 border-primary/20 text-primary shadow-2xl">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black">{profile?.name || 'Artiste NOVA'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 font-bold">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    ID Membre : <span className="text-foreground tracking-wider">{profile?.matricule}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center gap-4 p-5 rounded-3xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors">
                  <Award className="w-6 h-6 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Rang Social</span>
                    <span className="font-bold text-base capitalize">{profile?.role || 'Nouvelle Étoile'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-3xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors">
                  <Briefcase className="w-6 h-6 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Établissement</span>
                    <span className="font-bold text-base truncate">{profile?.company || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-3xl bg-secondary/30 border border-border/30 sm:col-span-2 hover:border-primary/30 transition-colors">
                  <Phone className="w-6 h-6 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Contact Réseau</span>
                    <span className="font-bold text-base">{profile?.phone || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/60 bg-primary/5 shadow-xl h-full relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 text-primary opacity-5">
              <Logo className="w-40 h-40" />
            </div>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-[0.2em] font-black text-primary/70 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Actu NOVA
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground/80 space-y-5 leading-relaxed relative z-10">
              <p>Bienvenue dans la galaxie <strong>NOVA</strong>. Ton badge numérique est maintenant activé pour ton matricule.</p>
              <p>Prépare-toi à partager tes talents, découvrir des créateurs uniques et briller au sein de la communauté.</p>
              <div className="pt-6 border-t border-primary/20">
                <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/40 mb-1">Pass Technique</p>
                <code className="text-[10px] bg-background/50 p-2 rounded-lg block font-mono text-primary/60">
                  {profile?.email}
                </code>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
