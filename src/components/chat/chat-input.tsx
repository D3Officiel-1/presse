
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, X, Trash2, Smile, Image, Camera, MapPin, User, FileText, Music, Vote, Calendar } from 'lucide-react';
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
    { icon: Image, label: "Galerie", color: "text-purple-500" },
    { icon: Camera, label: "Caméra", color: "text-blue-500" },
    { icon: MapPin, label: "Localisation", color: "text-green-500" },
    { icon: User, label: "Membre", color: "text-orange-500" },
    { icon: FileText, label: "Document", color: "text-indigo-500" },
    { icon: Music, label: "Audio", color: "text-red-500" },
    { icon: Vote, label: "Sondage", color: "text-yellow-500" },
    { icon: Calendar, label: "Évènement", color: "text-teal-500" },
]

export function ChatInput({ chat, onSendMessage, replyInfo, onClearReply }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

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

  return (
    <div className="relative p-4 pt-2">
      <AnimatePresence>
        {replyInfo && !isAttachmentMenuOpen && (
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

      <div className="relative">
         <AnimatePresence mode="wait">
             {isAttachmentMenuOpen ? (
                <motion.div
                  key="attachment-wrapper"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute bottom-0 w-full"
                >
                    <div className="relative">
                      <motion.div
                          key="attachment-menu"
                          className="bg-card/70 backdrop-blur-lg border rounded-2xl p-6 shadow-xl"
                      >
                          <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                              {attachmentActions.map(action => (
                                  <div key={action.label} className="flex flex-col items-center gap-2 text-center cursor-pointer group">
                                      <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-background group-hover:scale-110 transition-transform`}>
                                          <action.icon className={`w-7 h-7 ${action.color}`} />
                                      </div>
                                      <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                                  </div>
                              ))}
                          </div>
                      </motion.div>
                      <motion.div
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: 20 }}
                          transition={{ delay: 0.1 }}
                          className="absolute left-1/2 -translate-x-1/2 -top-6"
                      >
                          <Button size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsAttachmentMenuOpen(false)}>
                              <X className="w-6 h-6" />
                          </Button>
                      </motion.div>
                    </div>
                </motion.div>
             ) : (
                <motion.div
                    key="chat-bar"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-full shadow-lg border"
                >
                    {isRecording ? (
                         <motion.div
                            key="recording-ui"
                            className="flex items-center justify-between w-full h-10 px-2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                         >
                            <div ref={cancelAreaRef} className="flex-shrink-0">
                                 <Trash2 className={`w-6 h-6 transition-colors ${isCancelling ? 'text-destructive' : 'text-muted-foreground'}`}/>
                            </div>
                            <div className="flex-1 flex items-center justify-center text-center text-sm font-mono text-muted-foreground gap-2">
                                 <span className="text-red-500">•</span>
                                 <span>Recording...</span>
                                 <span>{formatTime(recordingTime)}</span>
                            </div>
                            <div className="w-6"/>
                         </motion.div>
                    ) : (
                        <motion.div
                            key="text-ui"
                            className="flex items-center gap-1 w-full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => setIsAttachmentMenuOpen(true)}>
                                <Paperclip className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground">
                              <Smile className="w-5 h-5" />
                            </Button>
                            <TextareaAutosize
                              ref={input => input && !replyInfo && input.focus()}
                              value={message}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyDown}
                              placeholder="Message"
                              maxRows={5}
                              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground"
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
                        </motion.div>
                    )}
                </motion.div>
             )}
         </AnimatePresence>
      </div>
    </div>
  );
}
