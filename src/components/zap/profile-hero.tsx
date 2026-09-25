'use client';

import React from 'react';
import { Check, Link2, MapPin, User } from 'lucide-react';

interface ProfileHeroProps {
  displayName: string;
  username: string;
  category: string;
  bio: string;
  link: string;
  commune: string;
  company: string;
  isPublic: boolean;
}

export function ProfileHero({
  displayName,
  username,
  category,
  bio,
  link,
  commune,
  company,
  isPublic,
}: ProfileHeroProps) {
  return (
    <div className="flex items-start justify-between gap-6 pt-4 pb-6">
      <div className="flex-1 text-left space-y-4 min-w-0">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-neutral-950 truncate">
            {displayName}
          </h1>
          <h2 className="text-sm font-bold text-neutral-500 flex items-center gap-1.5">
            @{username || 'id_profil'}
            <span className="w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
              <Check className="w-2.5 h-2.5 stroke-[4]" />
            </span>
          </h2>
          <p className="text-xs font-bold text-primary uppercase tracking-widest pt-0.5">
            {category || 'Créateur Digital'}
          </p>
        </div>

        <div className="flex items-center gap-6 lg:gap-10 py-1 text-left">
          <div className="flex flex-col">
            <span className="font-black text-base text-neutral-950 tracking-tight">142</span>
            <span className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider">abonnements</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base text-neutral-950 tracking-tight">3.5 K</span>
            <span className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider">abonnés</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base text-neutral-950 tracking-tight">18.2 K</span>
            <span className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider">j'aime</span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <p className="text-xs md:text-sm text-neutral-700 font-medium leading-relaxed max-w-xl">
            {bio || "Pas encore de description de créateur configurée."}
          </p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] md:text-xs font-bold text-neutral-500">
            <span className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
              <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />
              {link || 'zap.ci/portfolio'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {commune || 'Abidjan'}
            </span>
            <span className="flex items-center gap-1 text-neutral-400">
              🏫 {company || 'Établissement Club'}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end pt-1">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-600 to-orange-500 shadow-xl transition-all duration-300 hover:scale-105">
          <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-neutral-100 flex flex-col items-center justify-center text-neutral-400 shadow-inner">
            <User className="w-12 h-12 md:w-16 md:h-16 text-neutral-300 stroke-[1.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
