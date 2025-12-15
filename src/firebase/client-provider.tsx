
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { app, firestore, auth } from '@/firebase/config';
import { FirebaseProvider } from '@/firebase/provider';

function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const fs = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    if (user && fs) {
        const userStatusRef = doc(fs, 'users', user.uid);

        const updateStatus = (isOnline: boolean) => {
             updateDoc(userStatusRef, {
                online: isOnline,
                lastSeen: serverTimestamp()
            }).catch(console.error);
        }

        // User is online
        updateStatus(true);
        
        // Real-time listener for deviceId check and document existence
        const unsubscribe = onSnapshot(userStatusRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                const storedDeviceId = localStorage.getItem('deviceId');
                
                if (userData.deviceId && storedDeviceId && userData.deviceId !== storedDeviceId) {
                    // Mismatch found, another device has logged in.
                    console.log("Device ID mismatch. Logging out.");
                    
                    // Clear local session
                    localStorage.removeItem('userId');
                    localStorage.removeItem('user');
                    localStorage.removeItem('deviceId');

                    // Show toast and redirect
                    toast({
                        variant: 'destructive',
                        title: 'Session expirée',
                        description: 'Vous avez été déconnecté car ce compte est utilisé sur un autre appareil.',
                    });
                    
                    // Use router.replace to avoid adding to history
                    router.replace('/login');
                }
            }
        });

        // Handle window close/refresh
        const handleBeforeUnload = () => {
            if(user) {
              updateStatus(false);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Handle browser online/offline events
        const handleOnline = () => updateStatus(true);
        const handleOffline = () => updateStatus(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            // Clean up listeners
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            // Attempt to set user offline on component unmount
            if(user) { // Make sure user object is still available
                updateStatus(false);
            }
        };
    }

  }, [user, loading, router, fs, toast]);


  return <>{children}</>;
}


export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // The FirebaseApp, Firestore and Auth instances are initialized once
  // and passed to the provider.
  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </FirebaseProvider>
  );
}
