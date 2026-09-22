
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles, User, Building, Phone, BadgeCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.push('/auth/login');
      return;
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
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6 flex flex-col items-center">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Leaders Club</h1>
            <p className="text-xs text-muted-foreground">Excellence Saint-Exupéry</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
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
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-secondary/30 border border-border/30">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Statut Club</span>
                  <span className="font-semibold text-primary">{profile?.role || 'Membre Actif'}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-secondary/30 border border-border/30">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Entreprise</span>
                  <span className="font-semibold truncate">{profile?.company || 'Non renseignée'}</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/30 sm:col-span-2">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{profile?.phone || 'Pas de numéro enregistré'}</span>
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
          <Card className="border-border/60 bg-primary/5 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" /> Club Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>Votre badge digital est lié au matricule <strong>{profile?.matricule}</strong>.</p>
              <p>En cas de perte d'accès, veuillez fournir ce matricule au support technique du club.</p>
              <div className="pt-4 border-t border-primary/10">
                <p className="text-[10px] text-muted-foreground/60 italic leading-tight">
                  Identifiant technique :<br />
                  {profile?.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
