'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Film, Award, Flame, Users } from 'lucide-react';

const MOCK_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80"
];

export default function AuthGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 bg-gradient-to-b from-[#FAF9FD] via-[#FFFFFF] to-[#F3EFFB] text-neutral-900 overflow-hidden relative pt-12 md:justify-center md:pt-4">
      
      {/* Immersive Cosmic & Aurora Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [-40, 40, -40],
            y: [-20, 40, -20],
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] bg-primary/8 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [30, -30, 30],
            y: [30, -30, 30],
            scale: [1.1, 0.9, 1.1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-accent/8 blur-[120px] rounded-full"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 px-2 sm:px-6">
        
        {/* Column Left: Visual Storytelling Teaser */}
        <motion.div
          initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 space-y-6 text-left hidden md:block"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 border border-neutral-900/10 backdrop-blur-md text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Flame className="w-3.5 h-3.5 fill-primary animate-pulse" />
            ZAP Creator Studio 2027
          </div>
          
          <h2 className="text-6xl font-[1000] tracking-tighter leading-none text-neutral-950">
            Propulse ton <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-accent italic">
              Génie Vidéo.
            </span>
          </h2>
          
          <p className="text-neutral-600 font-medium text-base leading-relaxed max-w-md">
            Le premier réseau vidéo taillé exclusivement pour les talents et créateurs scolaires. Partage tes projets, gagne des défis nationaux et forge ton pass digital.
          </p>

          {/* Social Proof Counter Component */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2.5">
              {MOCK_AVATARS.map((url, idx) => (
                <img 
                  key={idx} 
                  src={url} 
                  alt="Créateur scolaire" 
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
                />
              ))}
            </div>
            <span className="text-sm font-black tracking-tight text-neutral-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" /> +25 000 créateurs scolaires connectés
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-[2rem] bg-white/[0.08] backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.1)] space-y-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm tracking-tight text-neutral-950">Mini-Métrages</h4>
              <p className="text-xs text-neutral-500 leading-normal">Publie tes pitchs, vlogs éducatifs ou talents artistiques en 60 secondes.</p>
            </div>
            
            <div className="p-5 rounded-[2rem] bg-white/[0.08] backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.1)] space-y-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              <div className="w-9 h-9 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm tracking-tight text-neutral-950">Badges Certifiés</h4>
              <p className="text-xs text-neutral-500 leading-normal">Rejoins ton lycée ou club créatif et décroche le précieux pass Éclair d'Or.</p>
            </div>
          </div>
        </motion.div>

        {/* Column Right: Ultra Stylish Mobile/Desktop Card Layer */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.92, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 w-full max-w-md mx-auto flex flex-col items-center"
        >
          {/* Mobile Header Hero - Perfectly Centered at the top */}
          <div className="flex flex-col items-center text-center mb-6 relative pt-2 w-full">
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full"
            />
            
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 p-3 bg-gradient-to-tr from-white via-neutral-50 to-white shadow-[0_15px_35px_rgba(124,58,237,0.12)] rounded-[2.2rem] border border-neutral-200 mb-3 flex items-center justify-center relative overflow-hidden backdrop-blur-xl z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
              <Logo className="w-full h-full" />
            </motion.div>
            
            <h1 className="text-4xl font-[1000] tracking-tight text-neutral-950 leading-none">
              ZAP<span className="text-primary italic font-serif">!</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary mt-2 bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20 backdrop-blur-sm">
              Réseau Créatif Scolaire
            </p>

            {/* Immersive Mobile-Only Hero Message */}
            <div className="mt-5 block md:hidden">
              <h2 className="text-4xl font-[1000] tracking-tight text-neutral-950 leading-tight">
                Crée. <br />
                Partage. <br />
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-600 bg-[size:200%_auto] font-black"
                >
                  Brille.
                </motion.span>
              </h2>
            </div>
          </div>

          {/* 3D-Like Violet Layer with Rounded Top and Deep Shadows */}
          <div className="w-full bg-gradient-to-br from-primary via-violet-600 to-purple-800 rounded-t-[3rem] shadow-[0_40px_80px_rgba(124,58,237,0.45)] overflow-hidden relative p-8 mt-4 space-y-4 border border-white/10">
            <div className="absolute top-0 inset-x-0 h-px bg-white/20" />
            
            <Link href="/auth/login" className="block w-full">
              <Button size="lg" className="w-full bg-white text-primary hover:bg-neutral-50 rounded-2xl h-14 font-bold tracking-tight shadow-lg transition-transform active:scale-[0.99]">
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            </Link>

            <div className="relative flex py-1 items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">ou rejoins le studio</span>
            </div>

            <Link href="/auth/register" className="block w-full">
              <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 bg-transparent text-white border-white/30 hover:bg-white/10 transition-all font-bold">
                <UserPlus className="w-4 h-4 mr-2" />
                Créer un compte membre
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
