
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, X, Smile, Image as ImageIcon, Camera, MapPin, User, FileText, Music, Vote, Calendar, Keyboard, Sprout, Pizza, ToyBrick, Dumbbell, Film, FileImage, UserCircle, Clock, Search, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReplyInfo } from './chat-messages';
import type { Chat as ChatType } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps {
  chat: ChatType;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio', metadata?: any) => void;
  replyInfo: ReplyInfo | undefined;
  onClearReply: () => void;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const attachmentActions = [
    { icon: ImageIcon, label: "Galerie", color: "text-purple-500" },
    { icon: Camera, label: "Caméra", color: "text-blue-500" },
    { icon: MapPin, label: "Localisation", color: "text-green-500" },
    { icon: User, label: "Membre", color: "text-orange-500" },
    { icon: FileText, label: "Document", color: "text-indigo-500" },
    { icon: Music, label: "Audio", color: "text-red-500" },
    { icon: Vote, label: "Sondage", color: "text-yellow-500" },
    { icon: Calendar, label: "Évènement", color: "text-teal-500" },
];

const mainTabs = [
    { name: 'emoji', icon: Smile },
    { name: 'gif', icon: Film },
    { name: 'avatar', icon: UserCircle },
    { name: 'sticker', icon: FileImage },
]

const emojiCategories = [
    { name: 'Récents', icon: Clock, emojis: ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '😊', '🤔', '🤣', '😎'] },
    { name: 'Smileys & Émotion', icon: Smile, emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'] },
    { name: 'Personnes & Corps', icon: User, emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰', '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍🦲', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵'] },
    { name: 'Animaux & Nature', icon: Sprout, emojis: ['🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'] },
    { name: 'Nourriture & Boisson', icon: Pizza, emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺'] },
    { name: 'Activités', icon: Dumbbell, emojis: ['🤺', '🤸', '⛹️', '🤾', '🧘', '🧗', '🏌️', '🏄', '🚣', '🏊', '🤽', '🚴', '🚵', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },
    { name: 'Objets', icon: ToyBrick, emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '✈️', '🛫', '🛬', '🛩️', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚀', '🛰️', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🌡️', '🎈', '🎉', '🎊', '🎀', '🎁', '🎂', '🎄', '🎃', '✨', '🎇', '🎆', '🧨', '🧧', '🎐', '🎏', '🎎', '🎑', '🏺', '🔮', '🧿', '📿', '💎', '💍', '💄', '💋', '💌', '❤️', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '🉑', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'] },
];

export function ChatInput({ chat, onSendMessage, replyInfo, onClearReply }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [view, setView] = useState<'closed' | 'attachments' | 'emoji'>('closed');
  const [activeMainTab, setActiveMainTab] = useState('emoji');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(emojiCategories[0].name);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelAreaRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!firestore || !currentUser || !chat) return;

    const typingRef = doc(firestore, 'chats', chat.id);

    // Set user as typing
    if (value.length > 0) {
      updateDoc(typingRef, { [`typing.${currentUser.uid}`]: true });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set a new timeout to mark as not typing
      typingTimeoutRef.current = setTimeout(() => {
        updateDoc(typingRef, { [`typing.${currentUser.uid}`]: false });
      }, 3000); // 3 seconds of inactivity
    } else {
      // Immediately mark as not typing if input is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      updateDoc(typingRef, { [`typing.${currentUser.uid}`]: false });
    }
  };

  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');

      // Clear typing status on send
       if (firestore && currentUser && chat) {
         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
         updateDoc(doc(firestore, 'chats', chat.id), { [`typing.${currentUser.uid}`]: false });
       }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Voice Recording Handlers ---
  const startRecording = async () => {
    // Implement recording logic
  };

  const stopRecording = () => {
    // Implement stop recording logic
  };

  const resetRecordingState = () => {
    // Implement reset logic
  };
  
  const handlePointerDown = (e: React.PointerEvent) => {
    // Implement pointer down logic
  };

  const handlePointerUp = () => {
    // Implement pointer up logic
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Implement pointer move logic
  };

  const handleEmojiClick = (emoji: string) => {
      setMessage(prev => prev + emoji);
  }
  
  const toggleView = (newView: 'attachments' | 'emoji') => {
      if (view === newView) {
          setView('closed');
      } else {
          setView(newView);
      }
  }

  const containerVariants = {
      closed: { height: 'auto' },
      open: { height: 350 },
  };

  const currentVariant = view === 'closed' ? 'closed' : 'open';

  return (
    <div className="relative p-4 pt-2">
      <AnimatePresence>
        {replyInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/50 backdrop-blur-sm p-3 rounded-t-xl border-b border-border/50 mb-[-1px] overflow-hidden"
          >
            <div className="flex items-center justify-between border-l-2 border-primary pl-2">
              <div>
                <p className="font-bold text-sm text-primary">{replyInfo.sender.name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-xs">{replyInfo.content}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearReply}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        variants={containerVariants}
        initial="closed"
        animate={currentVariant}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        className="relative bg-background/50 backdrop-blur-sm rounded-3xl shadow-lg border flex flex-col"
      >
        <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 h-full"
            >
              {view === 'closed' ? (
                <div className="flex items-end gap-1 p-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('attachments')}>
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('emoji')}>
                      <Smile className="w-5 h-5" />
                  </Button>
                  <TextareaAutosize
                    ref={input => input && !replyInfo && input.focus()}
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message"
                    maxRows={5}
                    className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2"
                  />
                  <div className="relative h-10 w-10 shrink-0">
                    <AnimatePresence>
                      {message ? (
                        <motion.div
                          key="send"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          className="absolute inset-0"
                        >
                          <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground" onClick={handleSend}>
                            <Send className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="mic"
                          initial={{ scale: 0, rotate: 90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: -90 }}
                          className="absolute inset-0"
                        >
                          <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 rounded-full text-muted-foreground"
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : view === 'attachments' ? (
                 <div className="flex-1 p-4 grid grid-cols-4 gap-4 items-center justify-center">
                    {attachmentActions.map(action => (
                      <div key={action.label} className="flex flex-col items-center gap-2 text-center cursor-pointer">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-background`}>
                              <action.icon className={`w-6 h-6 ${action.color}`} />
                          </div>
                          <span className="text-xs text-muted-foreground">{action.label}</span>
                      </div>
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col flex-1 h-full">
                    <div className="flex items-end gap-1 p-2">
                        <AnimatePresence>
                          {!message && (
                            <motion.div
                                key="keyboard-button"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground rounded-full" onClick={() => setView('closed')}>
                                   <Keyboard className="w-5 h-5" />
                                </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <TextareaAutosize
                            value={message}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Message"
                            maxRows={2}
                            className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2"
                        />
                        <div className="relative h-10 w-10 shrink-0">
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        key="send-emoji"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute inset-0"
                                    >
                                        <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground" onClick={handleSend}>
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    <div className="px-3 py-2 flex justify-center border-y border-border/50">
                        <div className="inline-flex items-center justify-between w-full bg-black/20 p-1 rounded-full border border-white/10">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Search className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {mainTabs.map(tab => (
                                    <Button
                                        key={tab.name}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveMainTab(tab.name)}
                                        className={`h-8 px-4 rounded-full relative transition-colors duration-300 ${activeMainTab === tab.name ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                    </Button>
                                ))}
                            </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Delete className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {activeMainTab === 'emoji' && (
                        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
                           <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1">
                                {emojiCategories.find(c => c.name === activeEmojiCategory)?.emojis.map((emoji) => (
                                    <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="icon"
                                        className="w-full h-10 text-2xl"
                                        onClick={() => handleEmojiClick(emoji)}
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeMainTab === 'emoji' && (
                        <div className="px-3 py-1 border-t border-border/50">
                            <div className="flex items-center justify-around gap-2">
                                {emojiCategories.map(category => (
                                    <Button
                                        key={category.name}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setActiveEmojiCategory(category.name)}
                                        className={`h-10 w-10 rounded-full ${activeEmojiCategory === category.name ? 'bg-muted' : ''}`}
                                    >
                                        <category.icon className="w-5 h-5 text-muted-foreground" />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
              )}
            </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
            {(view !== 'closed') && (
                <motion.div
                    className="absolute top-2 right-2 z-10"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                >
                    <Button
                        variant="ghost" size="icon"
                        className="h-10 w-10 shrink-0 text-muted-foreground rounded-full"
                        onClick={() => setView('closed')}
                    >
                         <X className="w-5 h-5" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
