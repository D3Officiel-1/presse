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
import { UserCircle, Lock, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

const AUTH_DOMAIN = "@zap.ci";

export default function LoginPage(props: { params: Promise<any>; searchParams: Promise<any> }) {
  const _params = React.use(props.params);
  const _searchParams = React.use(props.searchParams);

  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        title: 'Champs requis',
        description: 'Veuillez renseigner votre matricule et votre mot de passe.',
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
        matricule: firebaseUser.email?.split('@')[0].toUpperCase(),
        name: userDoc.exists() ? userDoc.data()?.name : ''
      }));

      toast({
        title: 'Connexion réussie',
        description: 'Bon retour dans votre Studio ZAP.',
      });

      router.replace(isOnboarded ? '/zap' : '/auth/onboarding');
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
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F9F9FC] text-neutral-900 px-6 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] justify-start items-center relative overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,39,0,0.05) 0%, transparent 60%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 space-y-8 mt-4"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 p-4 rounded-[2.5rem] bg-white border border-neutral-200 shadow-sm mb-4 flex items-center justify-center">
            <Logo />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-950">Accès Studio ZAP</h2>
          <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1.5 opacity-60 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" /> Connectez votre pass de créateur
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricule" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Matricule</Label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="matricule"
                  placeholder="EX: 26882900A"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                  className="pl-12 h-14 bg-white border-neutral-200 rounded-2xl text-base focus-visible:ring-primary/10 transition-all font-mono font-bold"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Mot de passe</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-white border-neutral-200 rounded-2xl text-base focus-visible:ring-primary/10 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-4">
            <Button type="submit" className="w-full rounded-2xl h-14 bg-neutral-900 text-white font-black text-sm tracking-tight shadow-md hover:bg-neutral-800 transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Accéder à mon Studio'}
            </Button>
            
            <div className="text-center">
              <span className="text-xs text-muted-foreground font-bold">Nouveau ici ? </span>
              <Link href="/auth/register" className="text-xs text-primary font-black hover:underline">
                Créer mon Pass
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
