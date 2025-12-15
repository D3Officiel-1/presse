'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Users,
  Phone,
  CircleDot,
  Settings,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/firebase/auth/use-user';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';


const navItems = [
  { href: '/chat', icon: MessageSquare, label: 'Discussions' },
  { href: '/chat/groups', icon: Users, label: 'Groupes' },
  { href: '/chat/calls', icon: Phone, label: 'Appels' },
  { href: '/chat/status', icon: CircleDot, label: 'Statuts' },
];

function NavLink({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean; }) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
        <Link href={href} className="relative flex-1 flex items-center justify-center h-14 z-10">
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -4 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Icon className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground/60"
              )} />
            </motion.div>
        </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={href} className='relative flex justify-center'>
            <div className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-all duration-300 ease-in-out",
                isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30" : "hover:bg-muted"
            )}>
              <Icon className="h-6 w-6" />
              {isActive && (
                 <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-primary rounded-full" />
              )}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-foreground text-background">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


function DesktopNav({ user }: { user: any }) {
    const pathname = usePathname();
    const isAdmin = false; // Replace with actual admin check
  
    return (
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <nav className="flex flex-col items-center gap-4 rounded-full bg-background/50 p-3 backdrop-blur-md border shadow-2xl">
          <Link href="/chat">
            <Image
              src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
              alt="Club de Presse Logo"
              width={48}
              height={48}
              className="size-12"
            />
          </Link>
          <div className="w-10 h-px bg-border my-2" />
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} isActive={pathname === item.href} />
          ))}
          <div className="flex-1" />
          <div className="w-10 h-px bg-border my-2" />
          {isAdmin && (
            <NavLink href="/admin" icon={Shield} label="Admin" isActive={pathname.startsWith('/admin')} />
          )}
           <NavLink href="/chat/settings" icon={Settings} label="Paramètres" isActive={pathname.startsWith('/chat/settings')} />
           <Link href={`/chat/settings/${user?.uid}`}>
                <Avatar className="h-12 w-12 cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
                  <AvatarImage src={user?.photoURL || `https://avatar.vercel.sh/${user?.displayName}.png`} alt={user?.displayName || 'User'} />
                  <AvatarFallback>{user?.displayName?.substring(0,1)}</AvatarFallback>
                </Avatar>
             </Link>
        </nav>
      </aside>
    );
  }
  
function MobileNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const activeItem = navRef.current?.querySelector(`a[href='${pathname}']`) as HTMLElement;
    if (activeItem) {
      setIndicatorStyle({
        width: '56px', // Fixed width for the "drop" effect
        transform: `translateX(${activeItem.offsetLeft + activeItem.offsetWidth / 2 - 28}px)`,
      });
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div ref={navRef} className="relative flex items-center rounded-full bg-background/80 p-2 backdrop-blur-xl border shadow-2xl w-[90vw] max-w-xs h-16">
        <motion.div
          className="absolute top-2 h-14 w-14 bg-primary rounded-full shadow-lg"
          style={{
            clipPath: 'path("M28,56C12.536,56,0,43.464,0,28C0,12.536,12.536,0,28,0C43.464,0,56,12.536,56,28C56,43.464,43.464,56,28,56Z M28,52C41.255,52,52,41.255,52,28C52,14.745,41.255,4,28,4C14.745,4,4,14.745,4,28C4,41.255,14.745,52,28,52Z")',
          }}
          initial={false}
          animate={indicatorStyle}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const allowedNavPaths = ['/chat', '/chat/groups', '/chat/calls', '/chat/status'];
  const showNav = allowedNavPaths.includes(pathname);

  return (
    <div className="h-screen w-full relative">
        {showNav && !isMobile && user && <DesktopNav user={user} />}
        <main className={cn("h-full", showNav && !isMobile && "ml-28", showNav && isMobile && "pb-24")}>
            {children}
        </main>
        {showNav && isMobile && <MobileNav />}
    </div>
  );
}
