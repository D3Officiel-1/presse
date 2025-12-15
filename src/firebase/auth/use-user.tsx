
'use client';

import { useEffect, useState } from 'react';
import type { User as FirestoreUser } from '@/lib/types';

interface AuthUser extends Partial<FirestoreUser> {
  uid: string;
}

export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client.
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('deviceId');
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
