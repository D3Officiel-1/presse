'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Edit2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Video } from '@/app/zap/page';

interface Comment {
  id: string | number;
  user: string;
  text: string;
  time: string;
}

interface CommentSheetProps {
  video: Video;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
  onEditComment?: (id: string | number, newText: string) => void;
  onDeleteComment?: (id: string | number) => void;
}

export function CommentSheet({
  video,
  comments,
  onClose,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: CommentSheetProps) {
  const [newCommentInput, setNewCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgressive, setLoadingProgressive] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingText, setEditingText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<string>('');

  const CHAR_LIMIT = 500;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingProgressive(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateViewport = () => {
      const keyboardOffset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop
      );
      document.documentElement.style.setProperty(
        '--keyboard-offset',
        `${keyboardOffset}px`
      );
    };

    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);

    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
      document.documentElement.style.removeProperty('--keyboard-offset');
    };
  }, []);

  const triggerRetry = () => {
    setNetworkError(false);
    setLoadingProgressive(true);
    setTimeout(() => {
      setLoadingProgressive(false);
    }, 600);
  };

  const submitComment = useCallback(() => {
    const text = newCommentInput.trim();
    if (!text || isSubmitting) return;

    if (text === lastSentRef.current) {
      alert("Anti-Spam : Vous venez d'envoyer exactement le même commentaire !");
      return;
    }

    setIsSubmitting(true);

    const checkFakeNetworkError = Math.random() < 0.15;
    if (checkFakeNetworkError) {
      setTimeout(() => {
        setNetworkError(true);
        setIsSubmitting(false);
      }, 400);
      return;
    }

    setTimeout(() => {
      onAddComment(text);
      lastSentRef.current = text;
      setNewCommentInput('');
      setIsSubmitting(false);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
        if (commentsRef.current) {
          commentsRef.current.scrollTo({
            top: commentsRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }, 300);
  }, [newCommentInput, isSubmitting, onAddComment]);

  const saveEdit = (id: string | number) => {
    if (!editingText.trim() || !onEditComment) return;
    onEditComment(id, editingText.trim());
    setEditingId(null);
  };

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 110 || info.velocity.y > 650) {
        onClose();
      }
    },
    [onClose]
  );

  const getInitials = useCallback((username: string) => {
    const clean = username.replace('@', '').trim();
    if (!clean) return '?';
    return clean.slice(0, 2).toUpperCase();
  }, []);

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.section
          role="dialog"
          aria-modal="true"
          aria-label="Commentaires"
          className="fixed inset-x-0 bottom-0 z-[100] flex min-h-[45dvh] max-h-[92dvh] flex-col overflow-hidden rounded-t-[30px] border border-neutral-200/80 bg-white text-neutral-900 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] md:left-1/2 md:right-auto md:w-[560px] md:-translate-x-1/2"
          style={{ marginBottom: 'var(--keyboard-offset, 0px)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 430, damping: 38, mass: 0.8 }}
        >
          <motion.div
            className="shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-center px-4 pb-1 pt-2.5">
              <div className="h-1 w-10 rounded-full bg-neutral-200" />
            </div>

            <header className="flex items-center justify-between border-b border-neutral-100 px-4 pb-3 pt-1">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-neutral-100 bg-neutral-50">
                  <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-black tracking-tight">
                    Commentaires
                  </h2>
                  <p className="text-[11px] font-bold text-neutral-400">
                    {video.comments} {video.comments === 1 ? 'commentaire' : 'commentaires'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer les commentaires"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 outline-none transition-all active:scale-90 active:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
          </motion.div>

          {networkError && (
            <div className="bg-rose-50 border-b border-rose-100 px-4 py-2.5 flex items-center justify-between text-xs text-rose-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium">Une erreur réseau est survenue.</span>
              </div>
              <button 
                onClick={triggerRetry}
                className="flex items-center gap-1 font-black bg-rose-600 text-white px-2.5 py-1 rounded-lg hover:bg-rose-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Réessayer
              </button>
            </div>
          )}

          <div
            ref={commentsRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
          >
            {loadingProgressive ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-neutral-100 rounded-[13px]" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-neutral-100 rounded w-1/4" />
                      <div className="h-3 bg-neutral-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((comment, index) => {
                  const isMe = comment.user === 'moi_createur';
                  const isEditing = editingId === comment.id;

                  return (
                    <motion.article
                      key={comment.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.12), ease: 'easeOut' }}
                      className="flex gap-3 group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border border-neutral-200 bg-neutral-50 text-[10px] font-black tracking-wide text-neutral-700">
                        {getInitials(comment.user)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="truncate text-[12px] font-black text-neutral-900">
                              @{comment.user.replace('@', '')}
                            </span>
                            <span className="shrink-0 text-[10px] font-bold text-neutral-400">
                              {comment.time}
                            </span>
                          </div>

                          {isMe && !isEditing && (
                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingId(comment.id); setEditingText(comment.text); }}
                                className="text-neutral-500 hover:text-neutral-900 p-1"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {onDeleteComment && (
                                <button 
                                  onClick={() => onDeleteComment(comment.id)}
                                  className="text-neutral-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-1 flex gap-2">
                            <Input 
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value.substring(0, CHAR_LIMIT))}
                              className="h-8 text-xs bg-neutral-50"
                            />
                            <Button onClick={() => saveEdit(comment.id)} size="sm" className="h-8 rounded-lg px-2 text-[11px]">
                              OK
                            </Button>
                            <Button onClick={() => setEditingId(null)} variant="outline" size="sm" className="h-8 rounded-lg px-2 text-[11px]">
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <p className="mt-1 break-words text-[13px] font-medium leading-[1.45] text-neutral-700">
                            {comment.text}
                          </p>
                        )}
                      </div>
                    </motion.article>
                  );
                })}

                {comments.length === 0 && (
                  <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border border-neutral-100 bg-neutral-50">
                      <Sparkles className="h-5 w-5 text-neutral-300" />
                    </div>
                    <p className="text-[13px] font-bold text-neutral-700">Aucun commentaire</p>
                    <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-neutral-400">
                      Soyez le premier à partager votre réaction.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="shrink-0 border-t border-neutral-100 bg-white px-3 pt-2"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] text-neutral-400 font-bold">
                {newCommentInput.length}/{CHAR_LIMIT} caractères
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-[17px] border border-neutral-200 bg-neutral-50 transition-all focus-within:border-neutral-300 focus-within:bg-neutral-100/60 focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.025)]">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newCommentInput}
                  onChange={(event) => setNewCommentInput(event.target.value.substring(0, CHAR_LIMIT))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      submitComment();
                    }
                  }}
                  placeholder="Ajouter un commentaire…"
                  maxLength={CHAR_LIMIT}
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  spellCheck
                  enterKeyHint="send"
                  disabled={isSubmitting}
                  className="h-11 border-0 bg-transparent px-4 text-[16px] text-neutral-900 shadow-none outline-none placeholder:text-neutral-400 focus-visible:ring-0"
                />
              </div>

              <Button
                type="button"
                size="icon"
                onClick={submitComment}
                disabled={!newCommentInput.trim() || isSubmitting}
                aria-label="Envoyer le commentaire"
                className="h-11 w-11 shrink-0 rounded-[16px] bg-neutral-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all hover:bg-neutral-800 active:scale-[0.88] disabled:pointer-events-none disabled:opacity-25"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="h-[15px] w-[15px]" />}
              </Button>
            </div>
          </div>
        </motion.section>
      </>
    </AnimatePresence>
  );
}