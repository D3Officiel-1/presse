'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';

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
}

export function CommentSheet({
  video,
  comments,
  onClose,
  onAddComment,
}: CommentSheetProps) {
  const [newCommentInput, setNewCommentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const submitComment = useCallback(() => {
    const text = newCommentInput.trim();

    if (!text) return;

    onAddComment(text);
    setNewCommentInput('');

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [newCommentInput, onAddComment]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const shouldClose = info.offset.y > 120 || info.velocity.y > 700;

    if (shouldClose) {
      onClose();
    }
  };

  const getInitials = (username: string) => {
    const clean = username.replace('@', '').trim();

    if (!clean) return '?';

    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sheet */}
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-label="Commentaires"
          className="
            fixed
            inset-x-0
            bottom-0
            z-[100]
            flex
            max-h-[92dvh]
            min-h-[45dvh]
            flex-col
            overflow-hidden
            rounded-t-[28px]
            border
            border-white/[0.08]
            bg-[#0d0d0f]/[0.97]
            text-white
            shadow-[0_-20px_80px_rgba(0,0,0,0.45)]
            backdrop-blur-3xl
            supports-[backdrop-filter]:bg-[#0d0d0f]/85
            md:left-1/2
            md:right-auto
            md:w-[560px]
            md:-translate-x-1/2
          "
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 38,
            mass: 0.8,
          }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0.02, bottom: 0.35 }}
          onDragEnd={handleDragEnd}
        >
          {/* Drag indicator */}
          <div className="flex shrink-0 justify-center pt-2.5 pb-1">
            <div
              className="
                h-1
                w-10
                rounded-full
                bg-white/20
              "
            />
          </div>

          {/* Header */}
          <header
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-white/[0.07]
              px-4
              pb-3
              pt-1
            "
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-[11px]
                  border
                  border-white/[0.08]
                  bg-white/[0.07]
                  shadow-inner
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-white/70" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                  Commentaires
                </h2>

                <p className="text-[11px] font-medium text-white/40">
                  {video.comments}{' '}
                  {video.comments === 1
                    ? 'commentaire'
                    : 'commentaires'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer les commentaires"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/[0.06]
                bg-white/[0.06]
                text-white/70
                outline-none
                transition
                active:scale-90
                active:bg-white/10
                focus-visible:ring-2
                focus-visible:ring-white/30
              "
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Comments */}
          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-4
              py-4
              [scrollbar-width:none]
              [-webkit-overflow-scrolling:touch]
            "
          >
            <div className="space-y-5">
              {comments.map((comment, index) => (
                <motion.article
                  key={comment.id}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.22,
                    delay: Math.min(index * 0.025, 0.15),
                  }}
                  className="flex gap-3"
                >
                  {/* Avatar */}
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-[13px]
                      border
                      border-white/[0.08]
                      bg-gradient-to-br
                      from-white/[0.14]
                      to-white/[0.04]
                      text-[10px]
                      font-bold
                      tracking-wide
                      text-white/80
                      shadow-sm
                    "
                  >
                    {getInitials(comment.user)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-[12px] font-semibold text-white">
                        @{comment.user.replace('@', '')}
                      </span>

                      <span className="shrink-0 text-[10px] font-medium text-white/30">
                        {comment.time}
                      </span>
                    </div>

                    <p className="mt-1 text-[13px] font-normal leading-[1.45] text-white/70">
                      {comment.text}
                    </p>
                  </div>
                </motion.article>
              ))}

              {comments.length === 0 && (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                  <div
                    className="
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-[20px]
                      border
                      border-white/[0.07]
                      bg-white/[0.05]
                    "
                  >
                    <Sparkles className="h-5 w-5 text-white/30" />
                  </div>

                  <p className="text-[13px] font-semibold text-white/70">
                    Aucun commentaire
                  </p>

                  <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-white/35">
                    Soyez le premier à partager votre réaction.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div
            className="
              shrink-0
              border-t
              border-white/[0.07]
              bg-[#0d0d0f]/90
              px-3
              pt-3
              backdrop-blur-2xl
              supports-[backdrop-filter]:bg-[#0d0d0f]/70
            "
            style={{
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  relative
                  flex
                  min-w-0
                  flex-1
                  items-center
                  rounded-[17px]
                  border
                  border-white/[0.08]
                  bg-white/[0.055]
                  transition-colors
                  focus-within:border-white/[0.16]
                  focus-within:bg-white/[0.07]
                "
              >
                <Input
                  ref={inputRef}
                  value={newCommentInput}
                  onChange={(event) => setNewCommentInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      submitComment();
                    }
                  }}
                  placeholder="Ajouter un commentaire…"
                  maxLength={500}
                  autoComplete="off"
                  enterKeyHint="send"
                  className="
                    h-11
                    border-0
                    bg-transparent
                    px-4
                    text-[13px]
                    text-white
                    shadow-none
                    outline-none
                    placeholder:text-white/30
                    focus-visible:ring-0
                  "
                />
              </div>

              <Button
                type="button"
                size="icon"
                onClick={submitComment}
                disabled={!newCommentInput.trim()}
                aria-label="Envoyer le commentaire"
                className="
                  h-11
                  w-11
                  shrink-0
                  rounded-[16px]
                  border
                  border-white/[0.08]
                  bg-white
                  text-black
                  shadow-[0_4px_18px_rgba(255,255,255,0.08)]
                  transition-all
                  hover:bg-white
                  active:scale-90
                  disabled:pointer-events-none
                  disabled:opacity-25
                "
              >
                <Send className="h-[15px] w-[15px]" />
              </Button>
            </div>
          </div>
        </motion.section>
      </>
    </AnimatePresence>
  );
}
