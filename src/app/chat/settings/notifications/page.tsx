
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Volume2, Vibrate } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const SettingsItem = ({ icon: Icon, title, description, checked, onCheckedChange }: { icon: React.ElementType, title: string, description: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
                <span className="font-medium">{title}</span>
                <span className="text-sm text-muted-foreground">{description}</span>
            </div>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
);

export default function NotificationsPage() {
    const router = useRouter();

    // Use a single state object for all settings
    const [settings, setSettings] = useState({
        allNotifications: true,
        inAppSounds: true,
        vibrate: true,
    });
    const [isClient, setIsClient] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        setIsClient(true);
        try {
            const storedSettings = localStorage.getItem('notification-settings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (error) {
            console.error("Failed to parse notification settings from localStorage", error);
        }
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (isClient) {
            localStorage.setItem('notification-settings', JSON.stringify(settings));
        }
    }, [settings, isClient]);

    const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="p-4 border-b flex items-center gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-semibold text-xl tracking-tight">Notifications et Sons</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6">
                 <div className="max-w-2xl mx-auto">
                    <Card>
                        <div className="divide-y divide-border">
                            <SettingsItem 
                                icon={Bell}
                                title="Notifications des messages"
                                description="Recevoir des notifications pour les nouveaux messages."
                                checked={settings.allNotifications}
                                onCheckedChange={(value) => handleSettingChange('allNotifications', value)}
                            />
                            <SettingsItem 
                                icon={Volume2}
                                title="Sons dans l'application"
                                description="Émettre un son pour les messages entrants et sortants."
                                checked={settings.inAppSounds}
                                onCheckedChange={(value) => handleSettingChange('inAppSounds', value)}
                            />
                            <SettingsItem 
                                icon={Vibrate}
                                title="Vibreur"
                                description="Faire vibrer l'appareil à la réception d'une notification."
                                checked={settings.vibrate}
                                onCheckedChange={(value) => handleSettingChange('vibrate', value)}
                            />
                        </div>
                    </Card>
                 </div>
            </main>
        </div>
    );
}
