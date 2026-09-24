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
  const commentsRef = useRef<HTMLDivElement>(null);

  /*
   * Bloque le scroll de la page derrière la sheet.
   */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /*
   * Gestion clavier desktop.
   */
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

  /*
   * Gestion du clavier virtuel iOS.
   *
   * On utilise visualViewport pour éviter que
   * le clavier recouvre la zone de saisie.
   */
  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) return;

    const updateViewport = () => {
      const keyboardOffset =
        Math.max(
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

      document.documentElement.style.removeProperty(
        '--keyboard-offset'
      );
    };
  }, []);

  /*
   * Envoi du commentaire.
   */
  const submitComment = useCallback(() => {
    const text = newCommentInput.trim();

    if (!text) return;

    onAddComment(text);
    setNewCommentInput('');

    requestAnimationFrame(() => {
      inputRef.current?.focus();

      commentsRef.current?.scrollTo({
        top: commentsRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [newCommentInput, onAddComment]);

  /*
   * Fermer avec swipe vers le bas.
   */
  const handleDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      if (
        info.offset.y > 110 ||
        info.velocity.y > 650
      ) {
        onClose();
      }
    },
    [onClose]
  );

  /*
   * Initiales avatar.
   */
  const getInitials = useCallback(
    (username: string) => {
      const clean = username
        .replace('@', '')
        .trim();

      if (!clean) return '?';

      return clean.slice(0, 2).toUpperCase();
    },
    []
  );

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="
            fixed
            inset-0
            z-[90]
            bg-black/30
            backdrop-blur-[3px]
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Bottom Sheet */}
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
            min-h-[45dvh]
            max-h-[92dvh]
            flex-col
            overflow-hidden
            rounded-t-[30px]
            border
            border-neutral-200/80
            bg-white
            text-neutral-900
            shadow-[0_-20px_60px_rgba(0,0,0,0.12)]
            md:left-1/2
            md:right-auto
            md:w-[560px]
            md:-translate-x-1/2
          "
          style={{
            marginBottom:
              'var(--keyboard-offset, 0px)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 430,
            damping: 38,
            mass: 0.8,
          }}
        >
          {/* Drag area */}
          <motion.div
            className="
              shrink-0
              touch-none
              select-none
              cursor-grab
              active:cursor-grabbing
            "
            drag="y"
            dragConstraints={{
              top: 0,
            }}
            dragElastic={{
              top: 0.02,
              bottom: 0.3,
            }}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            <div className="flex justify-center px-4 pb-1 pt-2.5">
              <div
                className="
                  h-1
                  w-10
                  rounded-full
                  bg-neutral-200
                "
              />
            </div>

            {/* Header */}
            <header
              className="
                flex
                items-center
                justify-between
                border-b
                border-neutral-100
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
                    border-neutral-100
                    bg-neutral-50
                  "
                >
                  <Sparkles
                    className="
                      h-3.5
                      w-3.5
                      text-neutral-500
                    "
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      truncate
                      text-[14px]
                      font-black
                      tracking-tight
                    "
                  >
                    Commentaires
                  </h2>

                  <p
                    className="
                      text-[11px]
                      font-bold
                      text-neutral-400
                    "
                  >
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
                  border-neutral-200
                  bg-neutral-50
                  text-neutral-500
                  outline-none
                  transition-all
                  active:scale-90
                  active:bg-neutral-100
                  focus-visible:ring-2
                  focus-visible:ring-neutral-200
                "
              >
                <X className="h-4 w-4" />
              </button>
            </header>
          </motion.div>

          {/* Comments */}
          <div
            ref={commentsRef}
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-4
              py-4
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [-webkit-overflow-scrolling:touch]
            "
          >
            <div className="space-y-5">
              {comments.map((comment, index) => (
                <motion.article
                  key={comment.id}
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(
                      index * 0.02,
                      0.12
                    ),
                    ease: 'easeOut',
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
                      border-neutral-200
                      bg-neutral-50
                      text-[10px]
                      font-black
                      tracking-wide
                      text-neutral-700
                    "
                  >
                    {getInitials(comment.user)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="
                          truncate
                          text-[12px]
                          font-black
                          text-neutral-900
                        "
                      >
                        @{comment.user.replace('@', '')}
                      </span>

                      <span
                        className="
                          shrink-0
                          text-[10px]
                          font-bold
                          text-neutral-400
                        "
                      >
                        {comment.time}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        break-words
                        text-[13px]
                        font-medium
                        leading-[1.45]
                        text-neutral-700
                      "
                    >
                      {comment.text}
                    </p>
                  </div>
                </motion.article>
              ))}

              {comments.length === 0 && (
                <div
                  className="
                    flex
                    min-h-[240px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
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
                      border-neutral-100
                      bg-neutral-50
                    "
                  >
                    <Sparkles
                      className="
                        h-5
                        w-5
                        text-neutral-300
                      "
                    />
                  </div>

                  <p
                    className="
                      text-[13px]
                      font-bold
                      text-neutral-700
                    "
                  >
                    Aucun commentaire
                  </p>

                  <p
                    className="
                      mt-1
                      max-w-[220px]
                      text-[11px]
                      leading-relaxed
                      text-neutral-400
                    "
                  >
                    Soyez le premier à partager
                    votre réaction.
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
              border-neutral-100
              bg-white
              px-3
              pt-3
            "
            style={{
              paddingBottom:
                'max(12px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex items-center gap-2">
              {/* Input */}
              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  rounded-[17px]
                  border
                  border-neutral-200
                  bg-neutral-50
                  transition-all
                  focus-within:border-neutral-300
                  focus-within:bg-neutral-100/60
                  focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.025)]
                "
              >
                <Input
                  ref={inputRef}
                  type="text"
                  value={newCommentInput}
                  onChange={(event) =>
                    setNewCommentInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      submitComment();
                    }
                  }}
                  placeholder="Ajouter un commentaire…"
                  maxLength={500}
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  spellCheck
                  enterKeyHint="send"
                  className="
                    h-11
                    border-0
                    bg-transparent
                    px-4
                    text-[16px]
                    text-neutral-900
                    shadow-none
                    outline-none
                    placeholder:text-neutral-400
                    focus-visible:ring-0
                  "
                />
              </div>

              {/* Send */}
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
                  bg-neutral-900
                  text-white
                  shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                  transition-all
                  hover:bg-neutral-800
                  active:scale-[0.88]
                  disabled:pointer-events-none
                  disabled:opacity-20
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
