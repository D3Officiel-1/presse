'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ProfileViewsPage() {
  const router = useRouter();
  const [visitors] = useState([
    { id: 'v-1', name: 'Yannick Koffi', username: 'yannick_vfx', school: 'Lycée Scientifique', time: 'Il y a 5 min', avatarSeed: 'yannick', badge: 'VFX' },
    { id: 'v-2', name: 'Aminata Diop', username: 'amina_diop', school: 'Espaces Créatifs CTI', time: 'Il y a 1h', avatarSeed: 'amina', badge: 'Tech' },
    { id: 'v-3', name: 'Marc-Aurèle Yao', username: 'marc_dance', school: 'Académie des Arts', time: 'Il y a 4h', avatarSeed: 'marc', badge: 'Danse' },
    { id: 'v-4', name: 'Fatim Cissé', username: 'fatim_creative', school: 'Lycée Moderne Amagou', time: 'Hier', avatarSeed: 'fatim', badge: 'Design' },
    { id: 'v-5', name: 'Gilles Touré', username: 'gilles_art', school: 'Collège Notre Dame', time: 'Il y a 2 jours', avatarSeed: 'gilles', badge: 'Montage' },
  ]);

  return (
    <div className="min-h-screen bg-[#F9F9FC] text-neutral-900 w-full pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center justify-between w-full">
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900">Vues de profil</h1>
        <div className="w-9" />
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-neutral-950 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" /> Analyser l'audience
            </h2>
            <p className="text-[11px] font-bold text-neutral-400 leading-tight">
              Découvrez qui a consulté votre Pass créateur au cours des 7 derniers jours.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-5">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 fill-primary stroke-none" /> Performances
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">42</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +24% cette semaine
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">
              Votre Pass ZAP gagne en visibilité auprès de votre établissement !
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Visiteurs récents</h3>
              <Badge variant="outline" className="text-[9px] font-mono font-bold">Actifs</Badge>
            </div>

            <div className="space-y-2.5">
              {visitors.map((visitor) => (
                <div 
                  key={visitor.id}
                  onClick={() => router.push(`/zap`)}
                  className="p-3 bg-white border border-neutral-200/70 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:border-neutral-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
                      <img src={`https://picsum.photos/seed/${visitor.avatarSeed}/100/100`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-xs text-neutral-950 truncate">@{visitor.username}</h4>
                        <Badge className="h-4 px-1.5 text-[8px] font-extrabold rounded-md shrink-0">{visitor.badge}</Badge>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-bold truncate">{visitor.school}</p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 flex items-center gap-1">
                    <span className="text-[9px] font-bold text-neutral-400 font-mono">{visitor.time}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
