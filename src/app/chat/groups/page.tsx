
'use client';

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare, Users, Phone, CircleDot, PlusCircle, Search, Loader2 } from 'lucide-react'
import { ChatAvatar } from '@/components/chat/chat-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useUser } from '@/firebase/auth/use-user'
import { useFirestore } from '@/firebase/provider'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import type { Chat as ChatType } from '@/lib/types'
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale'

export default function GroupsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { user } = useUser();
  const firestore = useFirestore();
  const [groupChats, setGroupChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) return;

    const chatsRef = collection(firestore, 'chats');
    const q = query(
      chatsRef,
      where('members', 'array-contains', user.uid),
      where('type', '==', 'group'),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData: ChatType[] = [];
      querySnapshot.forEach((doc) => {
        chatsData.push({ id: doc.id, ...doc.data() } as ChatType);
      });
      setGroupChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching group chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const filteredGroups = groupChats.filter((chat) =>
    chat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Hier';
    }
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="flex flex-col h-full bg-background/90 text-foreground">
      <header className="p-4 border-b flex items-center justify-between bg-background/95 sticky top-0 z-10 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">
                Groupes
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
                <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
                <PlusCircle size={20} />
            </Button>
          </div>
      </header>

       <ScrollArea className="flex-1">
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher des groupes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-muted/50 pl-10"
                    />
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="p-2 space-y-1">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map(chat => {
                            let lastMessageContent = chat.lastMessage?.type === 'image' ? 'Photo' : chat.lastMessage?.content;
                            if (lastMessageContent && lastMessageContent.length > 20) {
                              lastMessageContent = lastMessageContent.substring(0, 20) + '...';
                            }
                            return (
                                <Link href={`/chat/${chat.id}`} key={chat.id}>
                                    <div className="flex items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                                        <ChatAvatar
                                            user={{ name: chat.name!, avatar: `https://avatar.vercel.sh/${chat.name}.png`, online: false, id: chat.id }}
                                            isGroup={true}
                                        />
                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className="font-semibold truncate">{chat.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{lastMessageContent || "Aucun message"}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                                            {formatTimestamp(chat.lastMessageTimestamp)}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="text-center text-muted-foreground p-10 mt-10">
                            <Users className="mx-auto w-12 h-12 mb-4" />
                            <h3 className="font-semibold text-lg">Aucun groupe trouvé</h3>
                            <p className="text-sm">Vous n'êtes actuellement dans aucun groupe.</p>
                        </div>
                    )}
                </div>
            )}
       </ScrollArea>
    </div>
  )
}

    