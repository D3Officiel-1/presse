
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
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  const handleUnarchive = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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
      <div className="flex flex-col h-screen bg-background">
        <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="font-semibold text-xl tracking-tight">Discussions archivées</h1>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-black to-background -z-10 animate-gradient-xy"/>

        <header className="p-4 flex items-center gap-4 bg-background/30 backdrop-blur-xl sticky top-0 z-10 shrink-0 border-b border-white/5">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-white/5 hover:bg-white/10">
                <ArrowLeft size={20} />
            </Button>
            <h1 className="font-bold text-xl tracking-tight">Discussions Archivées</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
            {archivedChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <Archive className="w-20 h-20 mb-6 opacity-30" strokeWidth={1} />
                        <h2 className="text-xl font-semibold text-foreground">Vos archives sont vides</h2>
                        <p className="max-w-xs mx-auto mt-2">Les discussions que vous archivez apparaissent ici.</p>
                    </motion.div>
                </div>
            ) : (
                <div 
                    className="p-4 md:p-8 space-y-[-50px] relative" 
                    style={{ perspective: '1200px' }}
                >
                    <AnimatePresence>
                        {archivedChats.map((chat, index) => {
                            const otherUserId = chat.type === 'private' ? chat.members.find((uid) => uid !== user?.uid) : undefined;
                            const otherUser = otherUserId ? usersData[otherUserId] : undefined;
                            const chatName = chat.name || (otherUser ? otherUser.name : 'Chargement...');
                            const chatAvatarUser = chat.type === 'private' ? otherUser : { name: chat.name!, avatar: `https://avatar.vercel.sh/${chat.name}.png` };

                            return (
                                <motion.div
                                    key={chat.id}
                                    layout
                                    initial={{ opacity: 0, y: 50, z: -100 * index }}
                                    animate={{ opacity: 1, y: 0, z: -100 * index }}
                                    exit={{ opacity: 0, z: 200, transition: { duration: 0.5 } }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.05 }}
                                    className="group relative h-28"
                                >
                                    <motion.div 
                                        className="absolute inset-0 bg-card/40 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg transition-all duration-300 ease-out cursor-pointer"
                                        style={{ transform: `rotateX(50deg) scale(0.9) translateY(-${index * 60}px)`}}
                                        whileHover={{ rotateX: 0, scale: 1.05, y: -10, z: 50 }}
                                        onClick={() => router.push(`/chat/${chat.id}`)}
                                    >
                                        <div className="p-4 h-full flex items-center gap-4">
                                             {chatAvatarUser ? (
                                                <ChatAvatar user={chatAvatarUser} isGroup={chat.type !== 'private'} className="w-12 h-12" />
                                            ) : <Skeleton className="h-12 w-12 rounded-full" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-lg truncate">{chatName}</p>
                                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.content || 'Aucun message'}</p>
                                            </div>
                                            <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatTimestamp(chat.lastMessageTimestamp)}
                                                </span>
                                                <Button variant="ghost" size="icon" className="mt-1" onClick={(e) => handleUnarchive(chat.id, e)}>
                                                    <ArchiveRestore className="w-5 h-5 text-primary"/>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-3 text-xs text-muted-foreground transition-opacity duration-300 group-hover:opacity-0">
                                            {formatTimestamp(chat.lastMessageTimestamp)}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </main>
    </div>
  );
}
