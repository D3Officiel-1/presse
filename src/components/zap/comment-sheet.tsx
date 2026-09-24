'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Video } from '@/app/zap/page';

interface CommentSheetProps {
  video: Video;
  comments: any[];
  onClose: () => void;
  onAddComment: (text: string) => void;
}

export function CommentSheet({ video, comments, onClose, onAddComment }: CommentSheetProps) {
  const [newCommentInput, setNewCommentInput] = useState('');

  const submitComment = () => {
    if (!newCommentInput.trim()) return;
    onAddComment(newCommentInput.trim());
    setNewCommentInput('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Commentaires créatifs ({video.comments})
        </span>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-xl bg-white/5 text-white/70 active:scale-95 transition-transform outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 items-start text-xs text-neutral-200">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary border border-primary/20 font-black uppercase flex items-center justify-center shrink-0 select-none">
              {comment.user.substring(0, 2)}
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-white">@{comment.user}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{comment.time}</span>
              </div>
              <p className="font-medium text-neutral-300 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <p className="text-[11px] font-bold uppercase tracking-widest">Aucun commentaire</p>
            <p className="text-[10px]">Soyez le premier à inspirer !</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5 bg-neutral-900/60 flex gap-2 items-center pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <Input
          placeholder="Ajouter un commentaire..."
          value={newCommentInput}
          onChange={(e) => setNewCommentInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          className="flex-1 h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-500 text-sm focus-visible:ring-primary/40"
        />
        <Button 
          onClick={submitComment} 
          disabled={!newCommentInput.trim()} 
          size="icon" 
          className="rounded-xl h-11 w-11 bg-primary active:scale-90 transition-transform outline-none"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
