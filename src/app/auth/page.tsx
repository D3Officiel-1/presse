'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Film, Award, Flame } from 'lucide-react';

const MOCK_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80"
];

export default function AuthGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#F9F9FC] text-neutral-900 overflow-hidden relative pt-12 pb-12">
      
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

      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.92, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 px-2 sm:px-6"
      >
        
        <div className="md:col-span-6 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 border border-neutral-900/10 backdrop-blur-md text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Flame className="w-3.5 h-3.5 fill-primary animate-pulse" />
            ZAP Creator Studio
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-[1000] tracking-tighter leading-none text-neutral-950">
            Crée. <br />
            Partage. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-accent italic">
              Brille.
            </span>
          </h2>
          
          <p className="text-neutral-600 font-medium text-base leading-relaxed max-w-md">
            Le premier réseau vidéo taillé exclusivement pour les talents et créateurs scolaires. Partage tes projets, gagne des défis et forge ton pass digital.
          </p>

          <div className="flex items-center gap-3 py-2">
            <div className="flex -space-x-2.5">
              {MOCK_AVATARS.map((url, index) => (
                <img 
                  key={index}
                  src={url} 
                  alt="Créateur" 
                  className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-neutral-800 tracking-tight">
              +25 000 créateurs scolaires connectés
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 w-full max-w-md">
            <div className="p-4 rounded-[2rem] bg-white/[0.08] backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.06)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent space-y-2 text-left">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Film className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs tracking-tight text-neutral-950">Mini-Métrages</h4>
              <p className="text-[11px] text-neutral-500 leading-tight">Publie tes pitchs et vlogs en 60 secondes.</p>
            </div>
            
            <div className="p-4 rounded-[2rem] bg-white/[0.08] backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.06)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent space-y-2 text-left">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs tracking-tight text-neutral-950">Badges Certifiés</h4>
              <p className="text-[11px] text-neutral-500 leading-tight">Rejoins ton lycée et décroche le pass d'or.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 w-full max-w-sm mx-auto flex flex-col items-center mt-6 md:mt-0">
          <div className="flex flex-col items-center text-center mb-4 relative pt-2 w-full">
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
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary mt-2 bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20 backdrop-blur-sm z-10">
              Réseau Créatif Scolaire
            </p>
          </div>

          <div className="w-full bg-gradient-to-br from-primary via-violet-600 to-purple-800 rounded-t-[3rem] rounded-b-[2rem] shadow-[0_40px_80px_rgba(124,58,237,0.45)] border border-white/10 overflow-hidden relative p-6 sm:p-8 space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-white/20" />
            
            <Link href="/auth/login" className="block w-full">
              <Button size="lg" className="w-full bg-white text-primary hover:bg-neutral-50 rounded-2xl h-14 font-bold tracking-tight shadow-md transition-transform active:scale-[0.99]">
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter à mon espace
              </Button>
            </Link>

            <div className="relative flex py-1 items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">ou rejoins l'aventure</span>
            </div>

            <Link href="/auth/register" className="block w-full">
              <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 bg-transparent text-white border-white/30 hover:bg-white/10 transition-all font-bold">
                <UserPlus className="w-4 h-4 mr-2" />
                Créer un accès membre
              </Button>
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
