
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase/auth/use-user'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, LogOut, Loader2, Shield, Paintbrush, RefreshCw, ChevronRight, HelpCircle, Bell, Moon, Sun, KeyRound, Palette, Info, QrCode } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/firebase/provider'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { useFirestore } from '@/firebase/provider'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { User as UserType } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


export default function SettingsPage() {
    const router = useRouter()
    const { user: authUser, loading } = useUser()
    const [userData, setUserData] = useState<UserType | null>(null)
    const firestore = useFirestore()
    const { toast } = useToast()
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    useEffect(() => {
        if (authUser && firestore) {
            const userRef = doc(firestore, 'users', authUser.uid);
            const unsub = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    setUserData({ id: doc.id, ...doc.data() } as UserType);
                }
            });
            return () => unsub();
        }
    }, [authUser, firestore]);

    const handleLogout = async () => {
        if (!firestore || !authUser) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de se déconnecter pour le moment."
            });
            return;
        }

        try {
            const userRef = doc(firestore, 'users', authUser.uid);
            await updateDoc(userRef, { online: false, lastSeen: new Date() });
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            localStorage.removeItem('deviceId');
            router.push('/login');
            toast({ description: "Vous avez été déconnecté." });
        } catch (error) {
            console.error("Error signing out: ", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de se déconnecter.' });
        } finally {
            setIsLogoutDialogOpen(false);
        }
    }

    if (loading || !userData) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Paramètres</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-8">
                    {userData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="relative group w-full overflow-hidden rounded-2xl shadow-lg"
                        >
                             <div className="absolute inset-0">
                                <Image 
                                    src={userData?.avatar || `https://avatar.vercel.sh/${userData?.name}.png`} 
                                    alt="Profile background" 
                                    layout="fill"
                                    objectFit="cover"
                                    className="blur-xl scale-125 opacity-30"
                                />
                                <div className="absolute inset-0 bg-black/30" />
                            </div>

                            <div className="relative flex flex-col items-center justify-center p-8 text-center text-white">
                                <Link href={`/chat/settings/${userData?.id}`} className="block">
                                    <Avatar className="w-24 h-24 border-4 border-background/50 shadow-2xl transition-transform group-hover:scale-105">
                                        <AvatarImage src={userData?.avatar} alt={userData?.name || 'User'} />
                                        <AvatarFallback className="text-4xl">{userData?.name?.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <h2 className="text-2xl font-bold mt-4 drop-shadow-md">{userData?.name}</h2>
                                <p className="text-sm text-white/80 drop-shadow-md">{authUser?.email}</p>
                            </div>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                                onClick={() => router.push(`/profile/${userData?.id}/share`)}
                            >
                                <QrCode className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                    <div className="space-y-6">
                         <div className="space-y-2">
                             <h3 className="text-sm font-semibold text-muted-foreground px-2">Général</h3>
                             <div className="bg-card rounded-xl border divide-y divide-border">
                                <SettingsItem icon={KeyRound} text="Compte" href="/chat/settings/account" />
                                <SettingsItem icon={Bell} text="Notifications et sons" href="/chat/settings/notifications" />
                                <SettingsItem icon={Palette} text="Apparence" href="/chat/settings/appearance" />
                             </div>
                         </div>
                         
                         <div className="space-y-2">
                             <h3 className="text-sm font-semibold text-muted-foreground px-2">Aide & Support</h3>
                             <div className="bg-card rounded-xl border divide-y divide-border">
                                <SettingsItem icon={HelpCircle} text="Centre d'aide" href="/chat/settings/help" />
                                <SettingsItem icon={Info} text="À propos" href="/chat/settings/about" />
                             </div>
                         </div>
                         
                         <div className="space-y-2">
                             <div className="bg-card rounded-xl border">
                                 <SettingsItem icon={LogOut} text="Déconnexion" onClick={() => setIsLogoutDialogOpen(true)} className="text-destructive font-semibold" />
                             </div>
                         </div>
                    </div>
                </div>
            </main>
            
            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                            <LogOut className="h-6 w-6 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl">Êtes-vous sûr de vouloir vous déconnecter ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Vous devrez vous reconnecter pour accéder à nouveau à vos discussions. Cette action mettra fin à votre session actuelle.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center flex-row gap-2 pt-4">
                        <AlertDialogCancel className="flex-1">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 flex-1">
                            Déconnexion
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

interface SettingsItemProps {
    icon: React.ElementType
    text: string
    href?: string
    isSwitch?: boolean
    onClick?: () => void;
    className?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon: Icon, text, href, isSwitch, onClick, className }) => {
    const content = (
        <div className="flex items-center p-4">
            <Icon className="w-5 h-5 mr-4 text-muted-foreground" />
            <span className="flex-1 font-medium">{text}</span>
            {href && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
        </div>
    )

    const commonProps = {
        className: `block hover:bg-muted/50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${className || ''}`,
        onClick: onClick,
    };

    if (href) {
        return (
            <Link href={href} {...commonProps}>
                {content}
            </Link>
        )
    }

    return <div {...commonProps}>{content}</div>
}
