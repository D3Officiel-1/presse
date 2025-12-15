
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/lib/types';

interface ChatMessageStatusProps {
  message: Message;
  otherUser: User | undefined;
}

export function ChatMessageStatus({ message, otherUser }: ChatMessageStatusProps) {
  if (!message.readBy || !otherUser) {
    // Default fallback
    return <Check className="h-4 w-4 text-muted-foreground" />;
  }

  const isReadByRecipient = message.readBy.includes(otherUser.id);

  if (isReadByRecipient) {
    // Lu: 2 traits verts
    return <CheckCheck className="h-4 w-4 text-green-500" />;
  }
  
  if (otherUser.online) {
    // Distribué (en ligne mais pas lu): 2 traits gris
    return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
  }

  // Envoyé (hors ligne): 1 trait gris
  return <Check className="h-4 w-4 text-muted-foreground" />;
}
