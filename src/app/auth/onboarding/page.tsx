'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Check, User, Camera, Film, PenTool, Music, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { id: 'leader', title: 'Créateur Étoile', description: 'Élève actif publiant des projets, courts-métrages et tutoriels.' },
  { id: 'partner', title: 'Partenaire Club', description: 'Établissement scolaire, encadrant ou mentor créatif.' },
  { id: 'guest', title: 'Visiteur Inspiré', description: 'Observateur, juré des challenges ou contributeur ponctuel.' },
];

const INTERESTS_OPTIONS = [
  { id: 'direction', title: 'Réalisation & Cadrage', icon: Camera },
  { id: 'editing', title: 'Montage & FX / VFX', icon: Film },
  { id: 'acting', title: 'Jeu d\'Acteur & Théâtre', icon: User },
  { id: 'script', title: 'Scénario & Storyboard', icon: PenTool },
  { id: 'audio', title: 'Production Son & Musique', icon: Music },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
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
    if (step === 3 && (!company.trim() || !phone.trim())) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez renseigner votre école et votre numéro WhatsApp.' });
      return;
    }
    if (step === 4 && selectedInterests.length === 0) {
      toast({ variant: 'destructive', title: 'Sélection requise', description: 'Choisissez au moins une compétence ou un centre d\'intérêt.' });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCompleteOnboarding = () => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;

    setLoading(true);
    const userDocRef = doc(firestoreInstance, 'users', uid);
    const updateData = {
      name: fullName,
      role: selectedRole,
      phone: phone,
      company: company,
      interests: selectedInterests,
      bio: bio.trim(),
      onboarded: true,
      updatedAt: new Date()
    };

    setDoc(userDocRef, updateData, { merge: true })
      .then(() => {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: fullName }));
        }

        toast({
          title: 'Profil complété !',
          description: 'Bienvenue officiellement sur la plateforme ZAP.',
        });
        router.push('/');
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: error.message || 'Impossible de finaliser le profil.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const progressValue = (step / 5) * 100;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F9F9FC] text-neutral-900 overflow-y-auto px-4 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] justify-start items-center relative">
      
      <div className="w-full max-w-lg mb-4 z-10">
        <Progress value={progressValue} className="h-1.5" />
        <p className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Étape {step} sur 5</p>
      </div>

      <Card className="w-full max-w-lg shadow-[0_20px_40px_rgba(0,0,0,0.03)] border-neutral-200/60 bg-white rounded-3xl z-10 overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Configuration du Pass Studio</span>
          </div>
          <CardTitle className="text-lg">
            {step === 1 && 'Faisons connaissance'}
            {step === 2 && 'Votre rôle au sein de l\'app'}
            {step === 3 && 'Informations scolaires & contact'}
            {step === 4 && 'Vos super-pouvoirs créatifs'}
            {step === 5 && 'Votre univers en quelques mots'}
          </CardTitle>
          <CardDescription className="normal-case text-xs text-muted-foreground">
            {step === 1 && 'Entrez vos informations de base pour votre pass de créateur ZAP.'}
            {step === 2 && 'Sélectionnez le statut qui correspond le mieux à votre profil.'}
            {step === 3 && 'Ces détails aideront le club et vos camarades à vous identifier.'}
            {step === 4 && 'Sélectionnez les domaines vidéo et artistiques qui vous passionnent le plus.'}
            {step === 5 && 'Ajoutez une courte devise ou biographie qui apparaîtra sur votre Pass de membre.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[240px]">
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
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
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
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                      selectedRole === r.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-card'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedRole === r.id ? 'bg-primary border-primary text-primary-foreground' : 'border-neutral-400'
                    }`}>
                      {selectedRole === r.id && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">{r.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
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
                  <Label htmlFor="company">Établissement Scolaire / Lycée / Collège</Label>
                  <Input
                    id="company"
                    placeholder="Ex: Lycée Classique d'Abidjan"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: +225 07 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                <Label className="text-xs text-neutral-500 block mb-1">Sélectionnez une ou plusieurs options :</Label>
                <div className="grid grid-cols-1 gap-2.5">
                  {INTERESTS_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedInterests.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleInterest(option.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm text-neutral-900 font-bold'
                            : 'border-neutral-200 hover:border-neutral-300 bg-card text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{option.title}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-neutral-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-primary" /> Devise de Créateur / Courte Bio
                  </Label>
                  <Textarea
                    id="bio"
                    maxLength={160}
                    placeholder="Ex: Passionné de courts-métrages de fiction et de montage rythmé sur CapCut ! Prêt pour tous les challenges ZAP !"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[110px] resize-none focus-visible:ring-primary rounded-xl"
                  />
                  <p className="text-[10px] text-right text-muted-foreground font-semibold">
                    {bio.length} / 160 caractères au maximum
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-neutral-100 pt-4 bg-neutral-50/50">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className={`rounded-xl h-11 text-neutral-600 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
          </Button>

          {step < 5 ? (
            <Button onClick={handleNext} className="rounded-xl h-11 px-5">
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCompleteOnboarding} disabled={loading} className="rounded-xl h-11 bg-primary text-white hover:bg-primary/90 px-5 shadow-md">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activation...
                </>
              ) : (
                'Finaliser & Accéder'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}