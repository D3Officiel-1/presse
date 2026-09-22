
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Lock, Loader2, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AUTH_DOMAIN = "@leadersclub.ci";

export default function RegisterPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const authInstance = useAuth();
  const firestoreInstance = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule || !password || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    try {
      const technicalEmail = `${matricule.trim().toLowerCase()}${AUTH_DOMAIN}`;
      
      const userCredential = await createUserWithEmailAndPassword(authInstance, technicalEmail, password);
      const firebaseUser = userCredential.user;

      const deviceId = Math.random().toString(36).substring(2, 15);
      const userDocRef = doc(firestoreInstance, 'users', firebaseUser.uid);

      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        matricule: matricule.trim().toUpperCase(),
        email: technicalEmail,
        deviceId: deviceId,
        onboarded: false,
        online: true,
        createdAt: new Date(),
      });

      localStorage.setItem('userId', firebaseUser.uid);
      localStorage.setItem('deviceId', deviceId);
      localStorage.setItem('user', JSON.stringify({
        uid: firebaseUser.uid,
        matricule: matricule.trim().toUpperCase(),
        name: ''
      }));

      toast({
        title: 'Inscription réussie',
        description: 'Bienvenue au club ! Complétez votre profil.',
      });

      router.push('/auth/onboarding');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.code === 'auth/email-already-in-use' ? 'Ce matricule est déjà utilisé.' : error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/90">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2 text-primary">
              <UserPlus className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">Rejoindre le club</span>
            </div>
            <CardTitle className="text-xl text-center">Créer un compte</CardTitle>
            <CardDescription className="text-center">
              Enregistrez-vous avec votre matricule
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="matricule"
                    placeholder="Ex: 20492945R"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="pl-10 h-12"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'S\'inscrire'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Déjà inscrit ?{' '}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
