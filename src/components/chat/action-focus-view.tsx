
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User, Chat, Message } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, BellOff, Trash, LogOut, Loader2, CheckCheck, Check } from 'lucide-react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages, type ReplyInfo } from '@/components/chat/chat-messages';
import { ChatTopbar } from '@/components/chat/chat-topbar';

export interface ActionItem {
  icon: LucideIcon;
  label: string;
  action: (arg?: any) => void;
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

  const [usersData, setUsersData] = useState<{[key: string]: User}>({});
  const [replyInfo, setReplyInfo] = useState<ReplyInfo | undefined>();


  useEffect(() => {
    if (!firestore || !chat) {
        if(chat === undefined) setLoadingMessages(false);
        return;
    };

    setLoadingMessages(true);
    // Fetch users data
     if (chat.members) {
        const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chat.members));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const fetchedUsers: { [key: string]: User } = {};
            snapshot.forEach(doc => {
                fetchedUsers[doc.id] = { id: doc.id, ...doc.data() } as User;
            });
            setUsersData(prev => ({ ...prev, ...fetchedUsers }));
        });
    }

    // Fetch messages
    const messagesRef = collection(firestore, 'chats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc')); // Fetch all messages, ChatMessages will handle display

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [firestore, chat]);


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
      chatInfoForTopbar = { name: chat.name, users: chat.members.map(id => usersData[id]).filter(Boolean) as User[] }
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
        chatInfoForTopbar = otherUserData || { name: chat.name, users: chat.members.map(id => usersData[id]).filter(Boolean) as User[] };
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
  
  const navigateToChat = () => {
    if (chat) {
        router.push(`/chat/${chat.id}`);
    }
  }

  const actionsGrid = 'grid-cols-4';

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

     return (
        <div className="flex flex-col h-full w-full bg-background" onClick={navigateToChat}>
            <ChatTopbar info={chatInfoForTopbar} isGroup={chat.type !== 'private'} />
            
            <div className="flex-1 overflow-hidden pointer-events-none">
                 <ChatMessages
                    messages={messages}
                    chatType={chat.type}
                    loggedInUser={currentUser}
                    otherUser={otherUserForMessages!}
                    isTyping={chat.typing?.[otherUserForMessages?.id || ''] || false}
                    chatMembers={chat.members.map(id => usersData[id]).filter(Boolean) as User[]}
                    onReply={() => {}}
                    onDeleteForMe={() => {}}
                    onDeleteForEveryone={() => {}}
                    onToggleStar={() => {}}
                    onShare={()=>{}}
                    allUsersInApp={Object.values(usersData)}
                />
            </div>
           
            <div className="pointer-events-none">
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
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center justify-center gap-6">
        {navActions && navActions.length > 0 && (
          <motion.div
            className="flex items-center gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {navActions.map((item) => (
              <motion.button
                key={item.label}
                className="flex flex-col items-center gap-2 text-center text-xs w-20"
                onClick={() => handleAction(item.action, item.label)}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-lg shadow-lg border">
                  <item.icon className="w-6 h-6" />
                </div>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        <motion.div
          layoutId={chat ? `chat-card-${chat.id}` : 'global-action-card'}
          className="w-80 h-96 rounded-2xl bg-card shadow-2xl ring-2 ring-primary/50 overflow-hidden"
        >
             {loadingMessages ? (
                <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : (
                <ChatPreview />
             )}
        </motion.div>

        <div className="relative w-full" style={{ minHeight: '150px' }}>
          <AnimatePresence mode="wait">
            {viewMode === 'main' && (
              <motion.div
                key="main-actions"
                className={cn("grid gap-x-4 gap-y-6 absolute w-full", actionsGrid)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {mainActions.map((item) => (
                  <div key={item.label}>
                    <button
                      className="flex flex-col items-center gap-2 text-center text-xs w-20"
                      onClick={() => handleAction(item.action, item.label)}
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-lg shadow-lg border">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
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
