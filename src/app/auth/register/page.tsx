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
import { ChevronRight, ChevronLeft, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const AUTH_DOMAIN = "@zap.ci";

export default function RegisterPage(props: { params?: Promise<any>; searchParams?: Promise<any> }) {
  if (props?.params) { React.use(props.params); }
  if (props?.searchParams) { React.use(props.searchParams); }

  const [step, setStep] = useState(1);
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const authInstance = useAuth();
  const firestoreInstance = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleMatriculeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setMatricule(cleanValue);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!matricule.trim()) {
        toast({
          variant: 'destructive',
          title: 'Matricule requis',
          description: 'Veuillez saisir votre matricule unique.',
        });
        return;
      }
      if (matricule.trim().length < 4) {
        toast({
          variant: 'destructive',
          title: 'Format incorrect',
          description: 'Le matricule est trop court pour être valide.',
        });
        return;
      }
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!password || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez configurer votre mot de passe.' });
      return;
    }

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Mot de passe trop court', description: 'Utilisez au moins 6 caractères.' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Erreur de confirmation', description: 'Les deux mots de passe ne correspondent pas.' });
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
        title: 'Compte initialisé !',
        description: 'Bienvenue au Studio ZAP. Configurons votre pass.',
      });

      router.push('/auth/onboarding');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Inscription impossible',
        description: error.code === 'auth/email-already-in-use' ? 'Ce matricule est déjà enregistré.' : error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F9F9FC] text-neutral-900 px-6 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] justify-start items-center relative overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,39,0,0.06) 0%, transparent 60%)' }}
        />
      </div>

      <div className="w-full max-w-md z-10 space-y-8 mt-4">
        <div className="flex justify-center gap-2">
          {[1, 2].map((s) => (
            <div 
              key={s}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                step === s ? "bg-primary scale-125" : "bg-neutral-200"
              )}
            />
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight text-neutral-900 flex items-center justify-center gap-2">
              {step === 1 ? (
                <>
                  <Sparkles className="w-4 h-4 text-primary" />
                  Quel est votre matricule ?
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Créez votre mot de passe
                </>
              )}
            </h2>
          </div>

          <div className="min-h-[140px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-matricule"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-full relative max-w-xs mx-auto">
                      <Input
                        id="matricule"
                        placeholder="EX: 24X94829"
                        value={matricule}
                        onChange={handleMatriculeChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNextStep();
                          }
                        }}
                        className="w-full h-14 bg-white border-2 border-primary/20 rounded-2xl text-center font-mono font-black tracking-widest text-lg shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase placeholder:text-neutral-300 px-4"
                        disabled={loading}
                        autoFocus
                        maxLength={15}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-2 opacity-60">
                      Lettres majuscules et chiffres uniquement
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe secret (min 6)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-white border-neutral-200 rounded-xl pr-12 pl-4 text-base focus-visible:ring-primary/20"
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 bg-white border-neutral-200 rounded-xl pr-12 px-4 text-base focus-visible:ring-primary/20"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-6 pt-2">
            <div className="flex w-full items-center justify-between gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackStep}
                  disabled={loading}
                  className="rounded-xl px-4 border-neutral-200 text-neutral-600 font-bold text-xs h-11 transition-all bg-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                </Button>
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-bold text-xs h-11 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white hover:bg-primary/95 rounded-xl font-bold text-xs h-11 transition-all shadow-md"
                >
                  {loading ? 'Création...' : 'Finaliser l\'inscription'}
                </Button>
              )}
            </div>

            <div className="text-center w-full">
              <span className="text-xs text-muted-foreground font-medium">Déjà inscrit ? </span>
              <Link href="/auth/login" className="text-xs text-primary font-bold hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}