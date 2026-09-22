'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles, User, Phone, BadgeCheck, ShieldAlert, Award, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

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
        router.push('/auth/login');
      }, 2500);
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
        }, 2500);
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
    router.push('/auth/login');
  };

  if (showSplash || loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden select-none z-[9999]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [-100, 100, -100],
              y: [-50, 50, -50],
              scale: [1, 1.2, 1],
              opacity: [0.08, 0.15, 0.08],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-primary/10 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              x: [100, -100, 100],
              y: [50, -50, 50],
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.12, 0.05],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-primary/20 blur-[120px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-20 bg-primary/10 blur-[60px] rounded-full pointer-events-none"
          />

          <div className="w-32 h-32 bg-gradient-to-br from-primary to-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_25px_60px_rgba(255,149,0,0.25),inset_0_2px_10px_rgba(255,255,255,0.4)] relative overflow-hidden border border-white/20">
            <motion.div
              initial={{ x: "-150%" }}
              animate={{ x: "250%" }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="text-white"
            >
              <Sparkles className="w-16 h-16 animate-pulse-subtle" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 text-center"
        >
          <h1 className="text-6xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground">
            BAC<span className="text-primary italic ml-1">CI</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-3">
            BACCI Executive Club
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-6 flex flex-col items-center">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BACCI Executive</h1>
            <p className="text-xs text-muted-foreground">Club d'Excellence Affaires</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive rounded-xl">
          <LogOut className="w-4 h-4 mr-2" /> Déconnexion
        </Button>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          <Card className="border-border/60 shadow-lg" variant="premium">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-card rounded-2xl border-2 border-primary/20 text-primary shadow-inner">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile?.name || 'Membre'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Matricule : <span className="text-foreground font-bold">{profile?.matricule}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/30">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">Statut Club</span>
                    <span className="font-semibold text-sm capitalize">{profile?.role || 'Membre Actif'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/30">
                  <Briefcase className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">Entreprise</span>
                    <span className="font-semibold text-sm truncate">{profile?.company || 'Non renseignée'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/30 sm:col-span-2">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">Contact direct</span>
                    <span className="font-semibold text-sm">{profile?.phone || 'Pas de numéro enregistré'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/60 bg-primary/5 shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" /> Club Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>Votre badge digital de membre d'excellence est officiellement lié au matricule <strong>{profile?.matricule}</strong>.</p>
              <p>En cas de perte d'accès ou pour modifier vos coordonnées de membre, veuillez fournir ce matricule aux administrateurs de la plateforme.</p>
              <div className="pt-4 border-t border-primary/10">
                <p className="text-[10px] text-muted-foreground/60 italic leading-tight">
                  Identifiant technique sécurisé :<br />
                  <span className="font-mono">{profile?.email}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}