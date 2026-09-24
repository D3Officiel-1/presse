'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ZapNavigation() {
  const pathname = usePathname();

  // Déterminer l'onglet actif basé sur le chemin URL
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
    { id: 'feed', href: '/zap', icon: Home },
    { id: 'friends', href: '/zap/friends', icon: Users },
    { id: 'studio', href: '/zap/studio', isCenter: true },
    { id: 'chat', href: '/zap/chat', icon: MessageCircle },
    { id: 'profile', href: '/zap/profile', icon: User },
  ];

  return (
    <nav className={cn(
      "fixed bottom-5 left-4 right-4 max-w-md mx-auto h-16 rounded-[2rem] flex items-center justify-between px-3 z-50 transition-all duration-300 shadow-[0_12px_35px_rgba(0,0,0,0.15)]",
      isFeedMode 
        ? "bg-black/60 backdrop-blur-xl border border-white/10 text-white" 
        : "bg-white/80 backdrop-blur-xl border border-neutral-200/80 text-neutral-900"
    )}>
      {navItems.map((item) => {
        if (item.isCenter) {
          return (
            <Link 
              key={item.id}
              href={item.href}
              className={cn(
                "w-12 h-12 bg-primary rounded-full text-white shadow-[0_4px_20px_rgba(255,39,0,0.4)] flex items-center justify-center -translate-y-4 active:scale-90 transition-all duration-200 hover:scale-105 shrink-0",
                activeTab === 'studio' && "ring-4 ring-primary/30"
              )}
            >
              <Plus className="w-6 h-6 stroke-[3.5]" />
            </Link>
          );
        }

        const Icon = item.icon!;
        const isActive = activeTab === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 py-1 group relative transition-all active:scale-95 text-center"
          >
            <div className={cn(
              "p-1 rounded-xl transition-all duration-200",
              isActive 
                ? "text-primary scale-110" 
                : (isFeedMode ? "text-white/60 group-hover:text-white" : "text-neutral-400 group-hover:text-neutral-700")
            )}>
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-300", 
                  isActive ? "stroke-[3.5]" : "stroke-[2]"
                )} 
              />
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
