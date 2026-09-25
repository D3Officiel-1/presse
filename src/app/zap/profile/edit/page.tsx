'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Loader2, 
  Camera,
  ChevronRight,
  Copy,
  Check,
  X
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  
  // États locaux des champs
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [commune, setCommune] = useState('');
  const [school, setSchool] = useState('');

  // Synchronisation avec l'ancre d'URL pour le routage des sous-pages
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
      return;
    }

    if (fs) {
      getDoc(doc(fs, 'users', uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setLink(data.link || '');
          setCommune(data.commune || '');
          setSchool(data.company || '');
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [fs, router]);

  // Sauvegarde instantanée sans await bloquant (Optimistic UI)
  const saveSingleField = (fieldName: string, updatedValue: string) => {
    const uid = localStorage.getItem('userId');
    if (!uid || !fs) return;

    setSavingField(true);
    const updatePayload = {
      [fieldName]: updatedValue,
      updatedAt: new Date()
    };

    // Mutation instantanée en tâche de fond pour une réactivité maximale
    setDoc(doc(fs, 'users', uid), updatePayload, { merge: true })
      .then(() => {
        toast({ title: 'Modifié !', description: 'Mise à jour enregistrée avec succès.' });
        window.location.hash = ''; // Retour à l'écran principal
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder la modification.' });
      })
      .finally(() => {
        setSavingField(false);
      });
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast({ title: "Copié !", description: "Lien copié dans le presse-papier." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FC] flex flex-col items-center justify-center text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">Chargement du studio...</p>
      </div>
    );
  }

  // --- RENDU 1 : INTERFACE COMPLÈTE DE CONFIGURATION DU NOM (#nom) ---
  if (currentHash === '#nom') {
    return (
      <div className="min-h-screen bg-white text-neutral-900 animate-fade-up">
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.location.hash = ''} className="text-sm font-bold text-neutral-600">
            Annuler
          </button>
          <h1 className="text-sm font-black text-neutral-950">Nom</h1>
          <button 
            onClick={() => saveSingleField('name', name.trim())}
            disabled={savingField}
            className="text-sm font-black text-primary disabled:opacity-40"
          >
            {savingField ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </button>
        </header>
        <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
          <div className="relative border-b border-neutral-200 pb-1 flex items-center justify-between">
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ajouter votre nom"
              className="w-full bg-transparent border-none outline-none text-base font-medium py-1.5 focus:ring-0"
              autoFocus
            />
            {name.trim().length > 0 && <Check className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
          </div>
          <p className="text-xs text-neutral-400 leading-normal font-medium">
            Votre nom complet sera visible sur votre pass public pour permettre à la communauté de votre établissement scolaire de vous identifier plus facilement.
          </p>
        </main>
      </div>
    );
  }

  // --- RENDU 2 : INTERFACE COMPLÈTE DE CONFIGURATION DU PSEUDO (#username) ---
  if (currentHash === '#username') {
    const cleanUsernameValue = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return (
      <div className="min-h-screen bg-white text-neutral-900 animate-fade-up">
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.location.hash = ''} className="text-sm font-bold text-neutral-600">
            Annuler
          </button>
          <h1 className="text-sm font-black text-neutral-950">Nom d'utilisateur</h1>
          <button 
            onClick={() => {
              if (!cleanUsernameValue) {
                toast({ variant: 'destructive', title: 'Requis', description: 'Le pseudo ne peut pas être vide.' });
                return;
              }
              saveSingleField('username', cleanUsernameValue);
            }}
            disabled={savingField}
            className="text-sm font-black text-primary disabled:opacity-40"
          >
            {savingField ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </button>
        </header>
        <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
          <div className="relative border-b border-neutral-200 pb-1 flex items-center justify-between">
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="Pseudo unique"
              className="w-full bg-transparent border-none outline-none text-base font-mono font-bold py-1.5 focus:ring-0"
              autoFocus
            />
            {cleanUsernameValue.length >= 3 && <Check className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-primary font-bold tracking-tight">
              zap.ci/@{cleanUsernameValue || 'votre_pseudo'}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              Les pseudos uniques ne peuvent contenir que des lettres minuscules, des chiffres, des tirets du bas (_) et des traits d'union (-). La modification de votre pseudo changera également le lien vers votre portfolio créatif public ZAP.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // --- RENDU 3 : INTERFACE COMPLÈTE DE CONFIGURATION DE LA BIO (#bio) ---
  if (currentHash === '#bio') {
    const BIO_LIMIT = 80;
    return (
      <div className="min-h-screen bg-white text-neutral-900 animate-fade-up">
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.location.hash = ''} className="text-sm font-bold text-neutral-600">
            Annuler
          </button>
          <h1 className="text-sm font-black text-neutral-950">Biographie</h1>
          <button 
            onClick={() => saveSingleField('bio', bio.trim())}
            disabled={savingField}
            className="text-sm font-black text-primary disabled:opacity-40"
          >
            {savingField ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </button>
        </header>
        <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
          <div className="border-b border-neutral-200 pb-2">
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value.substring(0, BIO_LIMIT))}
              placeholder="Décrivez votre univers créatif en quelques mots..."
              rows={3}
              className="w-full bg-transparent border-none outline-none text-base font-medium resize-none focus:ring-0"
              autoFocus
              maxLength={BIO_LIMIT}
            />
            <div className="flex justify-end text-[11px] font-bold text-neutral-400">
              {bio.length}/{BIO_LIMIT}
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-normal font-medium">
            Présentez succinctement vos passions (VFX, montage, réalisation, comédie, danse...) pour inspirer les autres élèves de la communauté ZAP.
          </p>
        </main>
      </div>
    );
  }

  // --- RENDU MULTI-CARTES PRINCIPAL (STYLE TIKTOK ORIGINEL) ---
  return (
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)]">
      <header className="sticky top-0 z-50 bg-[#F9F9FC] border-b border-neutral-100 px-4 h-14 flex items-center justify-center relative">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 p-2 rounded-xl text-neutral-600 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">modifier le profil</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* Section Avatar & Photo */}
        <div className="flex flex-col items-center justify-center pt-6 space-y-4">
          <div 
            className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer active:opacity-80 transition-all shadow-inner relative overflow-hidden group"
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 transition-opacity">
              <Camera className="w-8 h-8 text-white/90" />
            </div>
            <img 
              src={`https://picsum.photos/seed/${username || 'avatar'}/200/200`} 
              alt="Avatar" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <button 
            onClick={() => toast({ title: "Prochainement", description: "Le téléchargement de photo sera bientôt disponible." })}
            className="text-[13px] font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Changer ma photo
          </button>
        </div>

        {/* Bloc Identification à listes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden divide-y divide-neutral-100">
            <div 
              onClick={() => window.location.hash = 'nom'}
              className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between"
            >
              <span className="text-[13px] font-bold text-neutral-500">Nom</span>
              <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                <span className="text-[13px] font-bold text-neutral-900 truncate max-w-[200px]">
                  {name || 'Ajouter un nom'}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
              </div>
            </div>

            <div 
              onClick={() => window.location.hash = 'username'}
              className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between"
            >
              <span className="text-[13px] font-bold text-neutral-500">Pseudo</span>
              <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                <span className="text-[13px] font-mono font-bold text-neutral-900 truncate max-w-[200px]">
                  {username || 'Pseudo unique'}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
              </div>
            </div>

            <div className="flex items-center px-4 py-4 justify-between">
              <span className="text-[13px] font-bold text-neutral-500">Lien du pass</span>
              <div className="flex items-center space-x-1.5 justify-end flex-1 min-w-0">
                <span className="text-[12px] font-mono font-medium text-neutral-400 truncate max-w-[220px]">
                  zap.ci/@{username || '...'}
                </span>
                <button 
                  onClick={() => copyToClipboard(`zap.ci/@${username}`)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 active:scale-90 transition-all shrink-0 ml-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Section Infos de base */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-4 mb-2">À propos de toi</p>
            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden divide-y divide-neutral-100">
              <div 
                onClick={() => window.location.hash = 'bio'}
                className="flex items-center px-4 py-4 group cursor-pointer active:bg-neutral-50 justify-between"
              >
                <span className="text-[13px] font-bold text-neutral-500">Bio</span>
                <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                  <span className="text-[13px] font-bold text-neutral-400 truncate max-w-[220px]">
                    {bio || 'Décrivez votre univers...'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1" />
                </div>
              </div>

              <div className="flex items-center px-4 py-4 justify-between">
                <span className="text-[13px] font-bold text-neutral-500">Commune</span>
                <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                  <span className="text-[13px] font-bold text-neutral-900 truncate">
                    {commune || 'Abidjan'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 ml-1 opacity-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Section Scolarité rattachée */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-4 mb-2">Etablissement scolaire</p>
            <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden divide-y divide-neutral-100">
              <div className="flex items-center px-4 py-4 justify-between bg-neutral-50/50">
                <span className="text-[13px] font-bold text-neutral-500">Établissement</span>
                <span className="text-[12px] font-black text-neutral-400 text-right truncate max-w-[240px] uppercase tracking-tight">
                  {school || 'Non défini'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}