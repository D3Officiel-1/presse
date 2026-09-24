'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function AuthGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#F9F9FC] text-neutral-900 overflow-hidden relative">
      
      {/* Effets Aurora en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)'
          }}
        />
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* En-tête (Logo et Titre) centré en haut */}
      <motion.div
        initial={{ opacity: 0, y: -40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center pt-24 z-10"
      >
        <div className="flex flex-col items-center text-center relative">
          {/* Halo derrière le logo */}
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 6,
              repeat: Infinity
            }}
            className="absolute w-32 h-32 rounded-full bg-primary/20 blur-3xl"
          />
          
          <div className="w-20 h-20 p-3 bg-gradient-to-tr from-white via-neutral-50 to-white shadow-[0_15px_35px_rgba(124,58,237,0.1)] rounded-[2.2rem] border border-neutral-200 mb-2 flex items-center justify-center relative overflow-hidden backdrop-blur-xl z-10">
            <Logo className="w-full h-full" />
          </div>
          
          <h1 className="text-4xl font-[1000] tracking-tight text-neutral-950 leading-none z-10">
            ZAP<span className="text-primary italic font-serif">!</span>
          </h1>
        </div>
      </motion.div>

      {/* Couche Violette 3D ancrée au bas */}
      <motion.div
        initial={{ opacity: 0, y: 150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-gradient-to-br from-primary via-violet-600 to-purple-800 rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(124,58,237,0.3)] border-t border-white/10 relative z-20 px-6 sm:px-12 pt-10 pb-[calc(env(safe-area-inset-bottom,0px)+3rem)]"
      >
        <div className="max-w-md mx-auto space-y-5">
          <div className="absolute top-0 inset-x-0 h-px bg-white/20" />
          
          <Link href="/auth/login" className="block w-full">
            <Button size="lg" className="w-full bg-white text-primary hover:bg-neutral-50 rounded-2xl h-14 font-bold tracking-tight shadow-md transition-transform active:scale-[0.99]">
              Se connecter
            </Button>
          </Link>

          <div className="relative flex py-1 items-center justify-center">
            <span className="text-xs font-bold text-white/50">ou</span>
          </div>

          <Link href="/auth/register" className="block w-full">
            <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 bg-transparent text-white border-white/30 hover:bg-white/10 transition-all font-bold">
              Créer un compte
            </Button>
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
