
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collectionGroup, query, where, onSnapshot, orderBy, getDocs, collection } from 'firebase/firestore';
import type { Message as MessageType, User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Star, MessageSquare } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StarredMessagesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [starredMessages, setStarredMessages] = useState<MessageType[]>([]);
  const [usersData, setUsersData] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user) {
        if (!userLoading) setLoading(false);
        return;
    };

    setLoading(true);
    const messagesRef = collectionGroup(firestore, 'messages');
    const q = query(
      messagesRef,
      where('starredBy', 'array-contains', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const messagesData: MessageType[] = [];
      const userIdsToFetch = new Set<string>();

      querySnapshot.forEach(doc => {
        const message = { id: doc.id, ...doc.data() } as MessageType;
        messagesData.push(message);
        if (message.senderId && !usersData[message.senderId]) {
            userIdsToFetch.add(message.senderId);
        }
      });
      
      if (userIdsToFetch.size > 0) {
        const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', Array.from(userIdsToFetch)));
        const usersSnap = await getDocs(usersQuery);
        const fetchedUsersData: { [key: string]: UserType } = {};
        usersSnap.forEach(userDoc => {
            fetchedUsersData[userDoc.id] = { id: userDoc.id, ...userDoc.data() } as UserType;
        });
        setUsersData(prev => ({...prev, ...fetchedUsersData}));
      }

      setStarredMessages(messagesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching starred messages: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, userLoading]);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Hier';
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  if (loading || userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-4 border-b flex items-center gap-4 bg-background sticky top-0 z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="font-semibold text-xl tracking-tight">Messages importants</h1>
      </header>

      <main className="flex-1 overflow-auto">
        {starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Star className="w-16 h-16 mb-4 text-amber-400" />
            <h2 className="text-xl font-semibold">Aucun message important</h2>
            <p className="max-w-xs mx-auto mt-2">Maintenez appuyé sur un message pour le marquer comme important et le retrouver facilement ici.</p>
          </div>
        ) : (
          <div className="p-2 md:p-4 space-y-4">
            {starredMessages.map((message) => {
               const sender = usersData[message.senderId];
               if (!sender) return null;
               return (
                  <div key={message.id} className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className='flex items-center gap-2'>
                            <Avatar className='w-5 h-5'>
                                <AvatarImage src={sender.avatar} />
                                <AvatarFallback>{sender.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <span>{sender.name}</span>
                        </div>
                        <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                     <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/chat/${message.chatId}`)}>
                        <MessageSquare className="w-4 h-4" />
                        Aller au message
                    </Button>
                  </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
}
