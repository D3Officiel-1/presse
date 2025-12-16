
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatMessageDate } from '@/lib/utils';
import type { Message, User, Chat as ChatType } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Trash2,
  Star,
  Share2,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  ChevronRight,
  Pin,
  MessageSquare,
  Check,
  CheckCheck,
  Edit,
  X,
  Send,
  CornerUpLeft,
  Loader2,
} from 'lucide-react';
import { ChatMessageStatus } from './chat-message-status';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { ActionItem } from './action-focus-view';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';


const ReactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const generateColorFromId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 65%)`;
};


export interface ReplyInfo extends Message {}

interface ChatMessagesProps {
  messages: Message[];
  chat: ChatType;
  loggedInUser: any;
  otherUser: User;
  isTyping: boolean;
  chatMembers: User[];
  onReply: (message: ReplyInfo) => void;
  onShare: (message: Message, userIds: string[]) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onToggleStar: (messageId: string, isStarred: boolean) => void;
  onTogglePin: (message: Message, isPinned: boolean) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  allUsersInApp: User[];
  isAdmin: boolean;
  onScrollToMessage: (messageId: string) => void;
}

interface SenderMessageGroup {
  senderId: string;
  sender: User | undefined;
  messages: Message[];
  position: 'left' | 'right';
}

interface DailyMessageGroup {
    date: string;
    groups: SenderMessageGroup[];
}

const AudioPlayer: React.FC<{ src: string; metadata?: { duration: number } }> = ({ src, metadata }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(metadata?.duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const timeUpdate = () => {
      if (audio.duration > 0 && isFinite(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      // Don't reset progress to allow seeing the final state
    };

    const onLoadedMetadata = () => {
        if (isFinite(audio.duration)) {
            setDuration(audio.duration);
        }
    }

    audio.addEventListener('timeupdate', timeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', timeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        if (audio.ended) {
          audio.currentTime = 0;
        }
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 w-48 md:w-56">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-full bg-foreground/10 hover:bg-foreground/20"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-4 w-4 text-background" /> : <Play className="h-4 w-4 text-background" />}
      </Button>
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <div 
            className="w-full h-1.5 bg-foreground/20 rounded-full cursor-pointer group"
            onClick={handleSeek}
        >
            <div className="h-full bg-foreground/80 rounded-full relative" style={{ width: `${progress}%` }}>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-background shadow group-hover:scale-110 transition-transform" />
            </div>
        </div>
        <div className="text-xs text-right opacity-70 font-mono">
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({
  message,
  position,
  isFirstInGroup,
  isLastInGroup,
  onOpenContextMenu,
  onReply,
  isEditing,
  onSaveEdit,
  onCancelEdit
}: {
  message: Message;
  position: 'left' | 'right';
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onOpenContextMenu: (e: React.MouseEvent | React.TouchEvent, message: Message) => void;
  onReply: () => void;
  isEditing: boolean;
  onSaveEdit: (newContent: string) => void;
  onCancelEdit: () => void;
}) => {
  const isOwn = position === 'right';
  const longPressTimer = useRef<NodeJS.Timeout>();
  const { onScrollToMessage, loggedInUser } = React.useContext(ChatContext);
  const [editedContent, setEditedContent] = useState(message.content);
  const isStarred = message.starredBy?.includes(loggedInUser.uid);

  useEffect(() => {
    setEditedContent(message.content);
  }, [message.content, isEditing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && !isEditing) {
      longPressTimer.current = setTimeout(() => {
        onOpenContextMenu(e, message);
      }, 500);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      if(longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };
  
  const onDragEnd = (event: any, info: any) => {
    if (isEditing) return;
    const dragThreshold = 60;
    const dragDistance = info.offset.x;
    
    if ( (isOwn && dragDistance < -dragThreshold) || (!isOwn && dragDistance > dragThreshold) ) {
      onReply();
    }
  };

  const handleSave = () => {
    if (editedContent.trim() !== message.content) {
      onSaveEdit(editedContent.trim());
    } else {
      onCancelEdit();
    }
  };

  const bubbleClasses = cn(
    'relative w-fit max-w-xs md:max-w-md px-3.5 py-2.5 shadow-md',
    isOwn 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-muted text-foreground',
    'rounded-t-2xl',
    isOwn
        ? isLastInGroup ? 'rounded-bl-2xl' : 'rounded-l-2xl'
        : isLastInGroup ? 'rounded-br-2xl' : 'rounded-r-2xl'
  );
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };
  
  return (
    <motion.div
        id={`message-${message.id}`}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onContextMenu={(e) => !isEditing && onOpenContextMenu(e, message)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={cn('group flex items-end gap-2 w-full', isOwn ? 'justify-end' : 'justify-start')}
    >
      <motion.div
        drag={isEditing ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        className={bubbleClasses}
      >
        {isEditing ? (
            <div className="space-y-2">
                <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    autoFocus
                    className="bg-transparent border-0 focus-visible:ring-0 p-0 text-primary-foreground resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSave();
                        }
                        if (e.key === 'Escape') {
                            onCancelEdit();
                        }
                    }}
                />
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" className="h-7" onClick={onCancelEdit}>Annuler</Button>
                    <Button size="sm" className="h-7" onClick={handleSave}>Enregistrer</Button>
                </div>
            </div>
        ) : (
            <>
                {message.forwardedFrom && (
                    <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1.5">
                        <CornerUpLeft className="w-3 h-3" />
                        <span>Transféré de {message.forwardedFrom.senderName}</span>
                    </div>
                )}
                {message.replyTo?.messageId && (
                    <div 
                      className="border-l-2 border-primary/50 pl-2 text-xs opacity-80 mb-1.5 cursor-pointer"
                      onClick={() => onScrollToMessage(message.replyTo!.messageId)}
                    >
                        <p className="font-bold">{message.replyTo.senderName}</p>
                        <p className="truncate">{message.replyTo.message}</p>
                    </div>
                )}

                {message.type === 'text' && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}
                
                {message.type === 'image' && (
                    <div className="relative w-64 h-64 rounded-md overflow-hidden my-1">
                        <Image src={message.content} alt="Image partagée" layout="fill" className="object-cover" />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                )}

                {message.type === 'audio' && <AudioPlayer src={message.content} metadata={message.audioMetadata} />}

                <div className="flex items-center justify-end gap-1.5 mt-1 float-right">
                    {message.editedAt && <span className="text-xs opacity-70 italic mr-1">modifié</span>}
                    <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
                    {isStarred && <Star className="w-3 h-3 text-current opacity-70" />}
                    {isOwn && <ChatMessageStatus message={message} otherUser={(React.useContext(ChatContext) as any).otherUser} />}
                </div>
            </>
        )}
      </motion.div>
    </motion.div>
  );
};


const MessageFocusView = ({
    message,
    onClose,
    onReply,
    onDeleteForMe,
    onDeleteForEveryone,
    onToggleStar,
    onTogglePin,
    onEdit,
    onShare,
}: {
    message: Message | null;
    onClose: () => void;
    onReply: () => void;
    onDeleteForMe: () => void;
    onDeleteForEveryone: () => void;
    onToggleStar: () => void;
    onTogglePin: () => void;
    onEdit: () => void;
    onShare: (message: Message, userIds: string[]) => void;
}) => {
    const chatContext = React.useContext(ChatContext);
    const firestore = useFirestore();
    const [viewMode, setViewMode] = React.useState<'main' | 'delete' | 'share'>('main');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    const [recentChatUsers, setRecentChatUsers] = useState<User[]>([]);
    const [otherUsers, setOtherUsers] = useState<User[]>([]);

    const [loadingShare, setLoadingShare] = useState(false);

    useEffect(() => {
        if (viewMode !== 'share') return;
        
        const fetchShareList = async () => {
            if (!firestore || !chatContext.loggedInUser) return;
            setLoadingShare(true);
            try {
                // 1. Fetch all users except the current one
                const usersRef = collection(firestore, 'users');
                const usersQuery = query(usersRef, where('__name__', '!=', chatContext.loggedInUser.uid));
                const usersSnap = await getDocs(usersQuery);
                const allUsersFromDb = usersSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as User));

                // 2. Fetch all private chats involving the current user
                const chatsRef = collection(firestore, 'chats');
                const privateChatsQuery = query(chatsRef, 
                    where('type', '==', 'private'),
                    where('members', 'array-contains', chatContext.loggedInUser.uid)
                );
                const privateChatsSnap = await getDocs(privateChatsQuery);

                const recentChatUserIds = new Set<string>();
                privateChatsSnap.forEach(doc => {
                    const chatData = doc.data();
                    const otherMemberId = chatData.members.find((id: string) => id !== chatContext.loggedInUser.uid);
                    if (otherMemberId) {
                        recentChatUserIds.add(otherMemberId);
                    }
                });
                
                // 3. Categorize users
                const recents = allUsersFromDb.filter(u => recentChatUserIds.has(u.id));
                const others = allUsersFromDb.filter(u => !recentChatUserIds.has(u.id));

                setRecentChatUsers(recents);
                setOtherUsers(others);

            } catch (error) {
                console.error("Error building share list:", error);
            } finally {
                setLoadingShare(false);
            }
        };

        fetchShareList();

    }, [viewMode, firestore, chatContext.loggedInUser]);


    if (!message) return null;
    
    const sender = chatContext.allUsersInApp.find((u: User) => u.id === message.senderId) || message.sender;
    const isOwnMessage = sender.id === chatContext.loggedInUser.uid;
    const isStarred = message.starredBy?.includes(chatContext.loggedInUser.uid) ?? false;
    const isCommunity = chatContext.chat.type === 'community';
    const isPinned = chatContext.chat.pinnedMessages?.some((m: Message) => m.id === message.id) ?? false;
    
    const timeSinceSent = (Timestamp.now().seconds - message.timestamp.seconds) / 60; // in minutes
    const canEdit = isOwnMessage && timeSinceSent < 10 && message.type === 'text';

    const handleActionClick = (action: () => void, label: string) => {
        if (label === 'Supprimer') {
            setViewMode('delete');
        } else if (label === 'Transférer') {
            setViewMode('share');
        } else {
            action();
            onClose();
        }
    };
    
    const handleToggleUserSelection = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleConfirmShare = () => {
        if (selectedUsers.length > 0) {
            onShare(message, selectedUsers);
            onClose();
        }
    };


    const mainActions: ActionItem[] = [
        ...(canEdit ? [{ label: 'Modifier', icon: Edit, action: onEdit }] : [{ label: 'Répondre', icon: MessageSquare, action: onReply }]),
        { label: 'Copier', icon: Copy, action: () => navigator.clipboard.writeText(message.content) },
        { label: 'Transférer', icon: Share2, action: () => {} },
        { label: isStarred ? 'Retirer' : 'Important', icon: Star, action: onToggleStar },
        { label: 'Supprimer', icon: Trash2, action: () => {}, className: 'text-destructive' },
    ];
    
    if (chatContext.isAdmin && isCommunity) {
       mainActions.push({ label: isPinned ? 'Désépingler' : 'Épingler', icon: Pin, action: onTogglePin });
    }

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 },
        }),
    };

    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      >
        <div className="absolute inset-0 bg-background/50" onClick={onClose} />
        
        <AnimatePresence mode="wait">
          {viewMode === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="relative flex flex-col items-center gap-6 w-full max-w-md"
            >
              <div className={cn("w-full flex", sender.id === chatContext.loggedInUser.uid ? 'justify-end' : 'justify-start')}>
                <ChatMessage 
                  message={{...message, sender}} 
                  position={sender.id === chatContext.loggedInUser.uid ? 'right' : 'left'} 
                  onOpenContextMenu={() => {}} 
                  onReply={() => {}}
                  isFirstInGroup={true}
                  isLastInGroup={true}
                  isEditing={false}
                  onSaveEdit={() => {}}
                  onCancelEdit={() => {}}
                />
              </div>
              <motion.div
                className="mt-4 grid grid-cols-3 gap-4 w-full max-w-xs"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
                }}
                initial="hidden"
                animate="visible"
              >
                {mainActions.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex flex-col items-center justify-center gap-2 text-center text-xs cursor-pointer"
                    variants={itemVariants}
                    custom={index}
                    onClick={() => handleActionClick(item.action, item.label)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={cn("flex items-center justify-center w-14 h-14 bg-background/80 backdrop-blur-lg rounded-full shadow-lg border", item.className)}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-foreground font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {viewMode === 'share' && (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className="w-full max-w-md bg-background/80 backdrop-blur-lg rounded-2xl border shadow-2xl flex flex-col h-[70vh]"
            >
              <div className="p-4 border-b flex justify-between items-center">
                  <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4"/></Button>
                  <h3 className="font-semibold text-center">Transférer à...</h3>
                  <div className="w-9"></div>
              </div>
              {loadingShare ? (
                  <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin"/>
                  </div>
              ) : (
                  <div className="flex-1 overflow-y-auto p-2">
                      {recentChatUsers.length > 0 && (
                          <div className="mb-4">
                              <h4 className="px-2 text-sm font-semibold text-muted-foreground mb-2">Discussions récentes</h4>
                              {recentChatUsers.map((user: User) => (
                                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleToggleUserSelection(user.id)}>
                                      <div className="relative">
                                          <Avatar>
                                              <AvatarImage src={user.avatar} />
                                              <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                                          </Avatar>
                                          {selectedUsers.includes(user.id) && (
                                              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
                                                  <Check className="w-3 h-3" />
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{user.name}</p>
                                        {user.class && <p className="text-xs text-muted-foreground truncate">{user.class}</p>}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                      
                      {otherUsers.length > 0 && (
                           <div>
                               <h4 className="px-2 text-sm font-semibold text-muted-foreground mb-2">Autres membres</h4>
                               {otherUsers.map((user: User) => (
                                   <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleToggleUserSelection(user.id)}>
                                       <div className="relative">
                                           <Avatar>
                                               <AvatarImage src={user.avatar} />
                                               <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                                           </Avatar>
                                           {selectedUsers.includes(user.id) && (
                                               <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
                                                   <Check className="w-3 h-3" />
                                               </div>
                                           )}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{user.name}</p>
                                        {user.class && <p className="text-xs text-muted-foreground truncate">{user.class}</p>}
                                      </div>
                                   </div>
                               ))}
                           </div>
                      )}
                  </div>
              )}
              {selectedUsers.length > 0 && (
                  <div className="p-3 border-t">
                      <Button className="w-full" onClick={handleConfirmShare}>
                          <Send className="w-4 h-4 mr-2"/>
                          Envoyer à {selectedUsers.length} membre{selectedUsers.length > 1 ? 's' : ''}
                      </Button>
                  </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    )
}

const ChatContext = React.createContext<any>({});

export function ChatMessages({
  messages,
  chat,
  loggedInUser,
  otherUser,
  isTyping,
  chatMembers,
  onReply,
  onShare,
  onDeleteForMe,
  onDeleteForEveryone,
  onToggleStar,
  onTogglePin,
  onEditMessage,
  allUsersInApp,
  isAdmin,
  onScrollToMessage,
}: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [dailyGroups, setDailyGroups] = useState<DailyMessageGroup[]>([]);
  const { toast } = useToast();

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [avatarInView, setAvatarInView] = useState<User | null>(null);

  const handleOpenContextMenu = (e: React.MouseEvent | React.TouchEvent, message: Message) => {
    e.preventDefault();
    setSelectedMessage(message);
  };
  
  const handleCloseContextMenu = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  const handleEdit = () => {
    if (selectedMessage) {
        setEditingMessageId(selectedMessage.id);
        setSelectedMessage(null);
    }
  };

  const handleSaveEdit = (newContent: string) => {
    if (editingMessageId) {
        onEditMessage(editingMessageId, newContent);
        setEditingMessageId(null);
    }
  };

  useEffect(() => {
    const processMessages = () => {
        if (messages.length === 0) {
            setDailyGroups([]);
            return;
        }

        const groupedByDate: { [key: string]: Message[] } = {};

        messages.forEach(message => {
            const date = formatMessageDate(message.timestamp);
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(message);
        });

        const newDailyGroups: DailyMessageGroup[] = Object.keys(groupedByDate).map(date => {
            const dailyMessages = groupedByDate[date];
            const senderGroups: SenderMessageGroup[] = [];
            let currentSenderGroup: SenderMessageGroup | null = null;

            dailyMessages.forEach(message => {
                const sender = allUsersInApp.find(u => u.id === message.senderId);
                if (currentSenderGroup && currentSenderGroup.senderId === message.senderId) {
                    currentSenderGroup.messages.push(message);
                } else {
                    if (currentSenderGroup) {
                        senderGroups.push(currentSenderGroup);
                    }
                    currentSenderGroup = {
                        senderId: message.senderId,
                        sender,
                        messages: [message],
                        position: message.senderId === loggedInUser.uid ? 'right' : 'left',
                    };
                }
            });
            if (currentSenderGroup) {
                senderGroups.push(currentSenderGroup);
            }
            
            return { date, groups: senderGroups };
        });

        setDailyGroups(newDailyGroups);
    };

    processMessages();
  }, [messages, loggedInUser.uid, allUsersInApp]);


  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    };
    // Scroll to bottom on initial load and when new messages arrive
    scrollToBottom();

    // A slight delay might be needed for images to load before scrolling
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [dailyGroups, isTyping]);
  
  const contextProviderValue = { loggedInUser, allUsersInApp, otherUser, chat, isAdmin, onScrollToMessage };

  return (
    <ChatContext.Provider value={contextProviderValue}>
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
          <AnimatePresence>
            {avatarInView && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setAvatarInView(null)}
                >
                    <motion.div
                        layoutId={`avatar-${avatarInView.id}`}
                        className="relative w-full h-full max-w-[90vw] max-h-[90vh]"
                    >
                        <Image
                            src={avatarInView.avatar}
                            alt={avatarInView.name}
                            layout="fill"
                            objectFit="contain"
                        />
                    </motion.div>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={() => setAvatarInView(null)}>
                        <X />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
        {dailyGroups.map((dayGroup, dayIndex) => (
          <React.Fragment key={dayGroup.date}>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs font-medium text-muted-foreground uppercase">
                  {dayGroup.date}
                </span>
              </div>
            </div>

            {dayGroup.groups.map((senderGroup, senderIndex) => {
              const sender = allUsersInApp.find(u => u.id === senderGroup.senderId);
              const showSenderInfo = senderGroup.senderId !== loggedInUser.uid && chat.type !== 'private';
              
              return (
                <div key={`${dayGroup.date}-${senderIndex}`} className={cn('flex flex-col gap-1 w-full my-1', senderGroup.position === 'right' ? 'items-end' : 'items-start')}>
                  {showSenderInfo && (
                      <div className="flex items-center gap-2">
                          <motion.div layoutId={`avatar-${sender?.id}`} onClick={() => sender && setAvatarInView(sender)} className="cursor-pointer">
                            <Avatar className="w-8 h-8 self-end">
                                {sender ? (
                                    <>
                                        <AvatarImage src={sender.avatar} />
                                        <AvatarFallback>{sender.name.substring(0, 1)}</AvatarFallback>
                                    </>
                                ) : (
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                )}
                            </Avatar>
                          </motion.div>
                          <p 
                            className="text-xs font-semibold"
                            style={{ color: sender ? generateColorFromId(sender.id) : 'hsl(var(--foreground))' }}
                          >
                            {sender?.name || '...'}
                          </p>
                      </div>
                  )}
                  <div className={cn("flex flex-col space-y-1 w-full", senderGroup.position === 'right' ? 'items-end' : 'items-start')}>
                    {senderGroup.messages.map((message, msgIndex) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        position={senderGroup.position}
                        isFirstInGroup={msgIndex === 0}
                        isLastInGroup={msgIndex === senderGroup.messages.length - 1}
                        onOpenContextMenu={handleOpenContextMenu}
                        onReply={() => onReply(message)}
                        isEditing={editingMessageId === message.id}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={() => setEditingMessageId(null)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}

        {isTyping && otherUser && (
          <motion.div
            className="flex items-end gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>{otherUser.name.substring(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="bg-muted px-4 py-3 rounded-t-2xl rounded-br-2xl">
              <div className="flex items-center justify-center gap-1.5 h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-wave [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-wave [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-wave"></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

       <AnimatePresence>
            {selectedMessage && (
                <MessageFocusView
                    message={selectedMessage}
                    onClose={handleCloseContextMenu}
                    onReply={() => onReply(selectedMessage)}
                    onDeleteForMe={() => onDeleteForMe(selectedMessage.id)}
                    onDeleteForEveryone={() => onDeleteForEveryone(selectedMessage.id)}
                    onToggleStar={() => onToggleStar(selectedMessage.id, selectedMessage.starredBy?.includes(loggedInUser.uid) ?? false)}
                    onTogglePin={() => onTogglePin(selectedMessage, chat.pinnedMessages?.some(m => m.id === selectedMessage.id) ?? false)}
                    onEdit={handleEdit}
                    onShare={onShare}
                />
            )}
        </AnimatePresence>

    </ChatContext.Provider>
  );
}

    