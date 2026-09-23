'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Sparkles, Film, Award } from 'lucide-react';

export default function AuthGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#FDFDFD] via-background to-secondary/20 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [-50, 50, -50],
            y: [-20, 40, -20],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] left-[10%] w-[70vw] h-[70vw] bg-primary/10 blur-[130px] rounded-full opacity-70"
        />
        <motion.div
          animate={{
            x: [40, -40, 40],
            y: [30, -30, 30],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-accent/10 blur-[140px] rounded-full opacity-50"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.6)_100%)]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 px-2 sm:px-4">
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 text-left hidden md:block"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/40 shadow-sm text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Plateforme Scolaire 2027
          </div>
          
          <h2 className="text-5xl font-[1000] tracking-tighter leading-none text-neutral-950">
            Libérez votre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">
              Créativité.
            </span>
          </h2>
          
          <p className="text-muted-foreground font-medium text-base leading-relaxed max-w-md">
            Rejoignez la communauté sélective des talents scolaires de demain. Partagez, découvrez et brillez en vidéo courte.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-[24px] bg-white/60 dark:bg-black/20 border border-white/40 shadow-sm backdrop-blur-md space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Film className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm">Studio Mobile</h4>
              <p className="text-xs text-muted-foreground leading-normal">Publiez vos mini-métrages et créations en un instant.</p>
            </div>
            
            <div className="p-4 rounded-[24px] bg-white/60 dark:bg-black/20 border border-white/40 shadow-sm backdrop-blur-md space-y-2">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm">Talents Certifiés</h4>
              <p className="text-xs text-muted-foreground leading-normal">Gagnez des badges d&apos;excellence et valorisez votre parcours.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col items-center text-center md:hidden mb-10 pt-2 relative">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 p-3 bg-gradient-to-tr from-white to-neutral-50/80 shadow-[0_20px_50px_rgba(124,58,237,0.15)] rounded-[2.5rem] border border-white mb-4 flex items-center justify-center relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              <Logo />
            </motion.div>
            <h1 className="text-5xl font-[1000] tracking-tight text-neutral-950 leading-none filter drop-shadow-sm">
              ZAP<span className="text-primary">.</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary/80 mt-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              Réseau Créatif Scolaire
            </p>
          </div>

          <Card className="border-white/50 shadow-2xl backdrop-blur-xl bg-white/70 dark:bg-card/90 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4 pt-8 text-center md:text-left relative">
              <div className="absolute top-6 right-6 hidden md:block w-12 h-12 p-1 bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-border/30">
                <Logo />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-neutral-900 md:pr-12">
                Bienvenue dans ZAP
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4 pb-8">
              <Link href="/auth/login" className="block w-full">
                <Button size="lg" className="w-full group rounded-2xl h-14 relative overflow-hidden">
                  <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                  Se connecter à mon espace
                </Button>
              </Link>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/40">ou</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              <Link href="/auth/register" className="block w-full">
                <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 bg-white/50 border-border/80 hover:bg-white/80 text-foreground transition-all">
                  <UserPlus className="w-4 h-4 mr-2 text-primary" />
                  Créer un accès membre
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="absolute bottom-6 flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest select-none">
        <span>ZAP 2027</span>
      </div>
    </div>
  );
}