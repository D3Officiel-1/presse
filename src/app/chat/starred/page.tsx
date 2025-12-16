
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, collectionGroup, query, where, onSnapshot, orderBy, getDocs, doc } from 'firebase/firestore';
import type { Message as MessageType, User as UserType, Chat as ChatType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Star, MessageSquare, Users } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function StarredMessagesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [starredMessages, setStarredMessages] = useState<MessageType[]>([]);
  const [usersData, setUsersData] = useState<{ [key: string]: UserType }>({});
  const [chatsData, setChatsData] = useState<{ [key: string]: ChatType }>({});
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
      const chatIdsToFetch = new Set<string>();

      querySnapshot.forEach(doc => {
        const message = { id: doc.id, ...doc.data() } as MessageType;
        messagesData.push(message);
        if (message.senderId) userIdsToFetch.add(message.senderId);
        if (message.chatId) chatIdsToFetch.add(message.chatId);
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

      if (chatIdsToFetch.size > 0) {
        const chatsQuery = query(collection(firestore, 'chats'), where('__name__', 'in', Array.from(chatIdsToFetch)));
        const chatsSnap = await getDocs(chatsQuery);
        const fetchedChatsData: { [key: string]: ChatType } = {};
        chatsSnap.forEach(chatDoc => {
            fetchedChatsData[chatDoc.id] = { id: chatDoc.id, ...chatDoc.data() } as ChatType;
        });
        setChatsData(prev => ({...prev, ...fetchedChatsData}));
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
  
  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
        }
    }),
  };

  if (loading || userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
       <video
          src="https://cdn.pixabay.com/video/2024/05/20/212953-944519999_large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10 opacity-20"
        />
        <div className="absolute inset-0 bg-background/70 -z-10"/>

      <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="font-semibold text-xl tracking-tight">Messages importants</h1>
      </header>

      <main className="flex-1 overflow-auto">
        {starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Star className="w-16 h-16 mb-4 text-amber-400" />
            <h2 className="text-xl font-semibold">Aucun message important</h2>
            <p className="max-w-xs mx-auto mt-2">Appuyez longuement sur un message pour le marquer comme important et le retrouver ici.</p>
          </div>
        ) : (
          <div className="p-4 md:p-6 space-y-4">
             <AnimatePresence>
                {starredMessages.map((message, index) => {
                  const sender = usersData[message.senderId];
                  const chat = chatsData[message.chatId];

                  if (!sender || !chat) return null;

                  const isGroupChat = chat.type !== 'private';
                  const chatName = isGroupChat ? chat.name : sender.name;
                  
                  return (
                      <motion.div
                        key={message.id}
                        custom={index}
                        variants={FADE_UP_ANIMATION_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="bg-card/50 backdrop-blur-lg border border-border/20 rounded-2xl shadow-lg overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className='flex items-center gap-2'>
                                    <Avatar className='w-6 h-6'>
                                        <AvatarImage src={sender.avatar} />
                                        <AvatarFallback>{sender.name.substring(0,1)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold">{sender.name}</span>
                                    {isGroupChat && (
                                        <>
                                        <span className="mx-1">&bull;</span>
                                        <Users className="w-3 h-3"/>
                                        <span>{chat.name}</span>
                                        </>
                                    )}
                                </div>
                                <span>{formatTimestamp(message.timestamp)}</span>
                            </div>
                            <p className="text-foreground leading-relaxed">{message.content}</p>
                        </div>
                         <div className="bg-black/20 px-4 py-2 border-t border-white/5">
                            <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10 -ml-2" onClick={() => router.push(`/chat/${message.chatId}`)}>
                                <MessageSquare className="w-4 h-4" />
                                Voir dans la discussion
                            </Button>
                         </div>
                      </motion.div>
                  )
                })}
             </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
