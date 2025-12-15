
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import type { Chat as ChatType, User as UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Archive, ArchiveRestore } from 'lucide-react';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArchivedChatsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [archivedChats, setArchivedChats] = useState<ChatType[]>([]);
  const [usersData, setUsersData] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user) {
      if (!userLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const chatsRef = collection(firestore, 'chats');
    const q = query(
      chatsRef,
      where('archivedBy', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData: ChatType[] = [];
      const userIdsToFetch = new Set<string>();
      
      querySnapshot.forEach((doc) => {
        const chat = { id: doc.id, ...doc.data() } as ChatType;
        chatsData.push(chat);
        if (chat.type === 'private') {
            const otherUserId = chat.members.find(id => id !== user.uid);
            if (otherUserId) userIdsToFetch.add(otherUserId);
        }
      });
      setArchivedChats(chatsData);

      if (userIdsToFetch.size > 0) {
        const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', Array.from(userIdsToFetch)));
        onSnapshot(usersQuery, (usersSnap) => {
            const fetchedUsersData: { [key: string]: UserType } = {};
            usersSnap.forEach(userDoc => {
                fetchedUsersData[userDoc.id] = { id: userDoc.id, ...userDoc.data() } as UserType;
            });
            setUsersData(prev => ({...prev, ...fetchedUsersData}));
            setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching archived chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, userLoading]);

  const handleUnarchive = async (chatId: string) => {
    if (!firestore || !user) return;
    const chatRef = doc(firestore, 'chats', chatId);
    try {
        await updateDoc(chatRef, {
            archivedBy: arrayRemove(user.uid)
        });
        toast({ description: "La discussion a été désarchivée." });
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de désarchiver la discussion.' });
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Hier';
    return format(date, 'dd/MM/yyyy');
  };

  if (loading || userLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="p-4 border-b flex items-center gap-4 bg-background sticky top-0 z-10 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="font-semibold text-xl tracking-tight">Discussions archivées</h1>
        </header>
        <div className="flex-1 overflow-auto p-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-4 border-b flex items-center gap-4 bg-background sticky top-0 z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="font-semibold text-xl tracking-tight">Discussions archivées</h1>
      </header>

      <main className="flex-1 overflow-auto">
        {archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Archive className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">Aucune discussion archivée</h2>
            <p className="max-w-xs mx-auto mt-2">Vos discussions archivées apparaîtront ici.</p>
          </div>
        ) : (
          <div className="p-2 md:p-4 space-y-1">
            {archivedChats.map((chat) => {
              const otherUserId = chat.type === 'private' ? chat.members.find((uid) => uid !== user?.uid) : undefined;
              const otherUser = otherUserId ? usersData[otherUserId] : undefined;
              const chatName = chat.name || (otherUser ? otherUser.name : 'Chargement...');
              const chatAvatarUser = chat.type === 'private' ? otherUser : { name: chat.name!, avatar: `https://avatar.vercel.sh/${chat.name}.png` };

              return (
                <div key={chat.id} className="group flex items-center p-3 rounded-lg hover:bg-muted/50">
                    <Link href={`/chat/${chat.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                        {chatAvatarUser ? (
                            <ChatAvatar user={chatAvatarUser} isGroup={chat.type === 'group'} />
                        ) : <Skeleton className="h-12 w-12 rounded-full" />}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{chatName}</p>
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.content || 'Aucun message'}</p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                            {formatTimestamp(chat.lastMessageTimestamp)}
                        </span>
                    </Link>
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => handleUnarchive(chat.id)}>
                        <ArchiveRestore className="w-5 h-5 text-primary"/>
                    </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
