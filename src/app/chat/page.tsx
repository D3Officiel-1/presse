
'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { Chat as ChatType, User as UserType } from '@/lib/types'
import { ChatAvatar } from '@/components/chat/chat-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, SquarePen, Shield, Search, CheckCheck, Settings, User as UserIcon, Archive, BellOff, Pin, Ban, Trash, Users, MessageSquare, Star, MailWarning, X, Bell, MailOpen, Music } from 'lucide-react'
import { useUser } from '@/firebase/auth/use-user'
import { useFirestore } from '@/firebase/provider'
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, setDoc, serverTimestamp, writeBatch, collectionGroup, limit, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionFocusView, type ActionItem } from '@/components/chat/action-focus-view'

function ChatList({
    chats,
    usersData,
    currentUser,
    loading,
    selectedChatId,
    onSelectChat
}: {
    chats: ChatType[],
    usersData: {[key: string]: UserType},
    currentUser: any,
    loading: boolean,
    selectedChatId: string | null,
    onSelectChat: (chatId: string | null) => void
}) {
  const pathname = usePathname();
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

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
  
  if (loading) {
    return (
      <div className="space-y-1 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
             <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-3 w-12" />
             </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (chats.length === 0) {
    return (
        <div className="text-center text-muted-foreground p-10 mt-10">
            <Search className="mx-auto w-12 h-12 mb-4" />
            <h3 className="font-semibold text-lg">Aucune discussion trouvée</h3>
            <p className="text-sm">Aucune discussion ne correspond à vos filtres actuels.</p>
        </div>
    )
  }

  return (
    <ScrollArea className="flex-1 -mx-2">
        <div className="flex flex-col gap-1 p-2" onClick={() => selectedChatId && onSelectChat(null)}>
            {chats.map((chat) => {
                const isSelected = selectedChatId === chat.id;
                const isCommunity = chat.type === 'community';
                const otherUserId = !isCommunity ? chat.members.find((uid) => uid !== currentUser?.uid) : undefined;
                const otherUser = otherUserId ? usersData[otherUserId] : undefined;
                const isTyping = otherUserId ? chat.typing?.[otherUserId] : false;
                const chatName = chat.name || (otherUser ? otherUser.name : 'Chargement...');

                let lastMessageContent: React.ReactNode = chat.lastMessage?.content || 'Aucun message';
                if (chat.lastMessage?.type === 'image') lastMessageContent = <div className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> Photo</div>;
                if (chat.lastMessage?.type === 'audio') lastMessageContent = <div className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> Message vocal</div>;

                if (typeof lastMessageContent === 'string' && lastMessageContent.length > 30) {
                    lastMessageContent = lastMessageContent.substring(0, 30) + '...';
                }

                const isActive = pathname === `/chat/${chat.id}`;
                const unreadCount = currentUser && chat.unreadCounts ? chat.unreadCounts[currentUser.uid] : 0;
                const chatAvatarUser = isCommunity ? { name: chat.name || 'Communauté', avatar: "https://i.postimg.cc/fbtSZFWz/icon-256x256.png" } : otherUser;

                const isMuted = chat.mutedBy?.includes(currentUser?.uid ?? '');
                const isPinned = chat.pinnedBy?.includes(currentUser?.uid ?? '');

                const handlePointerDown = (e: React.PointerEvent) => {
                    // For touch devices, context menu is usually triggered by long press
                    if (e.pointerType === 'touch') {
                      e.preventDefault();
                      longPressTimeout.current = setTimeout(() => {
                          onSelectChat(chat.id);
                      }, 500); // 500ms for long press
                    }
                };

                const handlePointerUp = () => {
                    if (longPressTimeout.current) {
                        clearTimeout(longPressTimeout.current);
                    }
                };

                const handleContextMenu = (e: React.MouseEvent) => {
                    e.preventDefault();
                    onSelectChat(chat.id);
                };

                return (
                    <motion.div
                        key={chat.id}
                        layoutId={isSelected ? `chat-card-${chat.id}` : undefined}
                        className={cn("relative w-full", isSelected && "z-40")}
                        onContextMenu={handleContextMenu}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                        <Link href={`/chat/${chat.id}`} onClick={(e) => { if (selectedChatId) e.preventDefault(); }}>
                            <div
                                style={{ opacity: isSelected ? 0 : 1 }}
                                className={cn(
                                    'flex items-center p-3 rounded-lg transition-colors duration-200',
                                    isActive && !selectedChatId ? 'bg-primary/10' : 'hover:bg-muted/50'
                                )}
                            >
                                {chatAvatarUser ? (
                                    <ChatAvatar user={chatAvatarUser} isGroup={chat.type === 'group'} isCommunity={isCommunity} />
                                ) : <Skeleton className="h-12 w-12 rounded-full" />}
                                
                                <div className="ml-4 flex-1 min-w-0">
                                    <span className={cn("font-semibold truncate block", isActive && !selectedChatId ? 'text-primary' : '')}>{chatName}</span>
                                    {isTyping ? (
                                        <span className="text-xs text-green-500 animate-pulse">est en train d'écrire...</span>
                                    ) : (
                                        <span className={cn("text-xs truncate block", isActive && !selectedChatId ? 'text-primary/80' : 'text-muted-foreground')}>
                                            {lastMessageContent}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col items-end ml-2 text-xs h-full justify-between">
                                    <span className={cn("whitespace-nowrap", isActive && !selectedChatId ? 'text-primary/90' : 'text-muted-foreground', unreadCount !== 0 ? 'mb-1' : '')}>
                                        {formatTimestamp(chat.lastMessageTimestamp)}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {isPinned && <Pin className="w-3.5 h-3.5 text-muted-foreground" transform="rotate(-45)" />}
                                      {isMuted && <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
                                      {unreadCount > 0 ? (
                                          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                                              {unreadCount}
                                          </span>
                                      ) : unreadCount === -1 ? (
                                          <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                                      ) : null}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )
            })}
        </div>
    </ScrollArea>
  );
}


export default function ChatsPage() {
  const [search, setSearch] = React.useState('');
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [usersData, setUsersData] = useState<{[key: string]: UserType}>({});
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [hasStarredMessages, setHasStarredMessages] = useState(false);
  const [hasArchivedChats, setHasArchivedChats] = useState(false);
  
  const hasUnreadChats = chats.some(chat => !chat.archivedBy?.includes(user?.uid ?? '') && (chat.unreadCounts?.[user?.uid ?? ''] ?? 0) > 0);

  useEffect(() => {
    if (user && firestore) {
      const checkAdminAndCommunity = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
           setUsersData(prev => ({...prev, [user.uid]: {id: user.uid, ...userDoc.data()} as UserType}));
           if (userDoc.data().admin === true) setIsAdmin(true);
        }

        const communityChatRef = doc(firestore, 'chats', 'community-presse');
        const communityDoc = await getDoc(communityChatRef);
        if (!communityDoc.exists()) {
           await setDoc(communityChatRef, {
                id: 'community-presse',
                name: 'Communauté Presse',
                type: 'community',
                members: [],
                createdAt: serverTimestamp(),
                lastMessage: { content: 'Bienvenue dans la communauté du Club de Presse !'},
                lastMessageTimestamp: serverTimestamp(),
           });
        }
      };
      checkAdminAndCommunity();

      const checkStarredMessages = async () => {
        const starredQuery = query(
          collectionGroup(firestore, 'messages'),
          where('starredBy', 'array-contains', user.uid),
          limit(1)
        );
        const snapshot = await getDocs(starredQuery);
        setHasStarredMessages(!snapshot.empty);
      };

      checkStarredMessages();
      
      const chatsRef = collection(firestore, 'chats');
      const allUserChatsQuery = query(chatsRef, 
        where('members', 'array-contains', user.uid),
        orderBy('lastMessageTimestamp', 'desc')
      );
      
      const communityQuery = query(chatsRef, where('type', '==', 'community'));
      
      const archivedQuery = query(
        chatsRef,
        where('archivedBy', 'array-contains', user.uid),
        limit(1)
      );

      const processChats = (querySnapshot: any, isInitialLoad: boolean) => {
        const chatsData: ChatType[] = [];
        const userIdsToListen = new Set<string>();

        querySnapshot.forEach((doc: any) => {
            const chat = { id: doc.id, ...doc.data() } as ChatType;
             if (chat.type !== 'community' && chat.members.includes(user.uid)) {
                chatsData.push(chat);
                const otherUserId = chat.members.find(uid => uid !== user.uid);
                if (otherUserId) userIdsToListen.add(otherUserId);
            }
        });
        
        setChats(prevChats => {
            const existingIds = new Set(prevChats.map(c => c.id));
            const newChats = chatsData.filter(c => !existingIds.has(c.id));
            const updatedChats = prevChats.map(pc => chatsData.find(nc => nc.id === pc.id) || pc);
            
            const allChats = [...updatedChats, ...newChats];

            return allChats.sort((a, b) => {
              const timeA = a.lastMessageTimestamp?.toMillis() || 0;
              const timeB = b.lastMessageTimestamp?.toMillis() || 0;
              return timeB - timeA;
            });
        });

        if (userIdsToListen.size > 0) {
          const usersRef = collection(firestore, 'users');
          const usersQuery = query(usersRef, where('__name__', 'in', Array.from(userIdsToListen)));
          
          onSnapshot(usersQuery, (usersSnap) => {
            const fetchedUsersData: {[key: string]: UserType} = {};
            usersSnap.forEach(userDoc => {
                fetchedUsersData[userDoc.id] = { id: userDoc.id, ...userDoc.data() } as UserType;
            });
            setUsersData(prev => ({...prev, ...fetchedUsersData}));
          });
        }
         if (isInitialLoad) setLoading(false);
      };
      
      const processCommunityChats = (querySnapshot: any) => {
          querySnapshot.forEach((doc: any) => {
              const communityChat = { id: doc.id, ...doc.data() } as ChatType;
              setChats(prev => {
                  const withoutOld = prev.filter(c => c.id !== communityChat.id);
                  const newAll = [communityChat, ...withoutOld];
                  return newAll.sort((a, b) => {
                    const timeA = a.lastMessageTimestamp?.toMillis() || 0;
                    const timeB = b.lastMessageTimestamp?.toMillis() || 0;
                    return timeB - timeA;
                  });
              })
          })
      }

      const unsubscribePrivate = onSnapshot(allUserChatsQuery, (snapshot) => processChats(snapshot, true));
      const unsubscribeCommunity = onSnapshot(communityQuery, (snapshot) => processCommunityChats(snapshot));
      const unsubscribeArchived = onSnapshot(archivedQuery, (snapshot) => setHasArchivedChats(!snapshot.empty));

      return () => {
        unsubscribePrivate();
        unsubscribeCommunity();
        unsubscribeArchived();
      }
    }
  }, [user, firestore]);
  
  const handleMarkAllAsRead = async () => {
    if (!firestore || !user) return;
    const batch = writeBatch(firestore);
    let updatedCount = 0;
    chats.forEach(chat => {
      if ((chat.unreadCounts?.[user.uid] || 0) !== 0) {
        batch.update(doc(firestore, 'chats', chat.id), { [`unreadCounts.${user.uid}`]: 0 });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
        await batch.commit();
        toast({ title: 'Discussions mises à jour', description: 'Tous les messages ont été marqués comme lus.' });
    } else {
        toast({ description: 'Aucun message non lu à marquer.' });
    }
  };
  
  const handleArchiveChat = async () => {
    if (!firestore || !user || !selectedChatId) return;

    const chatRef = doc(firestore, 'chats', selectedChatId);
    try {
        await updateDoc(chatRef, {
            archivedBy: arrayUnion(user.uid)
        });
        toast({ title: 'Discussion archivée.' });
    } catch (error) {
        console.error("Error archiving chat:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'archiver la discussion.' });
    } finally {
        setSelectedChatId(null);
    }
  };

    const handleMuteChat = async (duration: string) => {
        if (!firestore || !user || !selectedChatId) return;

        const chatRef = doc(firestore, 'chats', selectedChatId);
        try {
            await updateDoc(chatRef, {
                mutedBy: arrayUnion(user.uid)
            });
            toast({ description: `Discussion mise en sourdine ${duration}.` });
        } catch (error) {
            console.error("Error muting chat:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre la discussion en sourdine.' });
        } finally {
            setSelectedChatId(null);
        }
    };

    const handleUnmuteChat = async () => {
        if (!firestore || !user || !selectedChatId) return;

        const chatRef = doc(firestore, 'chats', selectedChatId);
        try {
            await updateDoc(chatRef, {
                mutedBy: arrayRemove(user.uid)
            });
            toast({ description: "Le son de la discussion a été réactivé." });
        } catch (error) {
            console.error("Error unmuting chat:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de réactiver le son.' });
        } finally {
            setSelectedChatId(null);
        }
    };
    
    const handlePinChat = async () => {
        if (!firestore || !user || !selectedChatId) return;
    
        const chatRef = doc(firestore, 'chats', selectedChatId);
        try {
            await updateDoc(chatRef, {
                pinnedBy: arrayUnion(user.uid)
            });
            toast({ description: 'Discussion épinglée.' });
        } catch (error) {
            console.error("Error pinning chat:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'épingler la discussion.' });
        } finally {
            setSelectedChatId(null);
        }
    };
    
    const handleUnpinChat = async () => {
        if (!firestore || !user || !selectedChatId) return;
    
        const chatRef = doc(firestore, 'chats', selectedChatId);
        try {
            await updateDoc(chatRef, {
                pinnedBy: arrayRemove(user.uid)
            });
            toast({ description: 'Discussion désépinglée.' });
        } catch (error) {
            console.error("Error unpinning chat:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de désépingler la discussion.' });
        } finally {
            setSelectedChatId(null);
        }
    };

    const handleToggleUnreadStatus = async () => {
        if (!firestore || !user || !selectedChatId) return;

        const chat = chats.find(c => c.id === selectedChatId);
        if (!chat) return;

        const chatRef = doc(firestore, 'chats', selectedChatId);
        const isCurrentlyUnread = (chat.unreadCounts?.[user.uid] || 0) !== 0;
        const newUnreadCount = isCurrentlyUnread ? 0 : -1; // -1 for manually marked as unread

        try {
            await updateDoc(chatRef, {
                [`unreadCounts.${user.uid}`]: newUnreadCount
            });
            toast({ description: isCurrentlyUnread ? 'Marquée comme lue.' : 'Marquée comme non lue.' });
        } catch (error) {
            console.error("Error toggling unread status:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de changer le statut de la discussion.' });
        } finally {
            setSelectedChatId(null);
        }
    };

    const handleDeleteChat = async () => {
        if (!firestore || !user || !selectedChatId) return;
    
        const chatRef = doc(firestore, 'chats', selectedChatId);
        const messagesRef = collection(firestore, 'chats', selectedChatId, 'messages');
    
        try {
            const batch = writeBatch(firestore);
    
            // 1. Get all messages to mark them as deleted for the user
            const messagesSnapshot = await getDocs(messagesRef);
            messagesSnapshot.forEach(messageDoc => {
                batch.update(messageDoc.ref, {
                    deletedFor: arrayUnion(user.uid)
                });
            });
    
            // 2. Mark the chat as deleted by the user with a timestamp
            batch.update(chatRef, {
                [`deletedBy.${user.uid}`]: serverTimestamp()
            });
    
            await batch.commit();
            toast({ description: 'La discussion a été supprimée.' });
        } catch (error) {
            console.error("Error deleting chat for user:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la discussion.' });
        } finally {
            setSelectedChatId(null);
        }
    };

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const isSelectedChatMuted = selectedChat?.mutedBy?.includes(user?.uid ?? '');
  const isSelectedChatPinned = selectedChat?.pinnedBy?.includes(user?.uid ?? '');
  const isSelectedChatUnread = (selectedChat?.unreadCounts?.[user?.uid ?? ''] ?? 0) !== 0;

  const mainActions: ActionItem[] = [
    ...(selectedChatId !== 'community-presse' ? [{ icon: Archive, label: 'Archiver', action: handleArchiveChat }] : []),
    { 
        icon: isSelectedChatMuted ? Bell : BellOff, 
        label: isSelectedChatMuted ? 'Rétablir son' : 'Silencieux', 
        action: isSelectedChatMuted ? handleUnmuteChat : () => {}
    },
    { 
        icon: Pin, 
        label: isSelectedChatPinned ? 'Dépingler' : 'Épingler', 
        action: isSelectedChatPinned ? handleUnpinChat : handlePinChat 
    },
    { 
        icon: isSelectedChatUnread ? MailOpen : MailWarning,
        label: isSelectedChatUnread ? 'Marquer lue' : 'Marquer non lue', 
        action: handleToggleUnreadStatus
    },
    ...(selectedChatId !== 'community-presse' ? [{ icon: Trash, label: 'Supprimer', action: () => {} }] : []),
  ];

  const filteredAndSortedChats = React.useMemo(() => {
    return chats
      .filter((chat) => {
        if (!user) return false;
        
        const isArchived = chat.archivedBy?.includes(user.uid);
        if (isArchived) return false;
        
        const isDeleted = chat.deletedBy?.[user.uid];
        if (isDeleted) return false;

        const otherUser = chat.type === 'private' ? usersData[chat.members.find(uid => uid !== user.uid)!] : null;

        const searchFilter = search === '' ? true : (
            (chat.type === 'private' && otherUser?.name.toLowerCase().includes(search.toLowerCase())) ||
            (chat.type !== 'private' && chat.name?.toLowerCase().includes(search.toLowerCase()))
        );

        const unreadFilter = !showUnreadOnly || (chat.unreadCounts?.[user.uid] ?? 0) > 0;

        return searchFilter && unreadFilter;
      })
      .sort((a, b) => {
        if (!user) return 0;
        const isAPinned = a.pinnedBy?.includes(user.uid);
        const isBPinned = b.pinnedBy?.includes(user.uid);
        
        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;

        const timeA = a.lastMessageTimestamp?.toMillis() || 0;
        const timeB = b.lastMessageTimestamp?.toMillis() || 0;
        return timeB - timeA;
      });
  }, [chats, user, search, showUnreadOnly, usersData]);
  
  const currentUserData = user ? usersData[user.uid] : null;
  

  const navActions: ActionItem[] = [
    ...(hasStarredMessages ? [{ icon: Star, label: 'Important', action: () => router.push('/chat/starred') }] : []),
    ...(hasUnreadChats ? [{ icon: MailWarning, label: 'Non lus', action: () => setShowUnreadOnly(!showUnreadOnly) }] : []),
    { icon: Music, label: 'Musique', action: () => router.push('/chat/music') },
    ...(hasArchivedChats ? [{ icon: Archive, label: 'Archivées', action: () => router.push('/chat/archived') }] : []),
    ...(hasUnreadChats ? [{ icon: CheckCheck, label: 'Tout lire', action: handleMarkAllAsRead }] : []),
    { icon: UserIcon, label: 'Profil', action: () => user && router.push(`/chat/settings/${user.uid}`) },
    { icon: Settings, label: 'Paramètres', action: () => router.push('/chat/settings') },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin', action: () => router.push('/admin') }] : []),
  ];

  return (
    <div className="h-full w-full flex flex-col bg-background/90 text-foreground">
        <AnimatePresence>
            {selectedChatId && selectedChatId !== 'global_actions' && selectedChat && (
                <ActionFocusView
                    chat={selectedChat}
                    user={selectedChat.type === 'private' ? usersData[selectedChat.members.find(uid => uid !== user?.uid)!] : undefined}
                    onClose={() => setSelectedChatId(null)}
                    mainActions={mainActions}
                    isMuted={isSelectedChatMuted}
                    onMuteChat={handleMuteChat}
                    onDeleteChat={handleDeleteChat}
                    toast={toast}
                />
            )}
        </AnimatePresence>

      <main className="flex-1 flex flex-col min-h-0">
          <header className="p-4 flex flex-col gap-4 shrink-0">
             <div className='flex justify-between items-center'>
                 <div className='flex items-center gap-3'>
                    <Avatar className="h-11 w-11 cursor-pointer" onClick={() => user && router.push(`/chat/settings/${user.uid}`)}>
                      <AvatarImage src={currentUserData?.avatar} alt={currentUserData?.name} />
                      <AvatarFallback>{currentUserData?.name?.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{currentUserData?.name || 'Utilisateur'}</h1>
                        <p className='text-sm text-muted-foreground'>Gérez vos discussions</p>
                    </div>
                 </div>
                <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setSelectedChatId('global_actions')}>
                    <MoreHorizontal size={20} />
                </Button>

                <AnimatePresence>
                    {selectedChatId === 'global_actions' && (
                         <ActionFocusView
                            title={currentUserData?.name || ''}
                            subtitle="Actions et paramètres"
                            avatarUrl={currentUserData?.avatar}
                            avatarFallback={currentUserData?.name?.substring(0, 1) || 'U'}
                            mainActions={navActions}
                            onClose={() => setSelectedChatId(null)}
                            toast={toast}
                         />
                    )}
                </AnimatePresence>
             </div>
             <div>
                 <form>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une discussion..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/50 pl-11 h-11 rounded-full text-base"
                        />
                    </div>
                </form>
             </div>
        </header>

        <div className="flex flex-col flex-1 px-2 min-h-0">
            <div className="flex justify-between items-center p-2 pt-0">
                <h2 className="text-lg font-semibold text-muted-foreground">
                    {showUnreadOnly ? "Discussions non lues" : "Toutes les discussions"}
                </h2>
                {showUnreadOnly && (
                    <Button variant="ghost" size="sm" onClick={() => setShowUnreadOnly(false)} className="text-primary hover:text-primary">
                        Annuler
                        <X className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>
            <ChatList 
                chats={filteredAndSortedChats} 
                usersData={usersData} 
                currentUser={user} 
                loading={loading}
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
            />
        </div>
        
         <Link href="/chat/new" className='absolute bottom-24 right-6 md:bottom-10 md:right-10 z-30'>
            <Button size="icon" className="rounded-full w-16 h-16 shadow-2xl shadow-primary/30">
                <SquarePen className="w-7 h-7" />
            </Button>
        </Link>
      </main>
    </div>
  )
}
