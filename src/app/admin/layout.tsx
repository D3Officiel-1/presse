
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminStatus = async () => {
      if (!firestore) {
          setIsAuthorized(false);
          setIsChecking(false);
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Service de base de données non disponible.",
          });
          router.push('/chat');
          return;
      }
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().admin === true) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast({
            variant: 'destructive',
            title: 'Accès non autorisé',
            description: "Vous n'avez pas les droits pour accéder à cette page.",
          });
          router.push('/chat');
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'administrateur:", error);
        setIsAuthorized(false);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Impossible de vérifier vos droits d'accès.",
        });
        router.push('/chat');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, userLoading, router, toast, firestore]);

  if (isChecking || !isAuthorized) {
    // Render nothing while checking or if not authorized.
    // The useEffect hook handles redirection.
    return null;
  }

  return <div className="h-screen w-full flex flex-col">{children}</div>;
}
