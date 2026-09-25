'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function ProfileViewsPage() {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(true);

  const [visitors] = useState([
    { id: 'v-1', name: 'Yannick Koffi', username: 'yannick_vfx', avatarSeed: 'yannick', hasReturn: true },
    { id: 'v-2', name: 'Aminata Diop', username: 'amina_diop', avatarSeed: 'amina', hasReturn: false },
    { id: 'v-3', name: 'Marc-Aurèle Yao', username: 'marc_dance', avatarSeed: 'marc', hasReturn: false },
    { id: 'v-4', name: 'Fatim Cissé', username: 'fatim_creative', avatarSeed: 'fatim', hasReturn: false },
    { id: 'v-5', name: 'Gilles Touré', username: 'gilles_art', avatarSeed: 'gilles', hasReturn: false },
  ]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 w-full pb-20 relative overflow-x-hidden">
      {/* Header style TikTok */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between w-full">
        <button 
          onClick={() => router.back()} 
          className="p-1 text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-neutral-900">Vues du profil</h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-1 text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors active:scale-90"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-md mx-auto py-2">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="divide-y divide-neutral-50"
        >
          {isHistoryEnabled ? (
            visitors.map((visitor) => (
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
                
                <Button 
                  className="h-8 px-4 rounded-md bg-[#fe2c55] hover:bg-[#e6284d] text-white text-[12px] font-bold border-none shadow-none active:scale-95 transition-all whitespace-nowrap"
                >
                  {visitor.hasReturn ? 'Suivre...retour' : 'Suivre'}
                </Button>
              </div>
            ))
          ) : (
            <div className="px-6 py-20 text-center text-neutral-400">
              <p className="text-sm font-medium">L'historique des vues est désactivé.</p>
            </div>
          )}

          {/* Texte informatif bas de page */}
          <div className="px-10 py-12 text-center">
            <p className="text-[13px] leading-relaxed text-neutral-400 font-medium">
              Les personnes qui ont consulté votre profil au cours des 30 derniers jours apparaîtront ici. Vous seul pouvez voir cela.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Bottom Sheet Modal des paramètres */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[1px]"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[20px] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] z-50 overflow-hidden text-left"
            >
              {/* Header du tiroir */}
              <div className="relative px-4 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="w-6" /> {/* Spacer */}
                <h3 className="text-base font-bold text-neutral-900 text-center">Vues du profil</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu de configuration */}
              <div className="p-5 space-y-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] max-w-md mx-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[15px] font-bold text-neutral-900">
                    Historique des vues du profil
                  </span>
                  <Switch 
                    checked={isHistoryEnabled}
                    onCheckedChange={setIsHistoryEnabled}
                  />
                </div>

                <p className="text-xs leading-relaxed text-neutral-500 font-medium">
                  Découvre qui a vu ton profil au cours des 30 derniers jours et permets aux autres de voir que tu as vu le leur. Nous t'informerons des vues de ton profil si la notification est activée. Toi seul(e) peux voir qui a vu ton profil. Tu peux désactiver cette option à tout moment.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
