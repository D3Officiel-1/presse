'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

export default function SplashScreen(props: { params?: Promise<any>; searchParams?: Promise<any> }) {
  if (props?.params) { React.use(props.params); }
  if (props?.searchParams) { React.use(props.searchParams); }

  const router = useRouter();

  useEffect(() => {
    // Redirection automatique après 2.5 secondes
    const timer = setTimeout(() => {
      const uid = localStorage.getItem('userId');
      if (uid) {
        // Utilisation de replace pour empêcher le retour en arrière vers le splash
        router.replace('/zap');
      } else {
        router.replace('/auth');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDFDFD] overflow-hidden select-none z-[9999]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-primary/20 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-orange-400/20 blur-[150px] rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(30px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(255,39,0,0.15)] border border-white/20">
          <div className="w-16 h-16">
            <Logo className="w-full h-full" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-neutral-900">
          ZAP<span className="text-primary italic">!</span>
        </h1>
        <div className="mt-4 flex justify-center">
          <motion.div 
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-0.5 bg-primary/30 rounded-full w-24 overflow-hidden"
          >
            <div className="h-full bg-primary w-full" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
