
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AppLayout } from '@/components/layout/app-layout';

export default function ChatAppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    // Presence management
    if (firestore && user) {
        const userStatusRef = doc(firestore, 'users', user.uid);

        const updateStatus = (isOnline: boolean) => {
             updateDoc(userStatusRef, {
                online: isOnline,
                lastSeen: serverTimestamp()
            }).catch(console.error);
        }

        // Set user online when layout mounts
        updateStatus(true);
        
        // Handle window close/refresh to set user offline
        const handleBeforeUnload = () => {
             if(user) {
                updateStatus(false);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Set user offline when component unmounts (e.g., navigating away)
            if(user) {
              updateStatus(false);
            }
        };
    }

  }, [user, loading, router, firestore]);

  if (loading || !user) {
    // Render nothing while loading or if there's no user,
    // the useEffect will handle the redirection.
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
