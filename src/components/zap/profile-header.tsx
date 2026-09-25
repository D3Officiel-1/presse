'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Eye, UserPlus, Menu, Check, Bookmark, EyeOff, UserX, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ProfileHeaderProps {
  name: string;
  onEditClick: () => void;
  onViewProfileClick: () => void;
}

export function ProfileHeader({ name, onEditClick, onViewProfileClick }: ProfileHeaderProps) {
  const [showNavTitle, setShowNavTitle] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      // Déclenchement de l'affichage du nom plus tôt pour une sensation plus fluide
      if (window.scrollY > 70) {
        setShowNavTitle(true);
      } else {
        setShowNavTitle(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: !isFavorited ? 'Ajouté aux favoris' : 'Retiré des favoris',
      description: !isFavorited ? 'Ce créateur apparaîtra en haut de vos listes.' : 'Ce créateur a été retiré de vos favoris.'
    });
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 max-w-4xl mx-auto w-full bg-white border-none shadow-none">
      <div className="flex items-center">
        <Button
          onClick={onEditClick}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-neutral-600 active:scale-95 p-0 hover:bg-neutral-50 transition-all"
          title="Modifier le profil"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Titre central animé apparaissant au scroll */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full pointer-events-none">
        <AnimatePresence>
          {showNavTitle && (
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-black text-sm tracking-tight text-neutral-950 flex items-center gap-1 pointer-events-auto whitespace-nowrap"
            >
              {name || 'Mon Profil'}
              <span className="w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[4]" />
              </span>
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Actions de droite */}
      <div className="flex items-center gap-1.5">
        <button 
          onClick={onViewProfileClick} 
          className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition active:scale-90"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button 
          onClick={() => router.push('/zap/friends')} 
          className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition active:scale-90"
        >
          <UserPlus className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 text-neutral-800 hover:bg-neutral-50 rounded-full transition relative active:scale-90"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-4 top-12 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 min-w-[200px]"
              >
                <button onClick={toggleFavorite} className="w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-neutral-50 rounded-xl flex items-center gap-2">
                  <Bookmark className={cn("w-3.5 h-3.5", isFavorited ? "fill-yellow-400 text-yellow-400" : "text-neutral-500")} />
                  {isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
                <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-neutral-50 rounded-xl flex items-center gap-2 text-neutral-700">
                  <EyeOff className="w-3.5 h-3.5 text-neutral-500" /> Masquer le contenu
                </button>
                <div className="h-px bg-neutral-100 my-1" />
                <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-rose-50 rounded-xl flex items-center gap-2 text-rose-600">
                  <UserX className="w-3.5 h-3.5 text-rose-500" /> Bloquer l'utilisateur
                </button>
                <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-rose-50 rounded-xl flex items-center gap-2 text-rose-600">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Signaler le profil
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
