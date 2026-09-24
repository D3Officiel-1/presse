'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZapNavigation } from '@/components/zap-navigation';

export default function ZapLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.replace('/auth');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen relative">
      {children}
      <ZapNavigation />
    </div>
  );
}
