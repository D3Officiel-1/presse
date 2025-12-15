
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        // Security check: Verify that the data in the URL matches the data in Firestore
        if (userData.name !== name || userData.class !== userClass || userData.phone !== phone) {
            throw new Error("Les informations du lien ne correspondent pas. Connexion refusée.");
        }

        // All checks passed, proceed with login
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('deviceId', deviceId);
        }

        // Update the deviceId in Firestore to take over the session
        await updateDoc(userRef, { deviceId });
        
        // Store user data locally to establish the session
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Connexion par Lien Magique</CardTitle>
          <CardDescription>Traitement de votre lien de connexion sécurisé.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">Succès !</p>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Erreur</p>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AutoLoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AutoLoginHandler />
        </Suspense>
    )
}
