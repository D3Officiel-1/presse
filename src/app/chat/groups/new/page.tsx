
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { type User as UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Users, Check, X, Camera, Loader2, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { handleCreateGroup } from '@/lib/chat-action';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageCropper } from '@/components/chat/image-cropper';

export default function NewGroupPage() {
    const router = useRouter();
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [groupName, setGroupName] = useState('');
    const [groupAvatar, setGroupAvatar] = useState<string | undefined>();
    const [isUploading, setIsUploading] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!firestore || !currentUser) return;
        
        const usersCol = collection(firestore, 'users');
        const q = query(usersCol, where('__name__', '!=', currentUser.uid));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
            setAllUsers(usersList.sort((a, b) => a.name.localeCompare(b.name)));
            setLoadingUsers(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoadingUsers(false);
        });
    
        return () => unsubscribe();
    }, [firestore, currentUser]);

    const handleNextStep = () => {
        if (!groupName.trim()) {
            toast({ variant: 'destructive', description: "Le nom du groupe ne peut pas être vide." });
            return;
        }
        setStep(2);
    };

    const toggleUserSelection = (user: UserType) => {
        setSelectedUsers(prev =>
            prev.some(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        );
    };
    
    const onCreateGroup = async () => {
        if (selectedUsers.length === 0) {
            toast({ variant: 'destructive', description: "Veuillez sélectionner au moins un membre." });
            return;
        }
        setIsCreating(true);
        const selectedUserIds = selectedUsers.map(u => u.id);
        await handleCreateGroup(groupName, selectedUserIds, currentUser, firestore, router, groupAvatar);
        setIsCreating(false);
    };

    const handleAvatarChangeClick = () => fileInputRef.current?.click();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCroppedImage = async (imageBlob: Blob | null) => {
        setCropperOpen(false);
        if (!imageBlob) return;
        setIsUploading(true);
        toast({ title: 'Téléchargement...', description: "Votre nouvelle photo est en cours d'envoi." });

        const formData = new FormData();
        formData.append('file', imageBlob, 'group_avatar.webp');
        formData.append('upload_preset', 'predict_uploads');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dlxomrluy/image/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setGroupAvatar(data.secure_url);
            toast({ title: 'Photo de groupe mise à jour !' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'envoyer la photo." });
        } finally {
            setIsUploading(false);
        }
    };


    const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-background">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            {imageToCrop && <ImageCropper imageSrc={imageToCrop} open={cropperOpen} onOpenChange={setCropperOpen} onCropped={handleCroppedImage} />}
            <header className="p-4 border-b flex items-center gap-4 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => step === 1 ? router.back() : setStep(1)} className="size-9">
                    <ArrowLeft size={20} />
                </Button>
                <div className='flex flex-col'>
                    <h1 className="font-semibold text-xl tracking-tight">Nouveau groupe</h1>
                    <p className="text-sm text-muted-foreground">
                        {step === 1 ? "Étape 1 sur 2 : Informations du groupe" : "Étape 2 sur 2 : Ajouter des membres"}
                    </p>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: step === 1 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: step === 1 ? 50 : -50 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex-1 overflow-auto"
                >
                    {step === 1 && (
                        <div className="p-6 max-w-md mx-auto space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                                        <AvatarImage src={groupAvatar} />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            <Users className="w-12 h-12" />
                                        </AvatarFallback>
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                                            </div>
                                        )}
                                    </Avatar>
                                     <Button type="button" size="icon" className="absolute bottom-1 right-1 rounded-full h-9 w-9" onClick={handleAvatarChangeClick}>
                                        <Camera className='w-4 h-4'/>
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Nom du groupe"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="h-12 text-lg text-center bg-muted/50 border-0 focus-visible:ring-primary"
                                />
                            </div>
                            <Button onClick={handleNextStep} className="w-full h-12 text-base">
                                Étape suivante
                            </Button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Rechercher un membre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <AnimatePresence>
                                {selectedUsers.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-4 border-b overflow-hidden"
                                    >
                                        <div className="flex flex-wrap gap-3">
                                            {selectedUsers.map(user => (
                                                <div key={user.id} className="relative group">
                                                    <Avatar className="w-14 h-14">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>{user.name.substring(0, 1)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => toggleUserSelection(user)}>
                                                        <X className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                                {loadingUsers ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        <p className="mt-2">Chargement des membres...</p>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-2">
                                        {filteredUsers.map(user => (
                                            <div key={user.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => toggleUserSelection(user)}>
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name.substring(0, 1)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.class}</p>
                                                </div>
                                                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", selectedUsers.some(u => u.id === user.id) ? 'bg-primary border-primary' : 'border-muted-foreground')}>
                                                    {selectedUsers.some(u => u.id === user.id) && <Check className="w-4 h-4 text-primary-foreground" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            <footer className="p-4 border-t sticky bottom-0 bg-background">
                                <Button className="w-full h-12 text-base" onClick={onCreateGroup} disabled={isCreating}>
                                    {isCreating ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2" />}
                                    Créer le groupe ({selectedUsers.length} membres)
                                </Button>
                            </footer>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
