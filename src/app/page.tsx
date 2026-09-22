'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles, User, Building, Phone, Mail, ShieldAlert } from 'lucide-react';
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
      description: 'Vous avez été déconnecté avec succès.',
    });
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Chargement de votre espace...</p>
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
            <p className="text-xs text-muted-foreground">Espace Excellence</p>
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
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-card rounded-xl border text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{profile?.name || 'Cher Membre'}</CardTitle>
                  <CardDescription className="capitalize font-semibold text-primary/80 mt-0.5">
                    Statut : {profile?.role || 'Membre'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{profile?.company || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/30 border border-border/30 sm:col-span-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile?.phone || 'Aucun numéro de téléphone rattaché'}</span>
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
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Bienvenue dans votre module d'accès premium.</p>
              <p>Les fonctionnalités de messagerie, d'annuaire et d'événements exclusifs de la V1 se chargeront au fur et à mesure de l'activation des modules.</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
