
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User, Chat, Message } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, BellOff, Trash, LogOut, Loader2, CheckCheck, Check } from 'lucide-react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages, type ReplyInfo } from '@/components/chat/chat-messages';
import { ChatTopbar } from '@/components/chat/chat-topbar';

export interface ActionItem {
  icon: LucideIcon;
  label: string;
  action: (arg?: any) => void;
  className?: string;
}

interface ActionFocusViewProps {
  onClose: () => void;
  mainActions: ActionItem[];
  navActions?: ActionItem[];
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  chat?: Chat;
  user?: User;
  isMuted?: boolean;
  onMuteChat?: (duration: string) => void;
  onDeleteChat?: () => void;
  onLogout?: () => void;
  toast: (options: { title?: string; description: string, variant?: 'destructive' }) => void;
}

export function ActionFocusView({
  onClose,
  mainActions,
  navActions,
  title,
  subtitle,
  avatarUrl,
  avatarFallback,
  chat,
  user,
  isMuted,
  onMuteChat,
  onDeleteChat,
  onLogout,
  toast,
}: ActionFocusViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'main' | 'mute' | 'delete' | 'logout'>('main');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const [usersData, setUsersData] = useState<{ [key: string]: User }>({});
  const [replyInfo, setReplyInfo] = useState<ReplyInfo | undefined>();
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!firestore || !chat) {
        if(chat === undefined) setLoadingMessages(false);
        return;
    };

    setLoadingMessages(true);

    const fetchAssociatedUsers = async (userIds: string[]) => {
        const usersToFetch = userIds.filter(id => id && !usersData[id]);
        if (usersToFetch.length === 0) return;

        try {
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', usersToFetch));
            const usersSnap = await getDocs(usersQuery);
            const fetchedUsers: { [key: string]: User } = {};
            usersSnap.forEach(doc => {
                fetchedUsers[doc.id] = { id: doc.id, ...doc.data() } as User;
            });
            setUsersData(prev => ({ ...prev, ...fetchedUsers }));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    
    // Initial fetch for members, including community members from messages
    let userIdsToFetch = new Set<string>(chat.members || []);

    const messagesRef = collection(firestore, 'chats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      
      const messageSenderIds = msgs.map(m => m.senderId);
      const allUserIds = Array.from(new Set([...userIdsToFetch, ...messageSenderIds]));
      
      fetchAssociatedUsers(allUserIds);
      
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [firestore, chat]);

  useEffect(() => {
    if (!loadingMessages && messagesContainerRef.current) {
        const timer = setTimeout(() => {
            messagesContainerRef.current!.scrollTop = messagesContainerRef.current!.scrollHeight;
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [loadingMessages]);


  const isCommunity = chat?.type === 'community';
  
  let finalTitle: string;
  let finalAvatarUrl: string | undefined;
  let finalAvatarFallback: string;
  let chatInfoForTopbar: any;
  let otherUserForMessages: User | undefined;


  if (chat) {
    if (isCommunity) {
      finalTitle = chat.name || 'Communauté';
      finalAvatarUrl = "https://i.postimg.cc/fbtSZFWz/icon-256x256.png";
      finalAvatarFallback = chat.name?.substring(0, 1) || 'C';
      const chatMembers = chat.members.map(id => usersData[id]).filter(Boolean) as User[];
      chatInfoForTopbar = { name: chat.name, users: chatMembers }
    } else if (user) {
      finalTitle = user.name;
      finalAvatarUrl = user.avatar;
      finalAvatarFallback = user.name.substring(0, 1);
      chatInfoForTopbar = user;
      otherUserForMessages = user;
    } else {
        const otherUserId = chat.members.find(uid => uid !== currentUser?.uid);
        const otherUserData = otherUserId ? usersData[otherUserId] : undefined;
        finalTitle = otherUserData?.name || chat.name || 'Discussion';
        finalAvatarUrl = otherUserData?.avatar || `https://avatar.vercel.sh/${chat.name}.png`;
        finalAvatarFallback = otherUserData?.name?.substring(0, 1) || chat.name?.substring(0,1) || '?';
        const chatMembers = chat.members.map(id => usersData[id]).filter(Boolean) as User[];
        chatInfoForTopbar = otherUserData || { name: chat.name, users: chatMembers };
        otherUserForMessages = otherUserData;
    }
  } else {
    finalTitle = title || 'Actions';
    finalAvatarUrl = avatarUrl;
    finalAvatarFallback = avatarFallback || '?';
  }

  const handleAction = (itemAction: (arg?: any) => void, label: string) => {
    if (label === 'Silencieux') {
      setViewMode('mute');
    } else if (label === 'Supprimer') {
      setViewMode('delete');
    } else if (label === 'Déconnexion') {
        setViewMode('logout');
    } else {
      itemAction();
    }
  };

  const handleMuteDuration = (duration: string) => {
    if (onMuteChat) {
      onMuteChat(duration);
    } else {
        toast({ description: `Logique de mise en sourdine à implémenter pour ${duration}.` });
    }
    onClose();
  };

  const handleDeleteConfirm = () => {
    if (onDeleteChat) {
        onDeleteChat();
    } else {
        toast({ description: "Logique de suppression à implémenter." });
    }
    onClose();
  }
  
  const handleLogoutConfirm = () => {
      if (onLogout) {
          onLogout();
      } else {
          toast({ description: "Logique de déconnexion à implémenter." });
      }
      onClose();
  }

  const muteDurationActions = [
    { label: '15 minutes', action: () => handleMuteDuration('pour 15 minutes') },
    { label: '1 heure', action: () => handleMuteDuration('pour 1 heure') },
    { label: '8 heures', action: () => handleMuteDuration('pour 8 heures') },
    { label: 'Toujours', action: () => handleMuteDuration('pour toujours') },
  ];

  const ChatPreview = () => {
     if (!chat || !currentUser) {
       return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Pas d'aperçu disponible.</div>;
     }
     
     const allChatUsers = chat.members.map(id => usersData[id]).filter(Boolean);
     if (isCommunity) {
         const messageSenders = messages.map(m => m.senderId);
         const uniqueSenders = Array.from(new Set(messageSenders));
         uniqueSenders.forEach(id => {
            if (!allChatUsers.find(u => u.id === id)) {
                const userData = usersData[id];
                if (userData) allChatUsers.push(userData);
            }
         });
     }

     return (
        <div className="relative flex flex-col h-full w-full bg-background overflow-hidden">
            <ChatTopbar info={chatInfoForTopbar} isGroup={chat.type !== 'private'} />
            
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
                 <ChatMessages
                    messages={messages}
                    chatType={chat.type}
                    loggedInUser={currentUser}
                    otherUser={otherUserForMessages!}
                    isTyping={chat.typing?.[otherUserForMessages?.id || ''] || false}
                    chatMembers={allChatUsers}
                    onReply={() => {}}
                    onDeleteForMe={() => {}}
                    onDeleteForEveryone={() => {}}
                    onToggleStar={() => {}}
                    onShare={()=>{}}
                    allUsersInApp={Object.values(usersData)}
                />
            </div>
           
            <div className="relative">
                 <div className="absolute inset-0 z-10 cursor-not-allowed" />
                <ChatInput
                    chat={chat}
                    onSendMessage={() => {}}
                    replyInfo={undefined}
                    onClearReply={() => {}}
                />
            </div>
        </div>
     )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center justify-center gap-4">

        <motion.div
          layoutId={chat ? `chat-card-${chat.id}` : 'global-action-card'}
          className="w-80 h-96 rounded-2xl bg-card shadow-2xl ring-2 ring-primary/50 overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
             {loadingMessages ? (
                <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : (
                <ChatPreview />
             )}
        </motion.div>

        <div className="relative w-80" style={{ minHeight: '150px' }}>
          <AnimatePresence mode="wait">
            {viewMode === 'main' && (
              <motion.div
                key="main-actions"
                className="absolute w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                 <div className="grid grid-cols-4 gap-4 p-4">
                    {(navActions || mainActions).map((item) => (
                      <motion.div
                        key={item.label}
                        className="flex flex-col items-center justify-center gap-2 text-center text-xs"
                        onClick={() => handleAction(item.action, item.label)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                          <div className={cn("flex items-center justify-center w-14 h-14 bg-background/80 backdrop-blur-lg rounded-full shadow-lg border", item.className)}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <span className='truncate text-foreground/80 mt-1'>{item.label}</span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {viewMode === 'mute' && (
              <motion.div
                key="mute-actions"
                className="absolute w-full flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    {muteDurationActions.map((item) => (
                        <Button key={item.label} variant="outline" className="bg-background/80 backdrop-blur-lg" onClick={item.action}>
                            {item.label}
                        </Button>
                    ))}
                </div>
                 <Button 
                    variant="ghost" 
                    className="mt-4 rounded-full bg-background/80 backdrop-blur-lg h-12 w-12 p-0 flex items-center justify-center border"
                    onClick={() => setViewMode('main')}
                  >
                    <ArrowLeft className="w-6 h-6"/>
                </Button>
              </motion.div>
            )}
            
            {viewMode === 'delete' && (
              <motion.div
                key="delete-actions"
                className="absolute w-full flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                 <div className="w-full max-w-sm text-center">
                    <p className="text-sm text-foreground mb-4">Êtes-vous sûr de vouloir supprimer cette discussion ? Elle sera retirée de votre liste.</p>
                 </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    <Button variant="outline" className="bg-background/80 backdrop-blur-lg" onClick={() => setViewMode('main')}>
                        Annuler
                    </Button>
                    <Button variant="destructive" className="bg-destructive/80 backdrop-blur-lg" onClick={handleDeleteConfirm}>
                        Supprimer
                    </Button>
                </div>
              </motion.div>
            )}

            {viewMode === 'logout' && (
              <motion.div
                key="logout-actions"
                className="absolute w-full flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                 <div className="w-full max-w-sm text-center">
                    <p className="text-sm text-foreground mb-4">Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
                 </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    <Button variant="outline" className="bg-background/80 backdrop-blur-lg" onClick={() => setViewMode('main')}>
                        Annuler
                    </Button>
                    <Button variant="destructive" className="bg-destructive/80 backdrop-blur-lg" onClick={handleLogoutConfirm}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Confirmer
                    </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
