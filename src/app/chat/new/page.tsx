

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Search, User as UserIcon, FileText, BookUser, Check, History, QrCode, Phone, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { handleSelectUser } from '@/lib/chat-action';

interface FirestoreUser {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
    class?: string;
    bio?: string;
    phone?: string;
    lastPresence?: 'present' | 'absent';
}

export default function NewChatPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user: currentUser } = useUser();

    const [search, setSearch] = useState('');
    const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
    const [classFilter, setClassFilter] = useState<'all' | '1ère A1' | '1ère A22' | '2nde A22'>('all');
    
    useEffect(() => {
        if (!firestore || !currentUser) return;
        
        const usersCol = collection(firestore, 'users');
    
        const unsubscribe = onSnapshot(usersCol, async (snapshot) => {
            const usersListPromises = snapshot.docs
                .filter(doc => doc.id !== currentUser.uid) // Filter out the current user
                .map(async (userDoc) => {
                    const user = { id: userDoc.id, ...userDoc.data() } as FirestoreUser;

                    // Fetch last presence
                    const presenceCol = collection(firestore, 'users', user.id, 'presences');
                    const presenceQuery = query(presenceCol, orderBy('timestamp', 'desc'), limit(1));
                    const presenceSnap = await getDocs(presenceQuery);

                    if (!presenceSnap.empty) {
                        user.lastPresence = presenceSnap.docs[0].data().status as 'present' | 'absent';
                    }

                    return user;
                });
            
            const usersList = await Promise.all(usersListPromises);
            setAllUsers(usersList.sort((a, b) => a.name.localeCompare(b.name)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, [firestore, currentUser]);

    const onUserSelect = (user: FirestoreUser) => {
        handleSelectUser(user.id, currentUser, firestore, setIsCreatingChat, router);
    };
    
    const handleViewProfile = (user: FirestoreUser) => {
        setSelectedUser(user);
        setIsProfileOpen(true);
    };

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase());
        if (classFilter === 'all') {
            return matchesSearch;
        }
        return matchesSearch && user.class === classFilter;
    });

    return (
        <div className="flex flex-col h-full bg-muted/20">
            <header className="p-4 flex flex-col gap-4 bg-background sticky top-0 z-10 shrink-0 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="font-semibold text-xl tracking-tight">Nouvelle discussion</h1>
                            <p className="text-sm text-muted-foreground">
                                {allUsers.length} membres
                            </p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un membre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/50 pl-10"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => router.push('/chat/scan')}>
                        <QrCode className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm"
                        variant={classFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setClassFilter('all')}
                        className="transition-all"
                    >
                        Tous
                    </Button>
                    <Button 
                        size="sm"
                        variant={classFilter === '1ère A1' ? 'default' : 'outline'}
                        onClick={() => setClassFilter('1ère A1')}
                        className="transition-all"
                    >
                        1ère A1
                    </Button>
                    <Button 
                        size="sm"
                        variant={classFilter === '1ère A22' ? 'default' : 'outline'}
                        onClick={() => setClassFilter('1ère A22')}
                        className="transition-all"
                    >
                        1ère A22
                    </Button>
                     <Button 
                        size="sm"
                        variant={classFilter === '2nde A22' ? 'default' : 'outline'}
                        onClick={() => setClassFilter('2nde A22')}
                        className="transition-all"
                    >
                        2nde A22
                    </Button>
                </div>
            </header>
            <ScrollArea className="flex-1">
                {loading ? (
                    <div className="flex justify-center items-center h-full p-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <Card 
                                    key={user.id} 
                                    className="relative group overflow-hidden border-border/60 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center p-4 aspect-square cursor-pointer"
                                    onClick={() => onUserSelect(user)}
                                >
                                    {isCreatingChat === user.id && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewProfile(user);
                                        }}
                                    >
                                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                    <div className="relative">
                                        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 shadow-sm">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="text-3xl">{user.name.substring(0, 1)}</AvatarFallback>
                                        </Avatar>
                                            <span className={cn(
                                            "absolute bottom-1 right-1 block h-4 w-4 rounded-full ring-2 ring-background",
                                            user.online ? 'bg-green-500' : 'bg-gray-400'
                                        )} />
                                    </div>
                                    <span className="font-semibold text-center mt-3 truncate w-full">{user.name}</span>
                                    {user.class && <span className="text-xs text-muted-foreground text-center truncate w-full">{user.class}</span>}
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground py-10">
                                <Search className="mx-auto w-12 h-12 mb-4" />
                                <h3 className="font-semibold text-lg">Aucun membre trouvé</h3>
                                <p className="text-sm">Essayez un autre terme de recherche ou un autre filtre.</p>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
            
            {/* View Profile Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="max-w-sm p-0">
                   {selectedUser && (
                        <div className="flex flex-col">
                            <div className="bg-accent/50 p-8 relative">
                                <div className="relative w-28 h-28 mx-auto">
                                    <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                                        <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                                        <AvatarFallback className="text-4xl">{selectedUser.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    {selectedUser.online && (
                                        <span className="absolute bottom-1 right-1 block h-5 w-5 rounded-full bg-green-500 ring-4 ring-background" title="En ligne"/>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 space-y-6 text-center">
                                <div>
                                    <DialogTitle className="text-2xl">{selectedUser.name}</DialogTitle>
                                    <DialogDescription>
                                        {selectedUser.online ? 'En ligne' : 'Hors ligne'}
                                    </DialogDescription>
                                </div>

                                <div className="text-left space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground justify-center">
                                            Dernière Présence
                                        </h3>
                                        <div className="flex items-center gap-2 justify-center">
                                            {selectedUser.lastPresence ? (
                                                <>
                                                    {selectedUser.lastPresence === 'present' && <span className="text-sm text-green-600 font-semibold flex items-center gap-1"><Check className="w-4 h-4"/> Présent</span>}
                                                    {selectedUser.lastPresence === 'absent' && <span className="text-sm text-red-600 font-semibold flex items-center gap-1"><X className="w-4 h-4"/> Absent</span>}
                                                </>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Non renseignée</span>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                     {selectedUser.bio && (
                                        <div className="flex items-start gap-4">
                                            <FileText className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
                                            <div>
                                            <h3 className="font-semibold">Biographie</h3>
                                            <p className="text-muted-foreground text-sm mt-1">{selectedUser.bio}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedUser.class && (
                                         <div className="flex items-start gap-4">
                                            <BookUser className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
                                            <div>
                                            <h3 className="font-semibold">Classe</h3>
                                            <p className="text-muted-foreground text-sm mt-1">{selectedUser.class}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedUser.phone && (
                                        <div className="flex items-start gap-4">
                                            <Phone className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
                                            <div>
                                            <h3 className="font-semibold">Téléphone</h3>
                                            <p className="text-muted-foreground text-sm mt-1">+225 {selectedUser.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="p-4 border-t bg-muted/50">
                                <Button 
                                    className='w-full'
                                    onClick={() => {
                                        if (selectedUser) {
                                            onUserSelect(selectedUser);
                                        }
                                        setIsProfileOpen(false);
                                    }}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Commencer la discussion
                                </Button>
                            </DialogFooter>
                        </div>
                   )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
