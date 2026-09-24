'use client';

import React, { useState } from 'react';
import { Search, MessageCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateSmartReplySuggestions } from '@/ai/flows/smart-reply-suggestions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const { toast } = useToast();
  const [chatSearch, setChatSearch] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [chats, setChats] = useState([
    { id: 'c-1', name: 'Yannick Koffi', user: 'yannick_vfx', lastMsg: 'Tu as vu mon dernier rendu VFX ?', online: true, avatarSeed: 'yannick', messages: [{ sender: 'them', text: 'Tu as vu mon dernier rendu VFX ?' }] },
    { id: 'c-2', name: 'Aminata Diop', user: 'amina_diop', lastMsg: 'On se capte au studio demain à 14h.', online: false, avatarSeed: 'amina', messages: [{ sender: 'them', text: 'On se capte au studio demain à 14h.' }] },
    { id: 'c-3', name: 'Marc-Aurèle Yao', user: 'marc_dance', lastMsg: 'Le remix audio est prêt !', online: true, avatarSeed: 'marc', messages: [{ sender: 'them', text: 'Le remix audio est prêt !' }] }
  ]);

  const handleRequestAiReplies = async (messageContent: string) => {
    setGeneratingAi(true);
    try {
      const result = await generateSmartReplySuggestions({ messageContent });
      setAiSuggestions(result.suggestions || []);
    } catch (error) {
      setAiSuggestions(["Top !", "Super projet !", "Hâte de voir ça 🔥"]);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !activeChatId) return;
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMsg: typedMessage.trim(), messages: [...c.messages, { sender: 'me', text: typedMessage.trim() }] } : c));
    setTypedMessage('');
    setAiSuggestions([]);
    toast({ title: 'Message envoyé' });
  };

  const currentChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto text-neutral-900 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] pt-6 bg-[#F9F9FC] min-h-screen">
      {!activeChatId ? (
        <>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-neutral-950">Messages</h2>
            <p className="text-xs text-neutral-500 font-medium">Collaborez avec d'autres élèves.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Rechercher..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="pl-9 h-11 bg-white border-neutral-200 rounded-2xl text-base"
            />
          </div>
          <div className="space-y-2.5">
            {chats.filter(c => c.name.toLowerCase().includes(chatSearch.toLowerCase())).map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => { setActiveChatId(chat.id); handleRequestAiReplies(chat.lastMsg); }}
                className="p-3.5 bg-white border border-neutral-200 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200">
                    <img src={`https://picsum.photos/seed/${chat.avatarSeed}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                    {chat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-neutral-950">@{chat.user}</h4>
                    <p className="text-xs text-neutral-500 truncate max-w-[200px] font-medium">{chat.lastMsg}</p>
                  </div>
                </div>
                <MessageCircle className="w-5 h-5 text-neutral-400" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-[75dvh] bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => setActiveChatId(null)} className="rounded-xl">
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </Button>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200">
              <img src={`https://picsum.photos/seed/${currentChat?.avatarSeed}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-black text-sm text-neutral-950">{currentChat?.name}</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50">
            {currentChat?.messages.map((msg, idx) => (
              <div key={idx} className={cn("flex w-full", msg.sender === 'me' ? "justify-end" : "justify-start")}>
                <div className={cn("p-3 rounded-2xl text-xs max-w-[80%] font-medium shadow-sm", msg.sender === 'me' ? "bg-neutral-900 text-white rounded-tr-none" : "bg-white text-neutral-900 rounded-tl-none")}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 bg-purple-50/60 border-t border-purple-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-purple-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600 fill-purple-600" /> Suggestions IA
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {generatingAi ? <span className="text-xs text-neutral-400 italic">Analyse...</span> : aiSuggestions.map((sug, idx) => (
                <button key={idx} onClick={() => setTypedMessage(sug)} className="p-2 bg-white border border-purple-200 text-purple-900 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-sm">
                  {sug}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-neutral-100 bg-white flex gap-2 items-center">
            <Input placeholder="Message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="flex-1 h-11 rounded-xl text-base" />
            <Button size="icon" onClick={handleSendMessage} className="rounded-xl h-11 w-11 bg-neutral-950 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
