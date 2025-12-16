
import { Phone, MoreVertical, Video, ArrowLeft, Pin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import type { User, Chat } from '@/lib/types';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface ChatTopbarProps {
  info: User | { name?: string; users: User[] };
  isGroup: boolean;
  chat: Chat;
  allUsers: User[];
}

export function ChatTopbar({ info, isGroup, chat, allUsers }: ChatTopbarProps) {
  const user = !isGroup ? (info as User) : undefined;
  const group = isGroup ? (info as { name?: string; users: User[] }) : undefined;
  
  const TopbarContent = () => (
    <>
      {isGroup ? (
        <div className="relative">
          {group?.users.slice(0, 2).map((user, index) => (
            <Avatar key={user.id} className={cn('w-10 h-10 border-2 border-background', index === 1 ? 'absolute top-0 left-5' : '')}>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      ) : (
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.substring(0, 1) || 'U'}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col max-w-[calc(100vw-220px)] sm:max-w-xs">
        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{isGroup ? group?.name : user?.name}</span>
        <span className="text-xs text-muted-foreground">
        {isGroup ? `${group?.users.length} membres` : user?.online ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>
    </>
  );

  return (
    <div className="w-full flex flex-col border-b">
      <div className="h-20 flex p-4 justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          {isGroup ? (
            <div className="flex items-center gap-2">
              <TopbarContent />
            </div>
          ) : (
            <Link href={`/profile/${user?.id}`} className="flex items-center gap-2">
              <TopbarContent />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {chat.pinnedMessages && chat.pinnedMessages.length > 0 && (
          <motion.div
            className="bg-muted/50 px-4 py-2"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
          >
            <Carousel opts={{ loop: chat.pinnedMessages.length > 1 }} className="w-full">
                <CarouselContent>
                    {chat.pinnedMessages.map((pinnedMessage, index) => {
                        const senderOfPinned = pinnedMessage ? allUsers.find(u => u.id === pinnedMessage.senderId) : null;
                        return (
                            <CarouselItem key={index}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Pin className="w-4 h-4 text-primary shrink-0" />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-bold text-primary">
                                                {senderOfPinned?.name || 'Message Épinglé'}
                                            </span>
                                            <span className="text-sm text-foreground truncate">{pinnedMessage.content}</span>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                {chat.pinnedMessages.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <CarouselPrevious className="static -translate-y-0 w-6 h-6" />
                        <CarouselNext className="static -translate-y-0 w-6 h-6" />
                    </div>
                )}
            </Carousel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
