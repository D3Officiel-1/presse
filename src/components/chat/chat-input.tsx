
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, X, Smile, Image as ImageIcon, Camera, MapPin, User, FileText, Music, Vote, Calendar, Keyboard, Sprout, Pizza, ToyBrick, Dumbbell, Film, FileImage, UserCircle, Clock, Search, Delete, ArrowUp, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReplyInfo } from './chat-messages';
import type { Chat as ChatType } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import TextareaAutosize from 'react-textarea-autosize';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const attachmentActions = [
    { icon: ImageIcon, label: "Galerie", color: "text-purple-500", action: 'openGallery' },
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
    { name: 'Personnes & Corps', icon: User, emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰', '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍🦲', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵'] },
    { name: 'Animaux & Nature', icon: Sprout, emojis: ['🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'] },
    { name: 'Nourriture & Boisson', icon: Pizza, emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺'] },
    { name: 'Activités', icon: Dumbbell, emojis: ['🤺', '🤸', '⛹️', '𤾾', '🧘', '🧗', '🏌️', '🏄', '🚣', '🏊', '🤽', '🚴', '🚵', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },
    { name: 'Objets', icon: ToyBrick, emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '✈️', '🛫', '🛬', '🛩️', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚀', '🛰️', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🌡️', '🎈', '🎉', '🎊', '🎀', '🎁', '🎂', '🎄', '🎃', '✨', '🎇', '🎆', '🧨', '🧧', '🎐', '🎏', '🎎', '🎑', '🏺', '🔮', '🧿', '📿', '💎', '💍', '💄', '💋', '💌', '❤️', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '🉑', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'] },
];

const allEmojis = emojiCategories.flatMap(category => category.emojis);

interface ChatInputProps {
  chat: ChatType;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio', metadata?: any) => void;
  replyInfo?: ReplyInfo;
  onClearReply: () => void;
}

const azertyLayout = {
    letters: [
        ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
        ['w', 'x', 'c', 'v', 'b', 'n']
    ],
    numbers: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['@', '#', '€', '_', '&', '-', '+', '(', ')', '/'],
        ['*', '"', ':', ';', '!', '?', "'", '.']
    ]
};

const CustomKeyboard = ({ onKeyPress, onBackspace, onEnter, onSpace, onEmojiToggle }: { onKeyPress: (key: string) => void, onBackspace: () => void, onEnter: () => void, onSpace: () => void, onEmojiToggle: () => void }) => {
    const [layout, setLayout] = useState<'letters' | 'numbers'>('letters');
    const [isShift, setIsShift] = useState(false);

    const handleKeyPress = (key: string) => {
        onKeyPress(isShift ? key.toUpperCase() : key);
        if (isShift) setIsShift(false);
    };

    const currentLayout = azertyLayout[layout];

    return (
        <div className="w-full bg-black/50 backdrop-blur-sm p-2 space-y-1">
            {currentLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                    {rowIndex === 2 && layout === 'letters' && (
                        <Button onClick={() => setIsShift(!isShift)} className={cn("h-10 w-12", isShift && 'bg-white text-black')}>
                            <ArrowUp />
                        </Button>
                    )}
                    {row.map(key => (
                        <Button key={key} onClick={() => handleKeyPress(key)} className="h-10 flex-1">
                            {isShift ? key.toUpperCase() : key}
                        </Button>
                    ))}
                    {rowIndex === 2 && layout === 'letters' && (
                         <>
                            <Button onClick={() => handleKeyPress("'")} className="h-10 w-12">'</Button>
                            <Button onClick={onBackspace} className="h-10 w-12">
                                <Delete />
                            </Button>
                        </>
                    )}
                     {rowIndex !== 2 && layout === 'numbers' && (
                         <Button onClick={onBackspace} className="h-10 w-12">
                            <Delete />
                        </Button>
                    )}
                     {rowIndex === 2 && layout === 'numbers' && (
                         <Button onClick={onBackspace} className="h-10 w-12">
                            <Delete />
                        </Button>
                     )}
                </div>
            ))}
            <div className="flex justify-center gap-1">
                <Button onClick={() => setLayout(layout === 'letters' ? 'numbers' : 'letters')} className="h-10 w-16">
                    {layout === 'letters' ? '?123' : 'ABC'}
                </Button>
                <Button onClick={onEmojiToggle} className="h-10 w-16">😊</Button>
                <Button onClick={onSpace} className="h-10 flex-1">
                    Espace
                </Button>
                <Button onClick={() => handleKeyPress('.')} className="h-10 w-12">.</Button>
                <Button onClick={onEnter} className="h-10 w-24">
                    <CornerDownLeft />
                </Button>
            </div>
        </div>
    );
};


