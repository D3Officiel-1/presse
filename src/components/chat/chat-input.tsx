
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, X, Trash2, Smile, Image as ImageIcon, Camera, MapPin, User, FileText, Music, Vote, Calendar, Keyboard, Sprout, Pizza, ToyBrick, Dumbbell } from 'lucide-react';
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

const emojiCategories = [
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
  
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
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
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            if (!isCancelling) {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    onSendMessage(base64String, 'audio', { duration: recordingTime });
                };
                reader.readAsDataURL(audioBlob);
            }
            resetRecordingState();
        };

        mediaRecorder.start();
        setIsRecording(true);
        recordingIntervalRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (error) {
        console.error("Error starting recording:", error);
        // Handle permission denied error
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    // The onstop event will handle the rest
  };

  const resetRecordingState = () => {
    setIsRecording(false);
    setIsCancelling(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (message) return; // Don't record if there's text
    e.preventDefault();
    startRecording();
  };

  const handlePointerUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRecording || !cancelAreaRef.current) return;
    const cancelArea = cancelAreaRef.current.getBoundingClientRect();
    const isInCancelArea = e.clientX >= cancelArea.left && e.clientX <= cancelArea.right;

    if (isInCancelArea) {
      setIsCancelling(true);
    } else {
      setIsCancelling(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
      setMessage(prev => prev + emoji);
  }
  
  const toggleAttachmentMenu = () => {
      setIsEmojiMenuOpen(false);
      setIsAttachmentMenuOpen(prev => !prev);
  }

  const toggleEmojiMenu = () => {
      setIsAttachmentMenuOpen(false);
      setIsEmojiMenuOpen(prev => !prev);
  }

  const containerVariants = {
      closed: { height: 'auto' },
      attachments: { height: 320 },
      emojis: { height: 320 },
  };

  const currentVariant = isAttachmentMenuOpen ? 'attachments' : isEmojiMenuOpen ? 'emojis' : 'closed';

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
              key={currentVariant}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 h-full"
            >
              {isAttachmentMenuOpen ? (
                <div className="p-6 overflow-auto flex-1">
                    <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                        {attachmentActions.map((action, index) => (
                        <motion.div
                            key={action.label}
                            custom={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={(i) => ({
                                opacity: 1,
                                y: 0,
                                transition: { delay: i * 0.03 + 0.1 },
                            })}
                            className="flex flex-col items-center gap-2 text-center cursor-pointer group"
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-background group-hover:scale-110 transition-transform`}>
                                <action.icon className={`w-7 h-7 ${action.color}`} />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                        </motion.div>
                        ))}
                    </div>
                </div>
              ) : isEmojiMenuOpen ? (
                 <div className="flex flex-col flex-1 h-full">
                    <div className="flex items-end gap-1 p-2">
                         <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground rounded-full" onClick={toggleEmojiMenu}>
                           <Keyboard className="w-5 h-5" />
                        </Button>
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
                     <div className="px-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            {emojiCategories.map(category => (
                                <Button
                                    key={category.name}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setActiveEmojiCategory(category.name)}
                                    className={`h-10 w-10 text-muted-foreground relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-all ${activeEmojiCategory === category.name ? 'after:bg-primary text-primary' : 'after:bg-transparent'}`}
                                >
                                    <category.icon className="w-5 h-5" />
                                </Button>
                            ))}
                        </div>
                    </div>
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
                 </div>
              ) : (
                <div className="flex items-end gap-1 p-2">
                  <motion.div
                    key="trombone"
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                   >
                     <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={toggleAttachmentMenu}>
                        <Paperclip className="w-5 h-5" />
                     </Button>
                   </motion.div>
                  <TextareaAutosize
                    ref={input => input && !replyInfo && input.focus()}
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message"
                    maxRows={5}
                    className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2"
                  />
                   <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={toggleEmojiMenu}>
                      <Smile className="w-5 h-5" />
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
                              onPointerDown={handlePointerDown}
                              onPointerUp={handlePointerUp}
                              onPointerMove={handlePointerMove}
                              onPointerLeave={handlePointerUp} // Stop if pointer leaves button
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
            {(isAttachmentMenuOpen) && (
                <motion.div
                    className="absolute top-2 right-2 z-10"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                >
                    <Button
                        variant="ghost" size="icon"
                        className="h-10 w-10 shrink-0 text-muted-foreground rounded-full"
                        onClick={toggleAttachmentMenu}
                    >
                         <X className="w-5 h-5" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>

       {isRecording && (
        <motion.div
            key="recording-ui"
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex flex-col items-center gap-4 text-white">
                <Trash2 className={`w-10 h-10 transition-colors ${isCancelling ? 'text-destructive' : 'text-white'}`}/>
                <span ref={cancelAreaRef} className="text-sm">Glisser pour annuler</span>
                <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
            </div>
        </motion.div>
       )}
    </div>
  );
}
