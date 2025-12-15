

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Copy,
  CornerUpLeft,
  Trash2,
  Star,
  Share2,
  Play,
  Pause,
  Link as LinkIcon,
  CheckCircle,
  MoreHorizontal,
  ChevronRight,
  Pin,
  MessageSquare,
  Check,
  CheckCheck,
} from 'lucide-react';
import { ChatMessageStatus } from './chat-message-status';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { ActionItem } from './action-focus-view';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';


const ReactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];


export interface ReplyInfo extends Message {}

interface ChatMessagesProps {
  messages: Message[];
  chatType: 'private' | 'group' | 'community';
  loggedInUser: any;
  otherUser: User;
  isTyping: boolean;
  chatMembers: User[];
  onReply: (message: ReplyInfo) => void;
  onShare: (message: Message, userIds: string[]) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onToggleStar: (messageId: string, isStarred: boolean) => void;
  allUsersInApp: User[];
}

interface MessageGroup {
  senderId: string;
  sender: User | undefined;
  messages: Message[];
  position: 'left' | 'right';
}

const AudioPlayer: React.FC<{ src: string; metadata?: { duration: number } }> = ({ src, metadata }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const timeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', timeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', timeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 w-48">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full bg-foreground/10 hover:bg-foreground/20"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1 bg-foreground/20 rounded-full">
            <div className="h-full bg-foreground/80 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="text-xs text-right opacity-70 font-mono">
            {formatTime(currentTime)} / {metadata?.duration ? formatTime(metadata.duration) : '0:00'}
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
  otherUser
}: {
  message: Message;
  position: 'left' | 'right';
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onOpenContextMenu: (e: React.MouseEvent | React.TouchEvent, message: Message) => void;
  otherUser: User | undefined;
}) => {
  const isOwn = position === 'right';
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      longPressTimer.current = setTimeout(() => {
        onOpenContextMenu(e, message);
      }, 500);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      clearTimeout(longPressTimer.current);
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
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onContextMenu={(e) => onOpenContextMenu(e, message)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={cn('group flex items-end gap-2 w-full', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div
        className={bubbleClasses}
      >
        {message.replyTo?.messageId && (
            <div className="border-l-2 border-primary/50 pl-2 text-xs opacity-80 mb-1.5">
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
            <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
            {isOwn && <ChatMessageStatus message={message} otherUser={otherUser} />}
        </div>
      </div>
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
}: {
    message: Message | null;
    onClose: () => void;
    onReply: () => void;
    onDeleteForMe: () => void;
    onDeleteForEveryone: () => void;
    onToggleStar: () => void;
}) => {
    const chatContext = React.useContext(ChatContext);
    const [viewMode, setViewMode] = React.useState<'main' | 'delete'>('main');

    if (!message) return null;
    
    const sender = chatContext.allUsersInApp.find((u: User) => u.id === message.senderId) || message.sender;
    const isOwnMessage = sender.id === chatContext.loggedInUser.uid;
    const isStarred = message.starredBy?.includes(chatContext.loggedInUser.uid) ?? false;
    
    const handleActionClick = (action: () => void, label: string) => {
        if (label === 'Supprimer') {
            setViewMode('delete');
        } else {
            action();
            onClose();
        }
    };
    
    const handleDelete = () => {
        onDeleteForMe(); // Or a more complex logic
        onClose();
    };

    const mainActions: ActionItem[] = [
        { label: 'Répondre', icon: CornerUpLeft, action: onReply },
        { label: 'Copier', icon: Copy, action: () => navigator.clipboard.writeText(message.content) },
        { label: 'Transférer', icon: Share2, action: () => {} },
        { label: isStarred ? 'Retirer de l\'important' : 'Marquer important', icon: Star, action: onToggleStar },
        { label: 'Supprimer', icon: Trash2, action: () => {}, className: 'text-destructive' },
    ];
    if (isOwnMessage) {
       mainActions.push({ label: 'Épingler', icon: Pin, action: () => {} });
    }

    return (
        <AnimatePresence>
             <motion.div
                className="fixed inset-0 z-50 flex flex-col items-center justify-end p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={onClose} />
                
                <motion.div 
                    className="relative flex flex-col items-center gap-2 w-full max-w-md"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                     <div className="bg-background/80 backdrop-blur-lg p-2 rounded-full flex items-center gap-2 shadow-lg border">
                        {ReactionEmojis.map(emoji => (
                            <motion.button 
                                key={emoji} 
                                className="text-2xl"
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </div>

                    <div className={cn("w-full flex", sender.id === chatContext.loggedInUser.uid ? 'justify-end' : 'justify-start')}>
                        <ChatMessage 
                            message={{...message, sender}} 
                            position={sender.id === chatContext.loggedInUser.uid ? 'right' : 'left'} 
                            onOpenContextMenu={() => {}} 
                            isFirstInGroup={true}
                            isLastInGroup={true}
                            otherUser={chatContext.otherUser}
                        />
                    </div>
                    
                    <div className="bg-background/80 backdrop-blur-lg w-full rounded-2xl shadow-lg border overflow-hidden">
                       <ul className="text-base">
                           {mainActions.map((item, index) => (
                               <React.Fragment key={item.label}>
                                   <li
                                     onClick={() => handleActionClick(item.action, item.label)}
                                     className={cn("flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50", item.className)}
                                   >
                                       <span>{item.label}</span>
                                       <item.icon className="w-5 h-5 text-muted-foreground" />
                                   </li>
                                   {index < mainActions.length -1 && <Separator className="bg-border/50" />}
                               </React.Fragment>
                           ))}
                       </ul>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

const ChatContext = React.createContext<any>({});

export function ChatMessages({
  messages,
  chatType,
  loggedInUser,
  otherUser,
  isTyping,
  chatMembers,
  onReply,
  onShare,
  onDeleteForMe,
  onDeleteForEveryone,
  onToggleStar,
  allUsersInApp
}: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [groupedMessages, setGroupedMessages] = useState<MessageGroup[]>([]);
  const { toast } = useToast();

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleOpenContextMenu = (e: React.MouseEvent | React.TouchEvent, message: Message) => {
    e.preventDefault();
    setSelectedMessage(message);
  };
  
  const handleCloseContextMenu = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  useEffect(() => {
    const groups: MessageGroup[] = [];
    if (messages.length > 0) {
        let currentGroup: MessageGroup | null = null;
        
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const sender = allUsersInApp.find(u => u.id === message.senderId);

            if (currentGroup && message.senderId === currentGroup.senderId) {
                currentGroup.messages.push(message);
            } else {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    senderId: message.senderId,
                    sender: sender, // Use the fetched user object
                    messages: [message],
                    position: message.senderId === loggedInUser.uid ? 'right' : 'left',
                };
            }
        }
        if (currentGroup) {
            groups.push(currentGroup);
        }
    }
    setGroupedMessages(groups);
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
  }, [groupedMessages, isTyping]);
  
  const contextProviderValue = { loggedInUser, allUsersInApp, otherUser };

  return (
    <ChatContext.Provider value={contextProviderValue}>
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
        {groupedMessages.map((group, index) => {
            const sender = allUsersInApp.find(u => u.id === group.senderId);
            const showSenderInfo = group.senderId !== loggedInUser.uid && chatType !== 'private';
          
            return (
              <div key={index} className={cn('flex flex-col gap-1 w-full my-1', group.senderId === loggedInUser.uid ? 'items-end' : 'items-start')}>
                {showSenderInfo && (
                    <div className="flex items-center gap-2">
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
                        <p className="text-xs text-muted-foreground">{sender?.name || '...'}</p>
                    </div>
                )}
                <div className={cn("flex flex-col space-y-1 w-full", group.senderId === loggedInUser.uid ? 'items-end' : 'items-start')}>
                  {group.messages.map((message, msgIndex) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      position={group.position}
                      isFirstInGroup={msgIndex === 0}
                      isLastInGroup={msgIndex === group.messages.length - 1}
                      onOpenContextMenu={handleOpenContextMenu}
                      otherUser={otherUser}
                    />
                  ))}
                </div>
              </div>
            )
        })}

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
                />
            )}
        </AnimatePresence>

    </ChatContext.Provider>
  );
}
