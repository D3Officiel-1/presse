
import { Phone, MoreVertical, Video, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import Link from 'next/link';

interface ChatTopbarProps {
  info: User | { name?: string; users: User[] };
  isGroup: boolean;
}

export function ChatTopbar({ info, isGroup }: ChatTopbarProps) {
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
      <div className="flex flex-col">
        <span className="font-medium whitespace-nowrap">{isGroup ? group?.name : user?.name}</span>
        <span className="text-xs text-muted-foreground">
        {isGroup ? `${group?.users.length} membres` : user?.online ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>
    </>
  );

  return (
    <div className="w-full h-20 flex p-4 justify-between items-center border-b">
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
  );
}
