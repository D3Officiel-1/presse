
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, MessageSquare, Users, CircleDot, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Search, Link2, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser } from '@/firebase/auth/use-user'
import { useFirestore } from '@/firebase/provider'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { User } from '@/lib/types'

const callHistory = [
  {
    userId: 'user-1',
    type: 'incoming',
    status: 'answered',
    time: 'Aujourd\'hui, 14:20',
    isVideo: false,
  },
  {
    userId: 'user-3',
    type: 'outgoing',
    status: 'answered',
    time: 'Aujourd\'hui, 11:05',
    isVideo: true,
  },
  {
    userId: 'user-2',
    type: 'incoming',
    status: 'missed',
    time: 'Hier, 18:30',
    isVideo: false,
  },
   {
    userId: 'user-4',
    type: 'outgoing',
    status: 'answered',
    time: 'Lundi, 09:12',
    isVideo: false,
  },
];


export default function CallsPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const [usersData, setUsersData] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || callHistory.length === 0) {
      setLoading(false);
      return;
    };

    const userIds = [...new Set(callHistory.map(call => call.userId))];
    
    if (userIds.length > 0) {
      const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', userIds));
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const fetchedUsers: { [key: string]: User } = {};
        snapshot.forEach(doc => {
          fetchedUsers[doc.id] = { id: doc.id, ...doc.data() } as User;
        });
        setUsersData(fetchedUsers);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user data for calls:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [firestore]);


  return (
    <div className="flex flex-col h-full bg-background/90 text-foreground">
       <header className="p-4 border-b flex items-center justify-between bg-background/95 sticky top-0 z-10 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">
                Appels
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
                <Search size={20} />
            </Button>
          </div>
      </header>

       <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
                <div className="p-3">
                    <Button variant="outline" className='w-full justify-start gap-4'>
                        <div className="bg-primary text-primary-foreground p-2 rounded-full">
                           <Link2 className="w-5 h-5" />
                        </div>
                        <div className='flex flex-col items-start'>
                            <span className="font-semibold">Créer un lien d'appel</span>
                            <span className="text-xs text-muted-foreground">Partagez un lien pour votre appel</span>
                        </div>
                    </Button>
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground px-4">Récents</h3>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    callHistory.map((call, i) => {
                        const user = usersData[call.userId];
                        if (!user) return null;

                        return (
                            <div key={i} className="flex items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 ml-3">
                                    <p className={`font-semibold ${call.status === 'missed' ? 'text-destructive' : ''}`}>{user.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {call.type === 'incoming' ? 
                                            <PhoneIncoming className={`w-4 h-4 ${call.status === 'missed' ? 'text-destructive' : 'text-green-500'}`} /> :
                                            <PhoneOutgoing className="w-4 h-4 text-green-500" />
                                        }
                                        <span>{call.time}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className='text-primary'>
                                {call.isVideo ? <Video size={20} /> : <Phone size={20} />}
                                </Button>
                            </div>
                        )
                    })
                )}
            </div>
       </ScrollArea>
    </div>
  )
}
