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
import { Progress } from '@/components/ui/progress';
import { UserCircle, Lock, Loader2, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTH_DOMAIN = "@zap.ci";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const authInstance = useAuth();
  const firestoreInstance = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleNextStep = () => {
    if (step === 1) {
      if (!matricule.trim()) {
        toast({
          variant: 'destructive',
          title: 'Matricule requis',
          description: 'Veuillez saisir votre matricule unique fourni par votre établissement.',
        });
        return;
      }
      if (matricule.trim().length < 4) {
        toast({
          variant: 'destructive',
          title: 'Format incorrect',
          description: 'Le matricule semble trop court pour être valide.',
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
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez configurer et confirmer votre mot de passe.' });
      return;
    }

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Mot de passe trop court', description: 'Pour votre sécurité, utilisez au moins 6 caractères.' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Erreur de saisie', description: 'Les deux mots de passe ne sont pas identiques.' });
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
        description: 'Bienvenue au Studio ZAP. Configurons maintenant votre pass.',
      });

      router.push('/auth/onboarding');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Inscription impossible',
        description: error.code === 'auth/email-already-in-use' ? 'Ce matricule est déjà enregistré sur la plateforme.' : error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = step === 1 ? 50 : 100;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F9F9FC] text-neutral-900 overflow-y-auto px-4 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] justify-start items-center relative">
      
      {/* Dynamic Aurora Ambient Background (Light Mode) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.04) 0%, transparent 60%)' }}
        />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Global Progress Bar Indicator - Reinvented */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-neutral-200/60 shadow-sm w-full space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Étape {step} sur 2
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
              {step === 1 ? 'Vérification Pass' : 'Sécurisation'}
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-neutral-100" />
        </div>

        {/* Step Interactive Card Container */}
        <Card className="border-neutral-200/60 shadow-[0_20px_40px_rgba(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden">
          <form onSubmit={handleRegister}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
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
              </CardTitle>
              <CardDescription className="normal-case text-xs text-muted-foreground font-medium">
                {step === 1 
                  ? 'Entrez le matricule officiel de votre pass scolaire ou de votre carte étudiante.' 
                  : 'Choisissez un accès sécurisé pour protéger vos productions et vos badges.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="min-h-[160px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-matricule"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="matricule" className="text-xs font-bold text-neutral-700">Numéro Matricule Élève</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
                        <Input
                          id="matricule"
                          placeholder="Ex: 24X94829R"
                          value={matricule}
                          onChange={(e) => setMatricule(e.target.value)}
                          className="pl-11 h-12 bg-neutral-50/50 border-neutral-200 rounded-xl font-semibold tracking-wide placeholder:font-normal placeholder:text-neutral-400 text-sm focus-visible:ring-primary/20"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Educational Helper Banner */}
                    <div className="flex gap-2.5 p-3 bg-primary/5 rounded-xl border border-primary/10 text-[11px] leading-relaxed text-neutral-600 font-medium">
                      <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Ce matricule sert d'identifiant unique. Vos futurs projets et films courts y seront directement associés.</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-bold text-neutral-700">Mot de passe secret</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minimum 6 caractères"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 h-12 bg-neutral-50/50 border-neutral-200 rounded-xl text-sm focus-visible:ring-primary/20"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs font-bold text-neutral-700">Confirmation du mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Répétez le mot de passe exact"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-11 h-12 bg-neutral-50/50 border-neutral-200 rounded-xl text-sm focus-visible:ring-primary/20"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t border-neutral-100 pt-4 bg-neutral-50/50">
              <div className="flex w-full items-center justify-between gap-3">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackStep}
                    disabled={loading}
                    className="rounded-xl px-4 border-neutral-200 text-neutral-600 font-bold text-xs h-11 active:scale-95 transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                  </Button>
                )}

                {step === 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-bold text-xs h-11 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    Continuer <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white hover:bg-primary/95 rounded-xl font-bold text-xs h-11 active:scale-95 transition-all shadow-md shadow-primary/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Création du pass...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Finaliser l'inscription
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="text-center w-full">
                <span className="text-xs text-muted-foreground font-medium">Déjà inscrit ? </span>
                <Link href="/auth/login" className="text-xs text-primary font-bold hover:underline transition-all">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  );
}