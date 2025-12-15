
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pen, Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser } from '@/firebase/auth/use-user'
import { useFirestore } from '@/firebase/provider'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { User } from '@/lib/types'


const statusUpdatesData = [
  { userId: 'user-1', time: 'Il y a 15 minutes', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80' },
  { userId: 'user-3', time: 'Il y a 45 minutes', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80' },
];

const viewedUpdatesData = [
  { userId: 'user-2', time: 'Il y a 2 heures', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80' },
];

export default function StatusPage() {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const [usersData, setUsersData] = useState<{ [key: string]: User }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) {
            setLoading(false);
            return;
        }

        const allUserIds = [...new Set([...statusUpdatesData, ...viewedUpdatesData].map(u => u.userId))];
        if(currentUser?.uid) allUserIds.push(currentUser.uid);

        if (allUserIds.length > 0) {
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', allUserIds));
            const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
                const fetchedUsers: { [key: string]: User } = {};
                snapshot.forEach(doc => {
                    fetchedUsers[doc.id] = { id: doc.id, ...doc.data() } as User;
                });
                setUsersData(fetchedUsers);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching user data for statuses:", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [firestore, currentUser]);

    const loggedInUserData = currentUser ? usersData[currentUser.uid] : null;

  return (
    <div className="flex flex-col h-full bg-background/90 text-foreground">
      <header className="p-4 border-b flex items-center justify-between bg-background/95 sticky top-0 z-10 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">
                Statuts
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal size={20} />
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            {loggedInUserData && (
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-14 h-14 border-2 border-background">
                                        <AvatarImage src={loggedInUserData.avatar} />
                                        <AvatarFallback>{loggedInUserData.name.substring(0,1)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">Mon statut</p>
                                        <p className="text-sm text-muted-foreground">Appuyez pour ajouter une mise à jour</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute -bottom-2 right-0 flex gap-2">
                                <Button size="icon" className="rounded-full h-10 w-10 bg-muted text-muted-foreground hover:bg-accent shadow-md">
                                    <Pen className="w-5 h-5"/>
                                </Button>
                                <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-md">
                                    <Camera className="w-5 h-5"/>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Récentes</h3>
                            <div className="space-y-4">
                                {statusUpdatesData.map((update, i) => {
                                    const user = usersData[update.userId];
                                    if (!user) return null;
                                    return (
                                        <div key={i} className="flex items-center gap-4">
                                            <Avatar className="w-14 h-14 p-0.5 border-2 border-blue-500">
                                                <AvatarImage src={user.avatar} className='rounded-full' />
                                                <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{update.time}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Vues</h3>
                            <div className="space-y-4">
                                {viewedUpdatesData.map((update, i) => {
                                    const user = usersData[update.userId];
                                    if (!user) return null;
                                    return (
                                        <div key={i} className="flex items-center gap-4">
                                            <Avatar className="w-14 h-14 p-0.5 border-2 border-border">
                                                <AvatarImage src={user.avatar} className='rounded-full' />
                                                <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{update.time}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ScrollArea>
    </div>
  )
}
