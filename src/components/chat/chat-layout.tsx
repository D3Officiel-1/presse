'use client'

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { ChatList } from './chat-list'
import { chats, loggedInUser } from '@/lib/data'
import { Button } from '../ui/button'
import { MoreHorizontal, SquarePen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith('/chat/') && pathname.split('/').length > 2;

  return (
    <SidebarProvider defaultOpen>
        <div className="h-screen w-full flex">
          <div className={cn("md:flex h-full", isChatPage ? "hidden" : "flex w-full")}>
            <Sidebar
              className="flex flex-col h-full"
              variant="sidebar"
              collapsible="icon"
            >
              <SidebarHeader className="p-4 flex items-center justify-between">
                <Link href="/chat" className="flex items-center gap-2">
                  <Image
                    src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
                    alt="Club de Presse Logo"
                    width={32}
                    height={32}
                    className="size-8 text-primary"
                  />
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-lg tracking-tight">
                      Club de Presse
                    </span>
                  </div>
                </Link>
                <div className="group-data-[collapsible=icon]:hidden flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <SquarePen size={20} />
                  </Button>
                </div>
              </SidebarHeader>
              <SidebarContent className="p-0">
                <ChatList chats={chats} loggedInUser={loggedInUser} />
              </SidebarContent>
            </Sidebar>
          </div>
          
          <div className={cn("flex-1 flex flex-col h-full", isChatPage ? "w-full" : "hidden md:flex")}>
             <div className="md:hidden p-2 border-b flex items-center gap-2">
               <SidebarTrigger />
               <h1 className="text-lg font-semibold">Club de Presse</h1>
             </div>
             <main className="flex-1 overflow-y-auto">
               {children}
             </main>
          </div>

        </div>
    </SidebarProvider>
  )
}
