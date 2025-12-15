
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
      
      setTimeout(() => {
        if (!user) {
          router.replace('/home');
        } else {
          router.replace('/chat');
        }
      }, 500); // Wait for fade-out animation to complete

    }, 2500); // Total splash screen time

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div className={cn(
      "flex h-screen w-screen items-center justify-center bg-background transition-opacity duration-500",
      isAnimatingOut ? "opacity-0" : "opacity-100"
    )}>
       <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="absolute h-full w-full rounded-full bg-primary/10 animate-ripple-1"></div>
            <div className="absolute h-full w-full rounded-full bg-primary/10 animate-ripple-2"></div>
            <Image
                src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
                alt="Club de Presse Logo"
                width={80}
                height={80}
                className="relative z-10 animate-pulse-subtle"
                priority
            />
        </div>
    </div>
  );
}
