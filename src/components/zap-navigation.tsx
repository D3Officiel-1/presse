'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ZapNavigation() {
  const pathname = usePathname();

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
        "fixed bottom-0 left-0 right-0 w-full z-50 transition-all duration-300 border-t",
        isFeedMode 
          ? "bg-black text-white border-white/10" 
          : "bg-white text-black border-neutral-100"
      )}
    >
      <div className="flex items-start justify-between h-[calc(env(safe-area-inset-bottom,0px)+56px)] px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <div key={item.id} className="flex-1 flex justify-center pt-2">
                <Link 
                  href={item.href}
                  className="relative w-11 h-7.5 group active:scale-90 transition-transform"
                >
                  {/* Effet TikTok Plus Button (Bords colorés) */}
                  <div className="absolute inset-0 bg-[#00f2ea] rounded-lg -left-[2px]" />
                  <div className="absolute inset-0 bg-[#ff0050] rounded-lg -right-[2px]" />
                  <div className={cn(
                    "absolute inset-0 rounded-lg flex items-center justify-center transition-colors",
                    isFeedMode ? "bg-white text-black" : "bg-black text-white"
                  )}>
                    <Plus className="w-5 h-5 stroke-[4]" />
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
              className="flex flex-col items-center justify-center flex-1 pt-2 pb-1 group relative transition-all active:scale-95"
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-200", 
                  isActive ? "stroke-[2.5]" : "stroke-[2]",
                  !isActive && (isFeedMode ? "opacity-70" : "opacity-40")
                )} 
              />
              <span className={cn(
                "text-[9px] mt-0.5 font-bold transition-all duration-200",
                isActive ? "opacity-100" : (isFeedMode ? "opacity-70" : "opacity-40")
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
