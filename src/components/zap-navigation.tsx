'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ZapNavigation() {
  const pathname = usePathname();

  // Ne pas afficher la barre de navigation sur le tunnel d'édition du profil ou les vues de profil
  if (pathname.startsWith('/zap/profile/edit') || pathname === '/zap/profile/vue') {
    return null;
  }

  const getActiveTab = () => {
    if (pathname === '/zap') return 'feed';
    if (pathname.startsWith('/zap/friends')) return 'friends';
    if (pathname.startsWith('/zap/studio')) return 'studio';
    if (pathname.startsWith('/zap/chat')) return 'chat';
    if (pathname.startsWith('/zap/profile')) return 'profile';
    return 'feed';
  };

  const activeTab = getActiveTab();
  const isFeedMode = activeTab === 'feed';

  const navItems = [
    { id: 'feed', href: '/zap', icon: Home, label: 'Accueil' },
    { id: 'friends', href: '/zap/friends', icon: Users, label: 'Amis' },
    { id: 'studio', href: '/zap/studio', isCenter: true },
    { id: 'chat', href: '/zap/chat', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', href: '/zap/profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 w-full z-50 border-t transition-all duration-300",
        isFeedMode 
          ? "bg-black text-white border-white/10" 
          : "bg-white text-black border-neutral-100"
      )}
    >
      <div className="flex items-center justify-between h-[calc(env(safe-area-inset-bottom,0px)+56px)] px-2 max-w-lg mx-auto pb-[env(safe-area-inset-bottom,0px)]">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <div key={item.id} className="flex-1 flex items-center justify-center h-full">
                <Link 
                  href="/zap/studio"
                  className="relative w-11 h-7 block active:scale-95 transition-transform"
                >
                  <div className="absolute inset-y-0 w-8 bg-[#00f2ea] rounded-md left-0" />
                  <div className="absolute inset-y-0 w-8 bg-[#ff0050] rounded-md right-0" />
                  <div className={cn(
                    "absolute inset-x-1.5 inset-y-0 rounded-md flex items-center justify-center transition-colors",
                    isFeedMode ? "bg-white text-black" : "bg-black text-white"
                  )}>
                    <Plus className="w-4 h-4 stroke-[4]" />
                  </div>
                </Link>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-all active:scale-95"
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200", 
                  isActive ? "stroke-[2.5]" : "stroke-[2]",
                  !isActive && (isFeedMode ? "opacity-70" : "opacity-45")
                )} 
              />
              <span className={cn(
                "text-[9px] mt-0.5 font-bold transition-all duration-200 truncate w-full text-center",
                isActive ? "opacity-100 font-extrabold" : (isFeedMode ? "opacity-70" : "opacity-45")
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
