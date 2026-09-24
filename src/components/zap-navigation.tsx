'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function ZapNavigation() {
  const pathname = usePathname();
  const [uiVisible, setUiVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = (e: any) => {
      setUiVisible(e.detail.visible);
    };

    window.addEventListener('zap-ui-visibility', handleVisibility);
    return () => window.removeEventListener('zap-ui-visibility', handleVisibility);
  }, []);

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
    <AnimatePresence>
      {uiVisible && (
        <motion.nav 
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            "fixed bottom-6 left-1/2 w-[92%] max-w-[400px] h-16 rounded-[2.5rem] flex items-center justify-between px-2 z-50 transition-all duration-500",
            isFeedMode 
              ? "bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]" 
              : "bg-white/70 backdrop-blur-2xl border border-neutral-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          )}
        >
          {navItems.map((item) => {
            if (item.isCenter) {
              return (
                <Link 
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "w-12 h-12 bg-primary rounded-[1.2rem] text-white shadow-[0_4px_20px_rgba(255,39,0,0.4)] flex items-center justify-center active:scale-90 transition-all duration-300 hover:scale-105 shrink-0 relative overflow-hidden group",
                    activeTab === 'studio' && "ring-2 ring-primary/50"
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: activeTab === 'studio' ? 45 : 0 }}
                    className="relative z-10"
                  >
                    <Plus className="w-6 h-6 stroke-[3.5]" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            }

            const Icon = item.icon!;
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1 group relative transition-all active:scale-95"
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 relative",
                  isActive 
                    ? (isFeedMode ? "text-white scale-110" : "text-primary scale-110") 
                    : (isFeedMode ? "text-white/40 group-hover:text-white/70" : "text-neutral-400 group-hover:text-neutral-600")
                )}>
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300", 
                      isActive ? "stroke-[3]" : "stroke-[2]"
                    )} 
                  />
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className={cn(
                        "absolute inset-0 rounded-2xl -z-10 blur-md opacity-20",
                        isFeedMode ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
