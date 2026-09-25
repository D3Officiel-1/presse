
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ProfileViewsPage() {
  const router = useRouter();
  const [visitors] = useState([
    { id: 'v-1', name: 'Yannick Koffi', username: 'yannick_vfx', avatarSeed: 'yannick' },
    { id: 'v-2', name: 'Aminata Diop', username: 'amina_diop', avatarSeed: 'amina' },
    { id: 'v-3', name: 'Marc-Aurèle Yao', username: 'marc_dance', avatarSeed: 'marc' },
    { id: 'v-4', name: 'Fatim Cissé', username: 'fatim_creative', avatarSeed: 'fatim' },
    { id: 'v-5', name: 'Gilles Touré', username: 'gilles_art', avatarSeed: 'gilles' },
  ]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 w-full pb-20">
      {/* Header style TikTok */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between w-full">
        <button 
          onClick={() => router.back()} 
          className="p-1 text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-neutral-900">Profile views</h1>
        <button className="p-1 text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors active:scale-90">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-md mx-auto py-2">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="divide-y divide-neutral-50"
        >
          {visitors.map((visitor) => (
            <div 
              key={visitor.id}
              className="px-4 py-3 flex items-center justify-between transition-colors hover:bg-neutral-50/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-100 bg-neutral-100 shrink-0">
                  <img 
                    src={`https://picsum.photos/seed/${visitor.avatarSeed}/120/120`} 
                    alt={visitor.username} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="font-bold text-sm text-neutral-900 truncate">
                    {visitor.username}
                  </h4>
                </div>
              </div>
              
              {/* Bouton Follow rouge ZAP/TikTok */}
              <Button 
                className="h-8 px-6 rounded-md bg-[#fe2c55] hover:bg-[#e6284d] text-white text-[13px] font-bold border-none shadow-none active:scale-95 transition-all"
              >
                Follow
              </Button>
            </div>
          ))}

          {/* Texte informatif bas de page */}
          <div className="px-10 py-12 text-center">
            <p className="text-[13px] leading-relaxed text-neutral-400 font-medium">
              People who viewed your profile in the past 30 days will appear here. Only you can see this.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
