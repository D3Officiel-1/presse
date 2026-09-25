'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Sparkles, 
  Check, 
  AtSign, 
  Phone, 
  User, 
  School, 
  Search, 
  MapPin 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import MARCORY_DATA from '@/components/etablissement/abidjan_2/marcory.json';
import KOUMASSI_DATA from '@/components/etablissement/abidjan_2/koumassi.json';
import PORT_BOUET_DATA from '@/components/etablissement/abidjan_2/port_bouet.json';
import TREICHVILLE_DATA from '@/components/etablissement/abidjan_2/treichville.json';

const CLASSES = [
  { id: '6e', title: 'Sixième (6e)' },
  { id: '5e', title: 'Cinquième (5e)' },
  { id: '4e', title: 'Quatrième (4e)' },
  { id: '3e', title: 'Troisième (3e)' },
  { id: '2nde', title: 'Seconde (2nde)' },
  { id: '1ere', title: 'Première (1ère)' },
  { id: 'tle', title: 'Terminale (Tle)' },
];

const COMMUNES = [
  { id: 'marcory', name: 'Marcory', data: MARCORY_DATA },
  { id: 'koumassi', name: 'Koumassi', data: KOUMASSI_DATA },
  { id: 'port_bouet', name: 'Port-Bouët', data: PORT_BOUET_DATA },
  { id: 'treichville', name: 'Treichville', data: TREICHVILLE_DATA },
];

