'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Check, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { id: 'leader', title: 'Membre Exécutif', description: 'Membre actif participant aux décisions stratégiques et commissions.' },
  { id: 'partner', title: 'Partenaire Officiel', description: 'Soutien et partenaire du réseau d\'excellence commerciale.' },
  { id: 'guest', title: 'Invité d\'Honneur', description: 'Observateur, conférencier ou contributeur ponctuel.' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  
  const firestoreInstance = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleNext = () => {
    if (step === 1 && !fullName.trim()) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez renseigner votre nom complet.' });
      return;
    }
    if (step === 2 && !selectedRole) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez sélectionner un statut.' });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleCompleteOnboarding = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;

    setLoading(true);
    try {
      const userDocRef = doc(firestoreInstance, 'users', uid);
      const updateData = {
        name: fullName,
        role: selectedRole,
        phone: phone,
        company: company,
        onboarded: true,
        updatedAt: new Date()
      };

      await setDoc(userDocRef, updateData, { merge: true });

      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsed, name: fullName }));
      }

      toast({
        title: 'Profil complété !',
        description: 'Bienvenue officiellement sur la plateforme NOVA.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de sauvegarde',
        description: error.message || 'Impossible de finaliser le profil.',
      });
    } finally {
      setLoading(false);
    }
  };

  const progressValue = (step / 3) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <div className="w-full max-w-lg mb-4">
        <Progress value={progressValue} className="h-2" />
        <p className="text-right text-xs font-medium text-muted-foreground mt-1">Étape {step} sur 3</p>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-widest">Configuration initiale</span>
          </div>
          <CardTitle className="text-xl">
            {step === 1 && 'Faisons connaissance'}
            {step === 2 && 'Votre statut au sein du club'}
            {step === 3 && 'Informations professionnelles'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Entrez vos informations de base pour votre badge numérique de membre.'}
            {step === 2 && 'Sélectionnez le statut qui correspond le mieux à votre profil.'}
            {step === 3 && 'Ces détails aideront les autres membres à vous contacter.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[220px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet (Prénom & Nom)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {ROLES.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                      selectedRole === r.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border/60 hover:border-border bg-card'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedRole === r.id ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {selectedRole === r.id && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{r.title}</h4>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise / Organisation</Label>
                  <Input
                    id="company"
                    placeholder="Ex: Innovate Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+225 07 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className={step === 1 ? 'opacity-0 pointer-events-none' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext}>
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCompleteOnboarding} disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalisation...
                </>
              ) : (
                'Accéder à la Plateforme'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
