
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, MessageSquare, Activity, UserPlus, Loader2, Check, X, Phone, Video, Search, FileText, History, Mail, MoreHorizontal, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, collection, onSnapshot, serverTimestamp, getDoc, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ActionFocusView, type ActionItem } from '@/components/chat/action-focus-view';
import { useUser } from '@/firebase/auth/use-user';
import { handleSelectUser } from '@/lib/chat-action';
import { cn } from '@/lib/utils';

interface PresenceRecord {
    status: 'present' | 'absent';
    timestamp: any;
}

interface FirestoreUser {
    id: string;
    name: string;
    class: string;
    email?: string;
    phone: string;
    admin: boolean;
    avatar: string;
    online: boolean;
    bio: string;
    todayPresence?: 'present' | 'absent';
}

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: currentUser } = useUser();


    const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [newMember, setNewMember] = useState({
        fullName: '',
        class: '',
        phone: '',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const getTodayDateString = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (!firestore) return;
    
        const usersCol = collection(firestore, 'users');
        const unsubscribe = onSnapshot(usersCol, async (snapshot) => {
            const usersListPromises = snapshot.docs.map(async (userDoc) => {
                const user = { id: userDoc.id, ...userDoc.data() } as FirestoreUser;
    
                const todayDate = getTodayDateString();
                const presenceRef = doc(firestore, 'users', user.id, 'presences', todayDate);
                const presenceSnap = await getDoc(presenceRef);
    
                if (presenceSnap.exists()) {
                    user.todayPresence = presenceSnap.data().status;
                } else {
                    user.todayPresence = undefined;
                }
    
                return user;
            });
    
            const usersList = await Promise.all(usersListPromises);
            setAllUsers(usersList.sort((a, b) => a.name.localeCompare(b.name)));
            setUsersLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les membres.' });
            setUsersLoading(false);
        });
    
        return () => unsubscribe();
    }, [firestore, toast]);
    
    const handlePresenceChange = async (userId: string, status: 'present' | 'absent') => {
        if (!firestore) return;
        const todayDate = getTodayDateString();
        const presenceRef = doc(firestore, 'users', userId, 'presences', todayDate);
        
        const currentStatus = allUsers.find(u => u.id === userId)?.todayPresence;
        const newStatus = currentStatus === status ? undefined : status;

        // Optimistically update UI
        setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, todayPresence: newStatus } : u));
        if (selectedUser?.id === userId) {
            setSelectedUser(prev => prev ? {...prev, todayPresence: newStatus} : null);
        }

        try {
            await setDoc(presenceRef, { 
                status: newStatus || 'absent', // If toggled off, mark as absent for record
                timestamp: serverTimestamp()
            }, { merge: true });

            if (!newStatus) {
                toast({ description: "Présence retirée." });
            }

        } catch (error) {
            console.error("Error updating presence:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour la présence.' });
            // Revert UI on error
            setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, todayPresence: currentStatus } : u));
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMember({ ...newMember, [e.target.id]: e.target.value });
    };


    const handleClassChange = (value: string) => {
        setNewMember({ ...newMember, class: value });
    };
    
    const handleAddMember = async () => {
        if (!firestore) return;
        if (!newMember.fullName || !newMember.class || !newMember.phone) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
            return;
        }
        
        setIsLoading(true);

        try {
            // Check for duplicate phone number
            const phoneQuery = query(collection(firestore, "users"), where("phone", "==", newMember.phone));
            const querySnapshot = await getDocs(phoneQuery);
            if (!querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'Erreur', description: 'Ce numéro de téléphone est déjà utilisé par un autre membre.' });
                setIsLoading(false);
                return;
            }

            // Create user document in Firestore without using Firebase Auth
            await addDoc(collection(firestore, 'users'), {
                name: newMember.fullName,
                class: newMember.class,
                phone: newMember.phone,
                admin: false,
                avatar: `https://avatar.vercel.sh/${newMember.fullName.replace(/\s/g, '-')}.png`,
                online: false,
                bio: '',
                createdAt: serverTimestamp(),
            });

            toast({ title: 'Succès', description: 'Le membre a été ajouté avec succès.' });
            setIsAddMemberOpen(false);
            setNewMember({ fullName: '', class: '', phone: '' });

        } catch (error: any) {
            console.error("Error creating member:", error);
            let description = "Une erreur est survenue. Veuillez réessayer.";
            toast({ variant: 'destructive', title: 'Erreur', description: description });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleViewProfile = (user: FirestoreUser) => {
        setSelectedUser(user);
    };
    
    const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);

    const onUserSelect = (userId: string) => {
        handleSelectUser(userId, currentUser, firestore, setIsCreatingChat, router);
    };

    const handleWhatsappRedirect = () => {
        if (selectedUser?.phone) {
            const phone = selectedUser.phone.replace(/\s/g, '');
            const appUrl = window.location.origin;

            const queryParams = new URLSearchParams({
                userId: selectedUser.id,
                name: selectedUser.name,
                class: selectedUser.class,
                phone: selectedUser.phone,
            });
            const magicLink = `${appUrl}/login/autologin?${queryParams.toString()}`;

            const message = `*🎉 Bienvenue au Club de Presse, ${selectedUser.name} ! 🎉*

Nous sommes ravis de t'accueillir parmi nous. Voici les informations que tu as fournies pour ton inscription :

👤 *Nom complet :* ${selectedUser.name}
🏫 *Classe :* ${selectedUser.class}
📱 *Téléphone :* ${selectedUser.phone}

Pour commencer, connecte-toi à notre application exclusive en utilisant ce lien magique. C'est là que toute la magie opère ! ✨

🔗 *Clique ici pour te connecter :*
${magicLink}

À très vite dans l'espace de discussion ! 🚀
`;
            
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/225${phone}?text=${encodedMessage}`, '_blank');
        } else {
            toast({
                description: "Ce membre n'a pas de numéro de téléphone enregistré."
            });
        }
    }

    const userActions: ActionItem[] = selectedUser ? [
        { icon: History, label: "Historique", action: () => router.push(`/admin/history/${selectedUser.id}`) },
        { icon: MessageSquare, label: "Message", action: () => onUserSelect(selectedUser.id) },
        { icon: WhatsappIcon, label: "WhatsApp", action: handleWhatsappRedirect },
        { icon: UserIcon, label: "Profil", action: () => router.push(`/chat/settings/${selectedUser.id}`) },
    ] : [];

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-transparent sticky top-0 z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/chat')} className="size-9 bg-white/5 hover:bg-white/10">
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-2xl tracking-tight">Tableau de bord</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestion du Club de Presse
                        </p>
                    </div>
                </div>
                 <Button onClick={() => setIsAddMemberOpen(true)} className="gap-2 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20">
                    <UserPlus />
                    Ajouter un membre
                </Button>
            </header>

            <AnimatePresence>
                {selectedUser && (
                    <ActionFocusView
                        onClose={() => setSelectedUser(null)}
                        mainActions={userActions}
                        user={selectedUser}
                        toast={toast}
                    />
                )}
            </AnimatePresence>

            <main className="flex-1 overflow-auto p-4 md:p-6" onClick={() => selectedUser && setSelectedUser(null)}>
                <motion.div 
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className='bg-card/30 backdrop-blur-md border-white/10 shadow-lg'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Membres Total</CardTitle>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{allUsers.length}</div>
                            <p className="text-xs text-muted-foreground">
                                +{allUsers.filter(u => u.online).length} en ligne
                            </p>
                        </CardContent>
                    </Card>
                    <Card className='bg-card/30 backdrop-blur-md border-white/10 shadow-lg'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Messages (bientôt)</CardTitle>
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">N/A</div>
                            <p className="text-xs text-muted-foreground">Statistique à venir</p>
                        </CardContent>
                    </Card>
                    <Card className='bg-card/30 backdrop-blur-md border-white/10 shadow-lg'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Taux d'activité</CardTitle>
                            <Activity className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">Élevée</div>
                            <p className="text-xs text-muted-foreground">Basé sur la présence</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <Card className='bg-card/30 backdrop-blur-md border-white/10 shadow-lg'>
                    <CardHeader>
                        <div className='flex justify-between items-start'>
                            <div>
                                <CardTitle className='text-xl'>Liste des Membres</CardTitle>
                                <CardDescription>
                                    Gérez la présence et les profils des membres.
                                </CardDescription>
                            </div>
                             <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un membre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-background/50 pl-10 rounded-full"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {usersLoading ? (
                             <div className="flex justify-center items-center h-60">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <AnimatePresence>
                            {filteredUsers.map((user, i) => (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                <Card className="group relative overflow-hidden bg-background/50 hover:bg-background/70 transition-all duration-300">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <div className="relative mb-3">
                                            <Avatar className="w-20 h-20 border-2 shadow-sm">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <span className={cn("absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-background", user.online ? "bg-green-500" : "bg-gray-500")} />
                                        </div>
                                        <div className="font-bold truncate w-full">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.class}</div>
                                        
                                        <div className='flex gap-2 mt-4'>
                                            <Button 
                                                size="sm" 
                                                variant={user.todayPresence === 'present' ? 'default' : 'outline'}
                                                onClick={() => handlePresenceChange(user.id, 'present')}
                                                className={cn(`gap-2 text-xs h-8 px-3 rounded-full transition-all`, user.todayPresence === 'present' ? 'bg-green-500/80 hover:bg-green-500 text-white' : '')}
                                                >
                                                <Check className="h-4 w-4" /> P
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant={user.todayPresence === 'absent' ? 'destructive' : 'outline'}
                                                onClick={() => handlePresenceChange(user.id, 'absent')}
                                                className="gap-2 text-xs h-8 px-3 rounded-full transition-all"
                                            >
                                                <X className="h-4 w-4" /> A
                                            </Button>
                                        </div>
                                    </CardContent>
                                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:bg-white/10" onClick={(e) => { e.stopPropagation(); handleViewProfile(user);}}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </Card>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Add Member Dialog */}
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau membre</DialogTitle>
                        <DialogDescription>
                            Remplissez les informations ci-dessous pour créer un nouveau compte membre.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Nom et Prénom</Label>
                            <Input id="fullName" value={newMember.fullName} onChange={handleInputChange} placeholder="John Doe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="class">Classe</Label>
                            <Select onValueChange={handleClassChange} value={newMember.class}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une classe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1ère A1">1ère A1</SelectItem>
                                    <SelectItem value="1ère A22">1ère A22</SelectItem>
                                    <SelectItem value="2nde A22">2nde A22</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none gap-2">
                                    <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/langfr-250px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png" width={20} height={15} alt="Drapeau de la Côte d'Ivoire"/>
                                    <span className="text-muted-foreground">+225</span>
                                </div>
                                <Input id="phone" type="tel" value={newMember.phone} onChange={handleInputChange} placeholder="01 23 45 67 89" className="pl-24" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Annuler</Button>
                        <Button onClick={handleAddMember} disabled={isLoading} className="gap-2">
                            {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
