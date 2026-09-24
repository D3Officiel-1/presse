'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

const AUTH_DOMAIN = "@zap.ci";

export default function LoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const authInstance = useAuth();
  const firestoreInstance = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule || !password) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir votre matricule et mot de passe.',
      });
      return;
    }

    setLoading(true);
    try {
      const technicalEmail = `${matricule.trim().toLowerCase()}${AUTH_DOMAIN}`;
      
      const userCredential = await signInWithEmailAndPassword(authInstance, technicalEmail, password);
      const firebaseUser = userCredential.user;

      const deviceId = Math.random().toString(36).substring(2, 15);
      const userDocRef = doc(firestoreInstance, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let isOnboarded = false;
      if (userDoc.exists()) {
        const data = userDoc.data();
        isOnboarded = data.onboarded || false;
      }

      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        matricule: matricule.trim().toUpperCase(),
        email: technicalEmail,
        deviceId: deviceId,
        online: true,
        lastSeen: new Date()
      }, { merge: true });

      localStorage.setItem('userId', firebaseUser.uid);
      localStorage.setItem('deviceId', deviceId);
      localStorage.setItem('user', JSON.stringify({
        uid: firebaseUser.uid,
        matricule: matricule.trim().toUpperCase(),
        name: userDoc.exists() ? userDoc.data()?.name : ''
      }));

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre espace ZAP.',
      });

      router.push(isOnboarded ? '/' : '/auth/onboarding');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'accès',
        description: 'Matricule ou mot de passe incorrect.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F9F9FC] text-neutral-900 overflow-y-auto px-4 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] justify-start items-center relative">
      
      {/* Background Aurora */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 60%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 space-y-6"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 p-2 rounded-2xl bg-primary/10 text-primary mb-2 flex items-center justify-center">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">ZAP</h2>
        </div>

        <Card className="border-neutral-200/60 shadow-[0_20px_40px_rgba(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Identifiez-vous avec votre matricule
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="matricule"
                    placeholder="Ex: 26882900A"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="pl-10 h-12"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-neutral-100 pt-4 bg-neutral-50/50">
              <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Se connecter'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="text-primary font-medium hover:underline">
                  Créer un compte
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
