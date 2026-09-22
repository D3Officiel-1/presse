'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Sparkles, Film, Award } from 'lucide-react';

export default function AuthGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-primary/10 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-accent/10 blur-[120px] rounded-full opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-24 h-24 p-3 bg-secondary/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-border/40 mb-4 flex items-center justify-center"
          >
            <Logo />
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground leading-none">
            NOV<span className="text-primary italic">A</span>
          </h2>
        </div>

        <Card className="border-border/60 shadow-2xl backdrop-blur-sm bg-card/90 rounded-[2.5rem]">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black tracking-tight text-center">Rejoignez l'Aventure</CardTitle>
            <CardDescription className="text-center text-sm max-w-xs mx-auto">
              La plateforme vidéo scolaire moderne pour révéler et partager vos talents créatifs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 mb-4 text-left">
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/20 flex flex-col gap-1.5">
                <Film className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold leading-tight">Partage Vidéo</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/20 flex flex-col gap-1.5">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-xs font-bold leading-tight">Talents Scolaires</span>
              </div>
            </div>

            <Link href="/auth/login" className="block w-full">
              <Button size="lg" className="w-full group">
                <LogIn className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                Se connecter
              </Button>
            </Link>

            <Link href="/auth/register" className="block w-full">
              <Button size="lg" variant="outline" className="w-full hover:bg-secondary/40">
                <UserPlus className="w-4 h-4 mr-2" />
                Créer un compte
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>NOVA Executive Club 2027</span>
        </div>
      </motion.div>
    </div>
  );
}