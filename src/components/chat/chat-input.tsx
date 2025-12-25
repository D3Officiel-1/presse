
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Mic, Send, X, Smile, Image as ImageIcon, Camera, MapPin, User, FileText, Music, Vote, Calendar, Keyboard, Sprout, Pizza, ToyBrick, Dumbbell, Film, FileImage, UserCircle, Clock, Search, Delete, ArrowUp, CornerDownLeft, Grip, StickyNote, Clipboard, Settings, Palette, Menu, Voicemail, Heart, Flag, Trash2, Check, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReplyInfo } from './chat-messages';
import type { Chat as ChatType, User as UserType, Message } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import TextareaAutosize from 'react-textarea-autosize';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';


const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const attachmentActions = [
    { icon: ImageIcon, label: "Galerie", color: "text-purple-500", action: 'openGallery' },
    { icon: Camera, label: "Caméra", color: "text-blue-500", action: 'openCamera' },
    { icon: MapPin, label: "Localisation", color: "text-green-500", action: 'shareLocation' },
    { icon: User, label: "Membre", color: "text-orange-500", action: 'ShareContact' },
    { icon: FileText, label: "Document", color: "text-indigo-500", action: 'openDocument' },
    { icon: Music, label: "Audio", color: "text-red-500", action: 'openAudioFile' },
    { icon: Vote, label: "Sondage", color: "text-yellow-500", action: 'createPoll' },
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
    { name: 'Activités', icon: Dumbbell, emojis: ['🤺', '🤸', '⛹️', '🤾', '🧘', '🧗', '🏌️', '🏄', '🚣', '🏊', '🤽', '🚴', '🚵', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },
    { name: 'Objets', icon: ToyBrick, emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '✈️', '🛫', '🛬', '🛩️', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚀', '🛰️', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🌡️', '🎈', '🎉', '🎊', '🎀', '🎁', '🎂', '🎄', '🎃', '✨', '🎇', '🎆', '🧨', '🧧', '🎐', '🎏', '🎎', '🎑', '🏺', '🔮', '🧿', '📿', '💎', '💍', '💄', '💋', '💌', '❤️', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '🉑', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'] },
    { name: 'Symboles', icon: Palette, emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '🉑', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗️', '❕', '❓', '❔', '‼️', '⁉️', '💯', '🔅', '🔆', '🔱', '⚜️', '〽️', '⚠️', '🚸', '🔰', '♻️', '🈯', '💹', '❇️', '✳️', '❎', '✅', '💠', '🌀', '➿', '🌐', 'ⓜ️', '🏧', '🈂️', '🛂', '🛃', '🛄', '🛅', '♿', '🚹', '🚺', '🚻', '🚼', '⚧', '🚮', '🎦', '📶', '🈁', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '#️⃣', '*️⃣', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '⬛', '⬜', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '🔶', '🔷', '🔸', '🔹', '🔳', '🔲', '▪️', '▫️', '▬', '▫️', '▪️'] },
    { name: 'Drapeaux', icon: Flag, emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇸🇿', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇰', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇸🇧', '🇸🇴', '🇿🇦', '🇬🇸', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇲🇫', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇯', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇳', '🇺🇸', '🇺🇾', '🇻🇮', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'] },
];

const allEmojis = emojiCategories.flatMap(category => category.emojis);

interface ChatInputProps {
  chat: ChatType;
  onSendMessage: (content: string, type?: Message['type'], metadata?: any) => void;
  replyInfo?: ReplyInfo;
  onClearReply: () => void;
}

export function ChatInput({ chat, onSendMessage, replyInfo, onClearReply }: ChatInputProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [view, setView] = useState<'closed' | 'attachments' | 'emoji' | 'share-contact' | 'create-poll'>('closed');
  const [activeMainTab, setActiveMainTab] = useState('emoji');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(emojiCategories[0].name);
  
  const [inputMode, setInputMode] = useState<'message' | 'emoji-search'>('message');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);


  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Contact sharing state
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (inputMode === 'message') {
        setMessage(value);
        if (!firestore || !currentUser || !chat) return;
        const typingRef = doc(firestore, 'chats', chat.id);
        if (value.length > 0) {
            updateDoc(typingRef, { [`typing.${currentUser.uid}`]: true });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                updateDoc(typingRef, { [`typing.${currentUser.uid}`]: false });
            }, 3000);
        } else {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            updateDoc(typingRef, { [`typing.${currentUser.uid}`]: false });
        }
    } else {
        setEmojiSearchQuery(value);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup all timers and refs
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      if (firestore && currentUser && chat) {
         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
         updateDoc(doc(firestore, 'chats', chat.id), { [`typing.${currentUser.uid}`]: false });
      }
    }
  };
  
    const resetRecordingState = () => {
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        audioChunksRef.current = [];
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };

    const startRecording = async () => {
        if (isRecording) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstart = () => {
                setIsRecording(true);
                setRecordingTime(0);
                recordingIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            };

            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                // The sending logic will be handled by a dedicated button now
            };
            
            mediaRecorder.start();

        } catch (error) {
            console.error("Error starting recording:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur d\'enregistrement',
                description: "Impossible d'accéder au microphone. Veuillez vérifier les permissions.",
            });
            resetRecordingState();
        }
    };

    const stopAndSendRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Audio = reader.result as string;
                    onSendMessage(base64Audio, 'audio', { duration: recordingTime });
                    resetRecordingState();
                };
                reader.readAsDataURL(audioBlob);
            }, { once: true });
            mediaRecorderRef.current.stop();
        } else {
           resetRecordingState(); // Reset if something went wrong
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
             mediaRecorderRef.current.addEventListener('stop', () => {
                resetRecordingState();
                toast({ description: "Enregistrement annulé." });
            }, { once: true });
            mediaRecorderRef.current.stop();
        } else {
             resetRecordingState();
        }
    };

  const handleEmojiClick = (emoji: string) => {
    if (inputMode === 'message') {
        setMessage(prev => prev + emoji);
    } else {
        // In search mode, clicking an emoji could copy it or insert it, then exit search.
        setMessage(prev => prev + emoji);
        setInputMode('message');
        setEmojiSearchQuery('');
    }
  }

  const handleBackspace = () => {
    if (inputMode === 'message') {
      setMessage(prev => Array.from(prev).slice(0, -1).join(''));
    } else {
      setEmojiSearchQuery(prev => Array.from(prev).slice(0, -1).join(''));
    }
  };
  
  const handleClearMessage = () => {
    if (inputMode === 'message') {
        setMessage('');
    } else {
        setEmojiSearchQuery('');
    }
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

  const toggleView = (newView: 'attachments' | 'emoji' | 'share-contact' | 'create-poll' | 'closed') => {
    if (view === newView) {
        setView('closed');
    } else {
        setView(newView);
        if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }
  };

  const handleAttachmentAction = (action?: string) => {
    if (action === 'openGallery') {
      fileInputRef.current?.click();
    }
    if (action === 'openCamera') {
        router.push('/chat/camera');
    }
    if (action === 'openDocument') {
      documentInputRef.current?.click();
    }
    if (action === 'openAudioFile') {
      audioInputRef.current?.click();
    }
    if (action === 'ShareContact') {
        toggleView('share-contact');
        fetchUsersForSharing();
    }
    if (action === 'shareLocation') {
        handleShareLocation();
    }
    if (action === 'createPoll') {
        toggleView('create-poll');
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
        toast({ variant: 'destructive', description: "La géolocalisation n'est pas supportée par votre navigateur."});
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            onSendMessage(`${latitude},${longitude}`, 'location');
            toggleView('closed');
            toast({ description: "Position partagée." });
        },
        () => {
            toast({ variant: 'destructive', description: "Impossible d'obtenir votre position. Vérifiez les autorisations."});
        }
    );
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      const mediaType = file.type.startsWith('video') ? 'video' : 'image';
      
      sessionStorage.setItem('media-to-edit', dataUrl);
      sessionStorage.setItem('media-type-to-edit', mediaType);
      router.push('/chat/editor');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setView('closed');
  };

  const onDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      onSendMessage(dataUrl, 'document', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      toggleView('closed');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        onSendMessage(dataUrl, 'audio', { duration: Math.round(audio.duration) });
        toggleView('closed');
      };
      reader.readAsDataURL(file);
    };
    e.target.value = '';
  };
  
  const handleStartEmojiSearch = () => {
      setView('closed');
      setInputMode('emoji-search');
      setEmojiSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
  }

  const handleCancelEmojiSearch = () => {
      setInputMode('message');
      setEmojiSearchQuery('');
  }

  const fetchUsersForSharing = () => {
    if (!firestore || !currentUser) return;
    setLoadingUsers(true);
    const usersQuery = query(collection(firestore, 'users'), where('__name__', '!=', currentUser.uid));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
        setAllUsers(usersList.sort((a,b) => a.name.localeCompare(b.name)));
        setLoadingUsers(false);
    }, (error) => {
        console.error("Error fetching users for contact sharing:", error);
        setLoadingUsers(false);
    });
    return unsubscribe;
  };
  
  const handleSendContact = (user: UserType) => {
    onSendMessage(user.id, 'contact', { contactData: user });
    toggleView('closed');
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handleSendPoll = () => {
    if (!pollQuestion.trim()) {
      toast({ variant: 'destructive', description: "La question du sondage ne peut pas être vide." });
      return;
    }
    const filledOptions = pollOptions.map(o => o.trim()).filter(o => o !== '');
    if (filledOptions.length < 2) {
      toast({ variant: 'destructive', description: "Un sondage doit avoir au moins deux options." });
      return;
    }
    
    const pollData = {
      question: pollQuestion.trim(),
      options: filledOptions.map(opt => ({ text: opt, votes: [] })),
    };

    onSendMessage('', 'poll', { pollData });

    // Reset state and close view
    setPollQuestion('');
    setPollOptions(['', '']);
    setView('closed');
  };

  const searchResults = emojiSearchQuery 
    ? allEmojis.filter(emoji => emoji.includes(emojiSearchQuery))
    : [];

    const RecordingUI = () => (
      <React.Fragment>
        <Button variant="ghost" size="icon" onClick={cancelRecording} className="text-destructive h-12 w-12 rounded-full">
            <Trash2 size={24}/>
        </Button>

        <div className="flex flex-col items-center gap-2">
            <div className="font-mono text-lg">{formatTime(recordingTime)}</div>
            <div className="flex items-center gap-1 text-red-500">
                <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse [animation-delay:-0.3s]"></div>
                <span>Enregistrement...</span>
            </div>
        </div>
        
         <Button size="icon" onClick={stopAndSendRecording} className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white">
            <Check size={24} />
         </Button>
      </React.Fragment>
    );

    const mainInputSection = (
      <div className="flex items-end gap-1 p-2">
        {inputMode === 'emoji-search' ? (
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={handleCancelEmojiSearch}>
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('attachments')}>
            <Paperclip className="w-5 h-5" />
          </Button>
        )}

        <div className="flex-1 relative">
          <TextareaAutosize
            ref={inputRef}
            value={inputMode === 'message' ? message : emojiSearchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputMode === 'message') setView('closed');
            }}
            placeholder={inputMode === 'message' ? 'Message' : 'Rechercher un emoji...'}
            maxRows={5}
            minRows={1}
            className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground px-2 py-2"
          />
        </div>
        
        {inputMode === 'message' && (
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground" onClick={() => toggleView('emoji')}>
            <Smile className="w-5 h-5" />
          </Button>
        )}
      
        <div className="relative h-10 w-10 shrink-0">
          <AnimatePresence>
            {message && inputMode === 'message' && !isRecording ? (
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
            ) : inputMode === 'message' ? (
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
                  onClick={startRecording}
                  className="h-10 w-10 rounded-full text-muted-foreground"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
  );

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className='relative'>
      <AnimatePresence>
          {inputMode === 'emoji-search' && emojiSearchQuery && (
              <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 p-2"
              >
                  <div className="bg-background/80 backdrop-blur-lg rounded-xl shadow-lg border p-2">
                       <div className="grid grid-cols-8 gap-1 max-h-[150px] overflow-y-auto">
                          {searchResults.slice(0, 40).map((emoji, i) => (
                              <Button key={i} variant="ghost" size="icon" className="text-2xl" onClick={() => handleEmojiClick(emoji)}>
                                  {emoji}
                              </Button>
                          ))}
                      </div>
                      {searchResults.length === 0 && <p className="text-center text-sm text-muted-foreground p-4">Aucun emoji trouvé.</p>}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
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
              "relative bg-background/50 backdrop-blur-sm shadow-lg border flex flex-col transition-[border-radius]",
              replyInfo ? 'rounded-t-none' : '',
              view === 'closed' && (replyInfo ? 'rounded-b-3xl' : 'rounded-3xl'),
              view !== 'closed' && 'rounded-t-3xl'
          )}
      >
        <AnimatePresence mode="wait">
            {isRecording ? (
                <motion.div 
                    key="recording"
                    className="flex-1 flex items-center justify-between px-2 h-[56px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <RecordingUI />
                </motion.div>
            ) : (
                <motion.div key="input" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                    {mainInputSection}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileSelect}
        accept="image/*,video/*"
      />

      <input
        type="file"
        ref={documentInputRef}
        className="hidden"
        onChange={onDocumentFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
      />

      <input
        type="file"
        ref={audioInputRef}
        className="hidden"
        onChange={onAudioFileSelect}
        accept="audio/*"
      />
        
        <AnimatePresence>
            {(view !== 'closed') && (
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
                                  <div key={item.label} className="flex flex-col items-center gap-2" onClick={() => handleAttachmentAction(item.action)}>
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
                               <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleStartEmojiSearch}>
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
                           
                           <div className="flex items-center gap-1 p-2 border-b overflow-x-auto no-scrollbar">
                               {emojiCategories.map(cat => (
                                   <Button key={cat.name} variant={activeEmojiCategory === cat.name ? 'default' : 'ghost'} size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={() => setActiveEmojiCategory(cat.name)}>
                                       <cat.icon className="w-5 h-5"/>
                                   </Button>
                               ))}
                           </div>
                           
                           <div className="flex-1 overflow-y-auto p-2">
                                <div className="grid grid-cols-8 gap-1">
                                    {(emojiCategories.find(c => c.name === activeEmojiCategory)?.emojis || []).map((emoji, i) => (
                                        <Button key={i} variant="ghost" size="icon" className="text-2xl" onClick={() => handleEmojiClick(emoji)}>
                                            {emoji}
                                        </Button>
                                    ))}
                                </div>
                           </div>
                       </div>
                    )}
                    {view === 'share-contact' && (
                        <div className='h-[350px] flex flex-col'>
                            <div className="flex items-center p-2 border-b">
                                <Button variant="ghost" size="icon" onClick={() => toggleView('closed')}><ArrowLeft className="w-5 h-5"/></Button>
                                <div className='flex-1 text-center font-semibold'>Partager un contact</div>
                                <div className="w-9"></div>
                            </div>
                            <div className="p-2">
                                <Input placeholder="Rechercher un membre..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                            </div>
                            <ScrollArea className="flex-1">
                                {loadingUsers ? (
                                    <div className="p-4 space-y-4">
                                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {filteredUsers.map(user => (
                                            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleSendContact(user)}>
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                    {view === 'create-poll' && (
                        <div className='h-auto flex flex-col'>
                            <div className="flex items-center p-2 border-b">
                                <Button variant="ghost" size="icon" onClick={() => toggleView('closed')}><ArrowLeft className="w-5 h-5"/></Button>
                                <div className='flex-1 text-center font-semibold'>Créer un sondage</div>
                                <div className="w-9"></div>
                            </div>
                            <div className="p-4 space-y-4">
                                <TextareaAutosize
                                    value={pollQuestion}
                                    onChange={(e) => setPollQuestion(e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="w-full text-lg resize-none bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground px-2 py-2"
                                />
                                <div className="space-y-2">
                                    {pollOptions.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={option}
                                                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            {pollOptions.length > 2 && (
                                                <Button variant="ghost" size="icon" onClick={() => removePollOption(index)}>
                                                    <X className="w-4 h-4 text-destructive"/>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" onClick={addPollOption} className="w-full">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Ajouter une option
                                </Button>
                            </div>
                             <div className="p-4 border-t">
                                <Button onClick={handleSendPoll} className="w-full">Envoyer le sondage</Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
