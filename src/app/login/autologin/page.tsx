
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const StatusIcon = ({ status }: { status: 'loading' | 'success' | 'error' }) => {
  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 260, damping: 20 } 
    },
  };

  return (
    <motion.div variants={iconVariants} initial="hidden" animate="visible" className="flex items-center justify-center">
      {status === 'loading' && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
      {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
      {status === 'error' && <AlertTriangle className="h-16 w-16 text-destructive" />}
    </motion.div>
  );
};


function AutoLoginHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion automatique en cours...');

  useEffect(() => {
    const handleAutoLogin = async () => {
      const userId = searchParams.get('userId');
      const name = searchParams.get('name');
      const userClass = searchParams.get('class');
      const phone = searchParams.get('phone');

      if (!userId || !name || !userClass || !phone || !firestore) {
        setStatus('error');
        setMessage('Lien de connexion invalide ou incomplet. Redirection...');
        setTimeout(() => router.replace('/login'), 3000);
        return;
      }

      try {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error("L'utilisateur n'existe pas.");
        }

        const userData = userDoc.data();
        if (userData.name !== name || userData.class !== userClass || userData.phone !== phone) {
            throw new Error("Les informations du lien ne correspondent pas. Connexion refusée.");
        }

        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('deviceId', deviceId);
        }

        await updateDoc(userRef, { deviceId });
        
        localStorage.setItem('userId', userDoc.id);
        localStorage.setItem('user', JSON.stringify({ uid: userDoc.id, ...userData}));

        setStatus('success');
        setMessage('Connexion réussie ! Vous allez être redirigé...');
        
        toast({ title: "Connexion réussie!", description: `Bienvenue, ${userData.name}.` });
        
        setTimeout(() => router.replace('/chat'), 1500);

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue. Le lien est peut-être expiré ou invalide.');
        toast({
            variant: "destructive",
            title: "Échec de la connexion auto",
            description: error.message || 'Une erreur est survenue.',
        });
        setTimeout(() => router.replace('/login'), 3000);
      }
    };

    handleAutoLogin();
  }, [searchParams, firestore, router, toast]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-background text-foreground p-4">
        <video
          src="https://cdn.pixabay.com/video/2024/05/20/212953-944519999_large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10 opacity-20"
        />
        <div className="absolute inset-0 bg-background/70 -z-10" />

      <motion.div
         initial={{ opacity: 0, y: 20, scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm text-center bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Connexion Magique</CardTitle>
                <CardDescription className='text-muted-foreground/80'>Veuillez patienter, nous vérifions votre identité.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={status}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center gap-4"
                    >
                        <StatusIcon status={status} />
                         <p className="text-lg font-semibold">
                            {status === 'loading' && "Vérification..."}
                            {status === 'success' && "Succès !"}
                            {status === 'error' && "Erreur de Connexion"}
                        </p>
                        <p className="text-muted-foreground min-h-[40px]">{message}</p>
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AutoLoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <AutoLoginHandler />
        </Suspense>
    );
}
