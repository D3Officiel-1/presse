'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Chat, User } from '@/lib/data'
import {
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { ChatAvatar } from './chat-avatar'
import { ScrollArea } from '../ui/scroll-area'

interface ChatListProps {
  chats: Chat[]
  loggedInUser: User
}

export function ChatList({ chats, loggedInUser }: ChatListProps) {
  const pathname = usePathname()
  const [search, setSearch] = React.useState('')

  const filteredChats = chats.filter((chat) => {
    if (search === '') return true
    if (chat.type === 'private') {
      const otherUser = chat.users.find((u) => u.id !== loggedInUser.id)
      return otherUser?.name.toLowerCase().includes(search.toLowerCase())
    }
    return chat.name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <form>
          <div className="relative">
            <SidebarInput
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>
      <ScrollArea className="flex-1">
        <SidebarMenu>
          {filteredChats.map((chat) => {
            const otherUser = chat.users.find((u) => u.id !== loggedInUser.id)
            const chatName = chat.type === 'private' ? otherUser?.name : chat.name
            const lastMessage = chat.messages[chat.messages.length - 1]
            const lastMessageContent = lastMessage?.type === 'image' ? 'Photo' : lastMessage?.content
            const isActive = pathname === `/chat/${chat.id}`

            return (
              <SidebarMenuItem key={chat.id} className="px-3">
                <Link href={`/chat/${chat.id}`} className="w-full">
                  <SidebarMenuButton isActive={isActive} className="w-full h-auto py-2 px-2 justify-start">
                    <ChatAvatar
                      user={chat.type === 'private' ? otherUser! : { name: chat.name!, avatar: `https://avatar.vercel.sh/${chat.name}.png`, online: false }}
                      isGroup={chat.type === 'group'}
                    />
                    <div className="flex flex-col items-start truncate ml-2 group-data-[collapsible=icon]:hidden">
                      <span className="font-semibold">{chatName}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {lastMessageContent}
                      </span>
                    </div>
                    {chat.unreadCount && chat.unreadCount > 0 ? (
                      <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 group-data-[collapsible=icon]:hidden">
                        {chat.unreadCount}
                      </span>
                    ) : (
                      <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {lastMessage?.timestamp}
                      </span>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </ScrollArea>
    </div>
  )
}
