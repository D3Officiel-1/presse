'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Check, User, Camera, Film, PenTool, Music, Quote, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CLASSES = [
  { id: '6e', title: 'Sixième (6e)' },
  { id: '5e', title: 'Cinquième (5e)' },
  { id: '4e', title: 'Quatrième (4e)' },
  { id: '3e', title: 'Troisième (3e)' },
  { id: '2nde', title: 'Seconde (2nde)' },
  { id: '1ere', title: 'Première (1ère)' },
  { id: 'tle', title: 'Terminale (Tle)' },
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
  const [selectedClasse, setSelectedClasse] = useState('');
  const [username, setUsername] = useState('');
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

  const handleNext = async () => {
    if (step === 1 && !fullName.trim()) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez renseigner votre nom complet.' });
      return;
    }
    if (step === 2 && !selectedClasse) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez sélectionner votre classe.' });
      return;
    }
    if (step === 3) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!cleanUsername) {
        toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez choisir un pseudo.' });
        return;
      }
      if (cleanUsername.length < 3) {
        toast({ variant: 'destructive', title: 'Trop court', description: 'Le pseudo doit comporter au moins 3 caractères.' });
        return;
      }

      setLoading(true);
      try {
        const uid = localStorage.getItem('userId');
        const usersRef = collection(firestoreInstance, 'users');
        const q = query(usersRef, where('username', '==', cleanUsername));
        const querySnapshot = await getDocs(q);
        
        let isTaken = false;
        querySnapshot.forEach((doc) => {
          if (doc.id !== uid) {
            isTaken = true;
          }
        });

        if (isTaken) {
          toast({ variant: 'destructive', title: 'Pseudo indisponible', description: 'Ce pseudo est déjà utilisé par un autre membre.' });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(value);
  };

  const handleCompleteOnboarding = () => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;

    setLoading(true);
    const userDocRef = doc(firestoreInstance, 'users', uid);
    const updateData = {
      name: fullName,
      classe: selectedClasse,
      username: username.trim().toLowerCase(),
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
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: fullName, username: username.trim().toLowerCase() }));
        }

        toast({
          title: 'Profil activé !',
          description: 'Bienvenue officiellement sur le Studio ZAP.',
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

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#F9F9FC] text-neutral-900 px-6 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] justify-start items-center relative overflow-y-auto">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,39,0,0.04) 0%, transparent 60%)' }}
        />
      </div>

      <div className="w-full max-w-md z-10 space-y-8 mt-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                step === s ? "bg-primary scale-125" : "bg-neutral-200"
              )}
            />
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black tracking-tight text-neutral-900 flex items-center justify-center gap-2">
            {step === 1 && (
              <>
                <Sparkles className="w-4 h-4 text-primary" />
                Faisons connaissance
              </>
            )}
            {step === 2 && (
              <>
                <Sparkles className="w-4 h-4 text-primary" />
                Dans quelle classe es-tu ?
              </>
            )}
            {step === 3 && (
              <>
                <Sparkles className="w-4 h-4 text-primary" />
                Choisis ton pseudo unique
              </>
            )}
            {step === 4 && (
              <>
                <Sparkles className="w-4 h-4 text-primary" />
                Vos super-pouvoirs
              </>
            )}
            {step === 5 && (
              <>
                <Sparkles className="w-4 h-4 text-primary" />
                Votre univers
              </>
            )}
          </h2>
        </div>

        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Nom Complet</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      id="fullName"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-14 bg-white border-neutral-200 rounded-2xl text-base focus-visible:ring-primary/10 transition-all font-bold"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-2.5"
              >
                {CLASSES.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClasse(c.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between text-left",
                      selectedClasse === c.id
                        ? 'border-primary bg-primary/5 shadow-sm font-black'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 font-bold',
                      c.id === 'tle' && "col-span-2"
                    )}
                  >
                    <span className="text-sm text-neutral-900 tracking-tight">{c.title}</span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedClasse === c.id ? 'bg-primary border-primary text-white' : 'border-neutral-300'
                    )}>
                      {selectedClasse === c.id && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Pseudo Public Unique</Label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      id="username"
                      placeholder="ex: marc_vfx"
                      value={username}
                      onChange={handleUsernameChange}
                      className="pl-12 h-14 bg-white border-neutral-200 rounded-2xl text-base focus-visible:ring-primary/10 transition-all font-bold font-mono"
                      autoFocus
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium block px-1">
                    Uniquement des lettres minuscules, chiffres, tirets (-) ou underscores (_)
                  </span>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-2.5">
                  {INTERESTS_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedInterests.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleInterest(option.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between",
                          isSelected
                            ? 'border-primary bg-primary/5 text-neutral-950 font-black'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 font-bold'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", isSelected ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500')}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-sm tracking-tight">{option.title}</span>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                          isSelected ? 'bg-primary border-primary text-white' : 'border-neutral-300'
                        )}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 flex items-center gap-1.5 justify-center">
                    <Quote className="w-3 h-3 text-primary" /> Devise de Créateur
                  </Label>
                  <Textarea
                    id="bio"
                    maxLength={160}
                    placeholder="Ex: Passionné de courts-métrages et de montage rythmé sur CapCut !"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[140px] bg-white border-neutral-200 rounded-2xl text-base focus-visible:ring-primary/10 transition-all font-medium resize-none text-center"
                  />
                  <p className="text-[10px] text-right text-muted-foreground font-black uppercase tracking-wider">
                    {bio.length} / 160 caractères
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex w-full items-center gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="rounded-2xl px-6 border-neutral-200 text-neutral-600 font-black text-xs h-14 bg-white transition-all active:scale-[0.98]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Retour
              </Button>
            )}

            {step < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded-2xl font-black text-xs h-14 transition-all flex items-center justify-center gap-1 shadow-md active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Suivant <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="flex-1 bg-primary text-white hover:bg-primary/95 rounded-2xl font-black text-xs h-14 transition-all shadow-md active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activation...
                  </>
                ) : (
                  'Finaliser & Entrer au Studio'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}