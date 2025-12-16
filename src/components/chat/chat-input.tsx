
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, X, Smile, Image as ImageIcon, Camera, MapPin, User, FileText, Music, Vote, Calendar, Keyboard, Sprout, Pizza, ToyBrick, Dumbbell, Film, FileImage, UserCircle, Clock, Search, Delete, ArrowUp, CornerDownLeft, Grip, StickyNote, Clipboard, Settings, Palette, Menu, Voicemail, Heart, Flag } from 'lucide-react';
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
    { icon: Music, label: "Audio", color: "text-red-500", action: 'Audio' },
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
    { name: 'Personnes & Corps', icon: User, emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰', '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴', '👵'] },
    { name: 'Animaux & Nature', icon: Sprout, emojis: ['🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'] },
    { name: 'Nourriture & Boisson', icon: Pizza, emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺'] },
    { name: 'Activités', icon: Dumbbell, emojis: ['🤺', '🤸', '⛹️', '𤾾', '🧘', '🧗', '🏌️', '🏄', '🚣', '🏊', '🤽', '🚴', '🚵', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },
    { name: 'Objets', icon: ToyBrick, emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '✈️', '🛫', '🛬', '🛩️', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚀', '🛰️', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🌡️', '🎈', '🎉', '🎊', '🎀', '🎁', '🎂', '🎄', '🎃', '✨', '🎇', '🎆', '🧨', '🧧', '🎐', '🎏', '🎎', '🎑', '🏺', '🔮', '🧿', '📿', '💎', '💍', '💄', '💋', '💌', '❤️', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '🉑', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'] },
    { name: 'Symboles', icon: Palette, emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '🉑', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗️', '❕', '❓', '❔', '‼️', '⁉️', '💯', '🔅', '🔆', '🔱', '⚜️', '〽️', '⚠️', '🚸', '🔰', '♻️', '🈯', '💹', '❇️', '✳️', '❎', '✅', '💠', '🌀', '➿', '🌐', 'ⓜ️', '🏧', '🈂️', '🛂', '🛃', '🛄', '🛅', '♿', '🚹', '🚺', '🚻', '🚼', '⚧', '🚮', '🎦', '📶', '🈁', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '#️⃣', '*️⃣', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '⬛', '⬜', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '🔶', '🔷', '🔸', '🔹', '🔳', '🔲', '▪️', '▫️', '▬', '▫️', '▪️'] },
    { name: 'Drapeaux', icon: Flag, emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇸🇿', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇰', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇸🇧', '🇸🇴', '🇿🇦', '🇬🇸', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇲🇫', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇯', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇳', '🇺🇸', '🇺🇾', '🇻🇮', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'] },
];

const allEmojis = emojiCategories.flatMap(category => category.emojis);

interface ChatInputProps {
  chat: ChatType;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio', metadata?: any) => void;
  replyInfo?: ReplyInfo;
  onClearReply: () => void;
}

export function ChatInput({ chat, onSendMessage, replyInfo, onClearReply }: ChatInputProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [view, setView] = useState<'closed' | 'attachments' | 'emoji'>('closed');
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
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
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
      setMessage(prev => prev + emoji);
  }

  const handleBackspace = () => {
    setMessage(prev => Array.from(prev).slice(0, -1).join(''));
  };
  
  const handleClearMessage = () => {
    setMessage('');
  };
  
  const handlePointerDownBackspace = () => {
      longPressTimerRef.current = setTimeout(() => {
          handleClearMessage();
      }, 700);
  };
  
  const handlePointerUpBackspace = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }
  };


  const toggleView = (newView: 'attachments' | 'emoji') => {
    if (view === newView) {
        setView('closed');
    } else {
        setView(newView);
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
  };

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

  const searchResults = emojiSearchQuery 
    ? allEmojis.filter(emoji => emoji.includes(emojiSearchQuery))
    : [];

  const mainInputSection = (
      <div className="flex items-end gap-1 p-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('attachments')}>
          <Paperclip className="w-5 h-5" />
        </Button>
        <div className="flex-1 relative">
           <TextareaAutosize
            value={message}
            onChange={handleInputChange}
            onFocus={() => setView('closed')}
            placeholder="Message"
            maxRows={5}
            className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2 py-2"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('emoji')}>
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
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );

  return (
    <div>
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

      
      <div
          className={cn(
              "relative bg-background/50 backdrop-blur-sm shadow-lg border flex flex-col",
              replyInfo ? 'rounded-t-none' : '',
              view === 'closed' && (replyInfo ? 'rounded-b-3xl' : 'rounded-3xl'),
              view !== 'closed' && 'rounded-t-3xl'
          )}
      >
        {mainInputSection}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileSelect}
        accept="image/*,video/*"
      />
        
        <AnimatePresence>
            {(view === 'attachments' || view === 'emoji') && (
                 <motion.div
                    key={view}
                    className="w-full bg-background/80 backdrop-blur-sm"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                >
                    {view === 'attachments' && (
                        <div className="p-4 pt-2">
                          <div className="flex flex-wrap items-center justify-center gap-4">
                              {attachmentActions.map(item => (
                                  <div key={item.label} className="flex flex-col items-center gap-2" onClick={() => handleAttachmentAction(item.action || item.label)}>
                                      <Button variant="ghost" size="icon" className={cn("h-14 w-14 rounded-full", item.color.replace('text-', 'bg-') + '/20', item.color)}>
                                          <item.icon className="w-6 h-6" />
                                      </Button>
                                      <span className="text-xs text-muted-foreground">{item.label}</span>
                                  </div>
                              ))}
                          </div>
                        </div>
                    )}
                    {view === 'emoji' && (
                       <div className="h-[300px] flex flex-col">
                           <div className="flex items-center justify-between p-2 border-b">
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchMode(!searchMode)}>
                                   <Search className="w-5 h-5"/>
                                </Button>
                               <div className="flex-1 flex justify-center">
                                   <div className="flex gap-1 bg-black/20 p-1 rounded-full border">
                                       {mainTabs.map(tab => (
                                           <Button key={tab.name} variant={activeMainTab === tab.name ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-full" onClick={() => setActiveMainTab(tab.name)}>
                                               <tab.icon className="w-5 h-5"/>
                                           </Button>
                                       ))}
                                   </div>
                               </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={handleBackspace}
                                    onPointerDown={handlePointerDownBackspace}
                                    onPointerUp={handlePointerUpBackspace}
                                    onPointerLeave={handlePointerUpBackspace}
                                >
                                    <Delete className="w-5 h-5"/>
                                </Button>
                           </div>
                           {searchMode ? (
                               <div className="p-2">
                                   <Input 
                                       placeholder="Rechercher des émojis..."
                                       value={emojiSearchQuery}
                                       onChange={(e) => setEmojiSearchQuery(e.target.value)}
                                       autoFocus
                                   />
                               </div>
                           ) : (
                               <div className="flex items-center gap-1 p-2 border-b overflow-x-auto no-scrollbar">
                                   {emojiCategories.map(cat => (
                                       <Button key={cat.name} variant={activeEmojiCategory === cat.name ? 'default' : 'ghost'} size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={() => setActiveEmojiCategory(cat.name)}>
                                           <cat.icon className="w-5 h-5"/>
                                       </Button>
                                   ))}
                               </div>
                           )}
                           <div className="flex-1 overflow-y-auto p-2">
                                <div className="grid grid-cols-8 gap-1">
                                    {(searchMode ? searchResults : emojiCategories.find(c => c.name === activeEmojiCategory)?.emojis || []).map((emoji, i) => (
                                        <Button key={i} variant="ghost" size="icon" className="text-2xl" onClick={() => handleEmojiClick(emoji)}>
                                            {emoji}
                                        </Button>
                                    ))}
                                </div>
                           </div>
                       </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