export function ChatInput({ chat, onSendMessage, replyInfo, onClearReply }: ChatInputProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [view, setView] = useState<'closed' | 'attachments' | 'emoji' | 'keyboard'>('closed');
  const [activeMainTab, setActiveMainTab] = useState('emoji');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(emojiCategories[0].name);
  const [searchMode, setSearchMode] = useState(false);
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelAreaRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (value: string) => {
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
      handleInputChange(message + emoji);
  }

  const handleBackspace = () => {
    handleInputChange(Array.from(message).slice(0, -1).join(''));
  };
  
  const toggleView = (newView: 'attachments' | 'emoji' | 'keyboard') => {
      if (view === newView) {
          setView('closed');
      } else {
          setView(newView);
          setSearchMode(false);
          setEmojiSearchQuery('');
      }
  }

  const handleAttachmentAction = (action: string) => {
    if (action === 'openGallery') {
      fileInputRef.current?.click();
    }
    if (action === 'Audio') {
        router.push('/chat/music');
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      const mediaType = file.type.startsWith('video') ? 'video' : 'image';
      
      // Store in sessionStorage and navigate
      sessionStorage.setItem('media-to-edit', dataUrl);
      sessionStorage.setItem('media-type-to-edit', mediaType);
      router.push('/chat/editor');
    };
    reader.readAsDataURL(file);

    // Reset file input value to allow selecting the same file again
    e.target.value = '';
  };

  const containerVariants = {
      closed: { height: 'auto' },
      open: { height: 350 },
  };

  const currentVariant = view === 'closed' ? 'closed' : 'open';

  const searchResults = emojiSearchQuery 
    ? allEmojis.filter(emoji => emoji.includes(emojiSearchQuery))
    : [];

  const mainInputSection = (
    <AnimatePresence mode="wait">
        {view === 'closed' && (
            <motion.div
                key="input"
                exit={{ opacity: 0, y: 10 }}
            >
                <div className="flex items-end gap-1 p-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('attachments')}>
                    <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                        <TextareaAutosize
                        value={message}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Message"
                        maxRows={5}
                        className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2 py-2"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('emoji')}>
                    <Smile className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('keyboard')}>
                        <Keyboard className="w-5 h-5" />
                    </Button>
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
            </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <div className="relative p-4 pt-2">
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*"
        onChange={onFileSelect}
      />
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
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        className={cn(
            "relative bg-background/50 backdrop-blur-sm rounded-3xl shadow-lg border flex flex-col",
            replyInfo ? 'rounded-t-none' : ''
        )}
      >
        {mainInputSection}
        
        <AnimatePresence>
            {view === 'keyboard' && (
                <motion.div
                    key="keyboard"
                    className="w-full"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                >
                     <div className="p-2 border-b border-border/50">
                        <TextareaAutosize
                            value={message}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Écrivez votre message..."
                            maxRows={3}
                            className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2 py-2"
                            autoFocus
                        />
                    </div>
                    <CustomKeyboard 
                      onKeyPress={(key) => handleInputChange(message + key)}
                      onBackspace={handleBackspace}
                      onEnter={handleSend}
                      onSpace={() => handleInputChange(message + ' ')}
                      onEmojiToggle={() => {
                        setView('emoji');
                      }}
                    />
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

    