
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, CheckCheck, User, AtSign, Globe, Users, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PrivacyOption = 'everyone' | 'contacts' | 'nobody';

interface Setting {
  id: keyof PrivacySettings;
  icon: React.ElementType;
  title: string;
  description: string;
  options: { value: PrivacyOption; label: string }[];
}

interface PrivacySettings {
  lastSeen: PrivacyOption;
  profilePhoto: PrivacyOption;
  bio: PrivacyOption;
  groups: PrivacyOption;
  readReceipts: boolean;
}

const settings: Setting[] = [
  {
    id: 'lastSeen',
    icon: Eye,
    title: 'Présence en ligne',
    description: 'Qui peut voir quand vous êtes en ligne ou votre dernière connexion.',
    options: [
      { value: 'everyone', label: 'Tout le monde' },
      { value: 'contacts', label: 'Mes contacts' },
      { value: 'nobody', label: 'Personne' },
    ],
  },
  {
    id: 'profilePhoto',
    icon: User,
    title: 'Photo de profil',
    description: 'Qui peut voir votre photo de profil.',
    options: [
      { value: 'everyone', label: 'Tout le monde' },
      { value: 'contacts', label: 'Mes contacts' },
      { value: 'nobody', label: 'Personne' },
    ],
  },
  {
    id: 'bio',
    icon: AtSign,
    title: 'Biographie',
    description: 'Qui peut lire votre biographie.',
    options: [
      { value: 'everyone', label: 'Tout le monde' },
      { value: 'contacts', label: 'Mes contacts' },
      { value: 'nobody', label: 'Personne' },
    ],
  },
    {
    id: 'groups',
    icon: Users,
    title: 'Ajout aux groupes',
    description: 'Qui peut vous ajouter à des groupes de discussion.',
    options: [
      { value: 'everyone', label: 'Tout le monde' },
      { value: 'contacts', label: 'Mes contacts' },
    ],
  },
];

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

function SettingCard({ setting, value, onValueChange }: { setting: Setting, value: PrivacyOption, onValueChange: (value: PrivacyOption) => void }) {
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (y / rect.height - 0.5) * -15; // Invert for natural feel
    const rotateY = (x / rect.width - 0.5) * 15;
    e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  return (
    <motion.div
      variants={FADE_UP_ANIMATION_VARIANTS}
      className="setting-card relative bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-transform duration-300 ease-out"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1">
            <setting.icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{setting.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
          <div className="mt-4 flex items-center gap-2 bg-black/20 p-1 rounded-full border border-white/10">
            {setting.options.map(option => (
              <button
                key={option.value}
                onClick={() => onValueChange(option.value)}
                className={cn(
                  'flex-1 text-center text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300',
                  value === option.value ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-white/10'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [settings, setPrivacySettings] = useState<PrivacySettings>({
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        bio: 'everyone',
        groups: 'everyone',
        readReceipts: true,
    });
    
    useEffect(() => {
        setIsClient(true);
        const savedSettings = localStorage.getItem('privacySettings');
        if (savedSettings) {
            setPrivacySettings(JSON.parse(savedSettings));
        }
    }, []);

    const updateSetting = <T extends keyof PrivacySettings>(key: T, value: PrivacySettings[T]) => {
        setPrivacySettings(prev => {
            const newSettings = { ...prev, [key]: value };
            if (isClient) {
                localStorage.setItem('privacySettings', JSON.stringify(newSettings));
            }
            return newSettings;
        });
    };
    
    const handleSave = () => {
        toast({
          title: "Paramètres enregistrés",
          description: "Vos préférences de confidentialité ont été mises à jour.",
        })
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-black to-background -z-10 animate-gradient-xy"/>

            <header className="p-4 flex items-center justify-between sticky top-0 z-10 shrink-0 bg-background/30 backdrop-blur-xl border-b border-white/5">
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="font-bold text-xl tracking-tight">Confidentialité</h1>
                </div>
                 <Button onClick={handleSave} size="sm" className="rounded-full">
                    Enregistrer
                 </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                    >
                        {settings.map((setting) => (
                            <div className="mb-6" key={setting.id}>
                                <SettingCard
                                  setting={setting}
                                  value={isClient ? (settings[setting.id] as PrivacyOption) : 'everyone'}
                                  onValueChange={(value) => updateSetting(setting.id, value)}
                                />
                            </div>
                        ))}
                        
                        <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
                            <div className="setting-card relative bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-transform duration-300 ease-out">
                              <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <CheckCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-foreground">Confirmations de lecture</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Si désactivé, vous ne verrez pas les confirmations des autres.
                                  </p>
                                </div>
                                <div className="mt-1">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isClient ? settings.readReceipts : true}
                                      onChange={(e) => updateSetting('readReceipts', e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-black/20 border border-white/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

    