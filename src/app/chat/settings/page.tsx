
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase/auth/use-user'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, LogOut, Loader2, Shield, Paintbrush, RefreshCw, ChevronRight, HelpCircle, Bell, Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/firebase/provider'
import { signOut } from 'firebase/auth'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
    const router = useRouter()
    const { user, loading } = useUser()
    const auth = useAuth()

    const handleLogout = async () => {
        try {
            await signOut(auth)
            router.push('/login')
        } catch (error) {
            console.error("Error signing out: ", error)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="p-4 border-b flex items-center gap-4 bg-background sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Paramètres</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    {user && (
                        <Link href={`/chat/settings/${user?.uid}`} className="flex items-center gap-4 group">
                            <Avatar className="w-16 h-16 border">
                                <AvatarImage src={user?.photoURL || `https://avatar.vercel.sh/${user?.displayName}.png`} alt={user?.displayName || 'User'} />
                                <AvatarFallback>{user?.displayName?.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold">{user?.displayName}</h2>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}

                    <div className="space-y-6">
                         <div className="space-y-2">
                             <h3 className="text-sm font-semibold text-muted-foreground px-2">Apparence</h3>
                             <div className="bg-card rounded-lg border">
                                <SettingsItem icon={Sun} text="Thème clair/sombre" isSwitch />
                             </div>
                         </div>
                         <div className="space-y-2">
                             <h3 className="text-sm font-semibold text-muted-foreground px-2">Notifications</h3>
                             <div className="bg-card rounded-lg border">
                                <SettingsItem icon={Bell} text="Activer les notifications" isSwitch />
                             </div>
                         </div>
                         <div className="space-y-2">
                             <h3 className="text-sm font-semibold text-muted-foreground px-2">Aide</h3>
                             <div className="bg-card rounded-lg border">
                                <SettingsItem icon={HelpCircle} text="Contacter le support" href="#" />
                             </div>
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground px-2">Compte</h3>
                             <div className="bg-card rounded-lg border">
                                 <SettingsItem icon={LogOut} text="Déconnexion" onClick={handleLogout} className="text-destructive" />
                             </div>
                         </div>
                    </div>
                </div>
            </main>
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
            <span className="flex-1">{text}</span>
            {isSwitch ? <Switch /> : href ? <ChevronRight className="w-5 h-5 text-muted-foreground" /> : null}
        </div>
    )

    const commonProps = {
        className: `block hover:bg-muted/50 rounded-lg cursor-pointer ${className || ''}`,
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