export default function OnboardingPage(props: { params: Promise<any>; searchParams: Promise<any> }) {
  const _params = React.use(props.params);
  const _searchParams = React.use(props.searchParams);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(false);
  
  const firestoreInstance = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      router.replace('/auth/login');
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
          toast({ variant: 'destructive', title: 'Pseudo indisponible', description: 'Ce pseudo est déjà utilisé.' });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (step === 4) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone) {
        toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez renseigner votre numéro.' });
        return;
      }
      if (cleanPhone.length !== 10) {
        toast({ variant: 'destructive', title: 'Format incorrect', description: 'Le numéro doit avoir 10 chiffres.' });
        return;
      }
      if (!['01', '05', '07'].includes(cleanPhone.substring(0, 2))) {
        toast({ variant: 'destructive', title: 'Indicatif invalide', description: 'Le numéro doit commencer par 01, 05 ou 07.' });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step === 5 && selectedSchool) {
      setSelectedSchool(null);
      return;
    }
    if (step === 5 && selectedCommune) {
      setSelectedCommune(null);
      return;
    }
    setStep((prev) => Math.max(1, prev - 1));
  };

  const filteredSchools = useMemo(() => {
    if (!selectedCommune) return [];
    const communeData = COMMUNES.find(c => c.id === selectedCommune)?.data || [];
    if (!schoolSearch.trim()) return communeData;
    return communeData.filter((s: any) => 
      s.nom_etab.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.code_etab.toLowerCase().includes(schoolSearch.toLowerCase())
    );
  }, [selectedCommune, schoolSearch]);

  const handleCompleteOnboarding = () => {
    if (!selectedSchool) {
      toast({ variant: 'destructive', title: 'Sélection requise', description: 'Veuillez sélectionner votre école dans la liste.' });
      return;
    }

    const uid = localStorage.getItem('userId');
    if (!uid) return;

    setLoading(true);
    const userDocRef = doc(firestoreInstance, 'users', uid);
    const updateData = {
      name: fullName.trim(),
      classe: selectedClasse,
      username: username.trim().toLowerCase(),
      phone: phone,
      company: selectedSchool.nom_etab,
      schoolCode: selectedSchool.code_etab,
      schoolType: selectedSchool.type_etab,
      commune: COMMUNES.find(c => c.id === selectedCommune)?.name,
      onboarded: true,
      updatedAt: new Date()
    };

    setDoc(userDocRef, updateData, { merge: true })
      .then(() => {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: fullName.trim(), username: username.trim().toLowerCase() }));
        }

        toast({
          title: 'Profil activé !',
          description: 'Bienvenue officiellement sur le Studio ZAP.',
        });
        
        router.replace('/zap');
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de finaliser le profil.',
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
            {step === 1 && <><Sparkles className="w-4 h-4 text-primary" /> Faisons connaissance</>}
            {step === 2 && <><Sparkles className="w-4 h-4 text-primary" /> Dans quelle classe es-tu ?</>}
            {step === 3 && <><Sparkles className="w-4 h-4 text-primary" /> Ton pseudo unique</>}
            {step === 4 && <><Sparkles className="w-4 h-4 text-primary" /> Numéro WhatsApp</>}
            {step === 5 && <><Sparkles className="w-4 h-4 text-primary" /> Ton établissement</>}
          </h2>
        </div>

        <div className="min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Nom Complet</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
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
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-2.5">
                {CLASSES.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClasse(c.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between",
                      selectedClasse === c.id ? 'border-primary bg-primary/5 font-black' : 'border-neutral-200 bg-white font-bold',
                      c.id === 'tle' && "col-span-2"
                    )}
                  >
                    <span className="text-sm">{c.title}</span>
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", selectedClasse === c.id ? 'bg-primary border-primary' : 'border-neutral-300')}>
                      {selectedClasse === c.id && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Pseudo Public</Label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      placeholder="ex: marc_vfx"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="pl-12 h-14 bg-white border-neutral-200 rounded-2xl text-base font-bold font-mono"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Téléphone (10 chiffres)</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="tel"
                      placeholder="0707070707"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').substring(0, 10))}
                      className="pl-12 h-14 bg-white border-neutral-200 rounded-2xl text-base font-bold font-mono"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4 h-full">
                {!selectedCommune ? (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Choisis ta commune</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {COMMUNES.map((commune) => (
                        <Button
                          key={commune.id}
                          variant="outline"
                          onClick={() => setSelectedCommune(commune.id)}
                          className="h-14 rounded-2xl border-neutral-200 justify-start px-6 font-bold text-sm bg-white hover:bg-neutral-50"
                        >
                          <MapPin className="w-4 h-4 mr-3 text-primary" />
                          {commune.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col h-full">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Rechercher ton école..."
                        value={schoolSearch}
                        onChange={(e) => setSchoolSearch(e.target.value)}
                        className="pl-10 h-12 bg-white border-neutral-200 rounded-xl text-base font-bold"
                        autoFocus
                      />
                    </div>
                    
                    <ScrollArea className="flex-1 max-h-[240px] border border-neutral-100 rounded-2xl bg-white p-2">
                      <div className="space-y-1">
                        {filteredSchools.length > 0 ? (
                          filteredSchools.map((school: any) => (
                            <div
                              key={school.code_etab}
                              onClick={() => setSelectedSchool(school)}
                              className={cn(
                                "p-3 rounded-xl cursor-pointer transition-all text-left group",
                                selectedSchool?.code_etab === school.code_etab
                                  ? 'bg-primary text-white'
                                  : 'hover:bg-neutral-50 border-b border-neutral-50 last:border-0'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-black leading-tight uppercase tracking-tight">{school.nom_etab}</p>
                                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedSchool?.code_etab === school.code_etab ? 'text-white/80' : 'text-neutral-400')}>
                                    {school.type_etab} • {school.code_etab}
                                  </p>
                                </div>
                                {selectedSchool?.code_etab === school.code_etab && <Check className="w-4 h-4 shrink-0" />}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-xs text-neutral-400 font-bold uppercase tracking-widest">
                            Aucun établissement trouvé
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {selectedSchool && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                        <School className="w-5 h-5 text-primary shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Établissement sélectionné</p>
                          <p className="text-xs font-black truncate max-w-[280px]">{selectedSchool.nom_etab}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex w-full items-center gap-3">
            {(step > 1 || selectedCommune) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="rounded-2xl px-6 border-neutral-200 text-neutral-600 font-black text-xs h-14 bg-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Retour
              </Button>
            )}

            {step < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 bg-neutral-900 text-white rounded-2xl font-black text-xs h-14 shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Suivant <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading || !selectedSchool}
                className="flex-1 bg-primary text-white rounded-2xl font-black text-xs h-14 shadow-md disabled:opacity-50 disabled:grayscale transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Finaliser'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
