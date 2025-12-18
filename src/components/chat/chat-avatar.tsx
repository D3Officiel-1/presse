
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Annoyed, Users } from 'lucide-react';
import Image from 'next/image';

interface ChatAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Partial<User & { groupAvatar?: string }>;
  isGroup?: boolean;
  isCommunity?: boolean;
}

export function ChatAvatar({ user, isGroup = false, isCommunity = false, className }: ChatAvatarProps) {
  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn("w-10 h-10", className)}>
        {isCommunity ? (
            <AvatarImage src={user.avatar || "https://i.postimg.cc/fbtSZFWz/icon-256x256.png"} alt={user.name} className="p-1" />
        ) : isGroup ? (
            user.groupAvatar ? (
                <AvatarImage src={user.groupAvatar} alt={user.name} />
            ) : (
               <AvatarFallback className="bg-muted">
                 <Users className="w-5 h-5" />
               </AvatarFallback>
            )
        ) : (
          <>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
          </>
        )}
      </Avatar>
      {!isGroup && !isCommunity && user.online && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
      )}
    </div>
  );
}
