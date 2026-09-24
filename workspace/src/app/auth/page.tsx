'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LogIn, UserPlus, Film, Award, Flame } from 'lucide-react';

export default function AuthGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 bg-gradient-to-b from-[#F9F9FC] via-[#FFFFFF] to-[#EFEFF5] text-neutral-900 overflow-hidden relative pt-12 md:justify-center md:pt-4">
      
      {/* Immersive Cosmic & Artistic Background Glows (Light Mode Version) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [-60, 60, -60],
            y: [-30, 50, -30],
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] left-[5%] w-[80vw] h-[80vw] bg-primary/10 blur-[130px] rounded-full"
        />
        <motion.div
          animate={{
            x: [50, -50, 50],
            y: [40, -40, 40],
            scale: [1.2, 0.95, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] right-[5%] w-[70vw] h-[70vw] bg-accent/10 blur-[140px] rounded-full"
        />
        {/* Fine grid network pattern for high tech identity */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 px-2 sm:px-6">
        
        {/* Column Left: Visual Storytelling Teaser */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-[2rem] bg-white/60 border border-neutral-200 shadow-xl backdrop-blur-xl space-y-3 hover:border-primary/20 transition-colors group">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm tracking-tight text-neutral-950">Mini-Métrages</h4>
              <p className="text-xs text-neutral-500 leading-normal">Publie tes pitchs, vlogs éducatifs ou talents artistiques en 60 secondes.</p>
            </div>
            
            <div className="p-5 rounded-[2rem] bg-white/60 border border-neutral-200 shadow-xl backdrop-blur-xl space-y-3 hover:border-accent/20 transition-colors group">
              <div className="w-9 h-9 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm tracking-tight text-neutral-950">Badges Certifiés</h4>
              <p className="text-xs text-neutral-500 leading-normal">Rejoins ton lycée ou club créatif et décroche le précieux pass Éclair d'Or.</p>
            </div>
          </div>
        </motion.div>

        {/* Column Right: Ultra Stylish High-Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 w-full max-w-md mx-auto"
        >
          {/* Mobile Header Hero - Centered at the very top */}
          <div className="flex flex-col items-center text-center md:hidden mb-8 relative pt-2 w-full">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 w-32 h-32 bg-primary/5 blur-2xl rounded-full"
            />
            
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 p-3 bg-gradient-to-tr from-white via-neutral-50 to-white shadow-[0_15px_35px_rgba(124,58,237,0.12)] rounded-[2.2rem] border border-neutral-200 mb-3 flex items-center justify-center relative overflow-hidden backdrop-blur-xl"
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
          </div>

          {/* Holographic Action Card in Light Mode */}
          <Card className="border-neutral-200/80 shadow-[0_32px_64px_rgba(0,0,0,0.06)] backdrop-blur-2xl bg-white/70 rounded-[3rem] overflow-hidden relative group">
            {/* Top Glossy Gradient Highlight line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />

            <CardHeader className="pb-2 pt-4 text-center md:text-left relative z-10 px-6 sm:px-8">
              <div className="absolute top-6 right-8 hidden md:flex w-14 h-14 p-1.5 bg-white rounded-2xl shadow-md border border-neutral-200">
                <Logo />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4 pb-8 px-6 sm:px-8 relative z-10">
              
              <Link href="/auth/login" className="block w-full">
                <Button size="lg" className="w-full group rounded-2xl h-14 relative overflow-hidden bg-primary text-white font-bold tracking-tight shadow-[0_10px_25px_rgba(124,58,237,0.2)] transition-all hover:shadow-[0_15px_35px_rgba(124,58,237,0.35)] hover:scale-[1.01]">
                  <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                  Se connecter à mon espace
                </Button>
              </Link>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">ou</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              <Link href="/auth/register" className="block w-full">
                <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 bg-white/50 border-neutral-200 text-neutral-900 font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
                  <UserPlus className="w-4 h-4 mr-2 text-primary" />
                  Créer un accès membre
                </Button>
              </Link>
              
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
