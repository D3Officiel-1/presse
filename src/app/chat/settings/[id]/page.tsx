
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { type User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Loader2, LogOut, Edit, Phone, Mail, Shield, BookUser, Clock, MessageSquare, Video, MoreVertical, WifiOff, QrCode, Music, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { Separator } from '@/components/ui/separator';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ActionFocusView, type ActionItem } from '@/components/chat/action-focus-view';


const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

export default function UserProfilePage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser, loading: userLoading, auth } = useUser();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);
  
  const isOwnProfile = currentUser?.uid === params.id;

  useEffect(() => {
    if (!firestore || !params.id) return;

    const fetchUser = async () => {
      setLoading(true);
      const userRef = doc(firestore, 'users', params.id as string);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = { id: docSnap.id, ...docSnap.data() } as UserType;
        setUser(userData);
      } else {
        notFound();
      }
      setLoading(false);
    };

    fetchUser();
  }, [firestore, params.id]);

  const handleLogout = async () => {
    try {
        if (firestore && currentUser) {
            const userRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(userRef, { online: false, lastSeen: new Date() });
        }
        
        // Clear all relevant local storage items
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        localStorage.removeItem('deviceId');

        // Redirect to login page
        router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de se déconnecter.' });
    }
}
  const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return "jamais";
    const date = timestamp.toDate();
    if (isToday(date)) {
      return `aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`;
    }
    if (isYesterday(date)) {
      return `hier à ${format(date, 'HH:mm', { locale: fr })}`;
    }
    return `le ${format(date, 'dd/MM/yyyy à HH:mm', { locale: fr })}`;
  };
  
  const profileActions: ActionItem[] = [
    ...(isOwnProfile ? [{ icon: Edit, label: 'Modifier', action: () => router.push(`/chat/settings/${user?.id}/edit`) }] : []),
    { icon: QrCode, label: 'Code QR', action: () => router.push(`/profile/${user?.id}/share`) },
    ...(isOwnProfile ? [{ icon: LogOut, label: 'Déconnexion', action: () => {} }] : []),
  ];

  if (loading || userLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    notFound();
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {isActionMenuOpen && (
          <ActionFocusView
              title={user.name || ''}
              subtitle="Actions de profil"
              avatarUrl={user.avatar}
              avatarFallback={user.name?.substring(0, 1) || 'U'}
              mainActions={profileActions}
              onClose={() => setIsActionMenuOpen(false)}
              onLogout={handleLogout}
              toast={toast}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAvatarViewerOpen && (
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAvatarViewerOpen(false)}
            >
                <motion.div
                    layoutId={`avatar-${user.id}`}
                    className="relative w-full h-full max-w-[90vw] max-h-[90vh]"
                >
                    <Image
                        src={user.avatar}
                        alt={user.name}
                        layout="fill"
                        objectFit="contain"
                    />
                </motion.div>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={() => setIsAvatarViewerOpen(false)}>
                    <X />
                </Button>
            </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-background/80 to-transparent"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-background/50 backdrop-blur-sm">
          <ArrowLeft size={20} />
        </Button>
        {isOwnProfile && (
           <Button variant="ghost" size="icon" onClick={() => setIsActionMenuOpen(true)} className="size-9 rounded-full bg-background/50 backdrop-blur-sm">
              <MoreVertical size={20} />
            </Button>
        )}
      </motion.header>

      {/* Profile Hero Section */}
      <motion.div 
        className="relative w-full h-[45vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0">
          <Image src={user.avatar} alt="Profile Banner" layout="fill" objectFit="cover" className="blur-2xl scale-125 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
        
        <motion.div 
          className="relative flex flex-col items-center justify-end h-full pb-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div 
            variants={FADE_UP_ANIMATION_VARIANTS}
            layoutId={`avatar-${user.id}`}
            className="cursor-pointer"
            onClick={() => setIsAvatarViewerOpen(true)}
          >
            <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-5xl">{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="text-3xl md:text-4xl font-bold tracking-tight mt-4">{user.name}</motion.h1>
          
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex items-center gap-2 mt-2 text-sm">
             {user.online ? (
                <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    En ligne
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <WifiOff className="w-3 h-3" />
                    Hors ligne
                </span>
            )}
             {user.admin && (
                <>
                    <span className="text-muted-foreground">•</span>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        <Shield size={14}/>
                        <span>Admin</span>
                    </div>
                </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <main className="px-4 md:px-6 pb-8 -mt-6">
        <motion.div 
          className="max-w-2xl mx-auto space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              },
            },
          }}
        >
          {/* Action Buttons */}
          {!isOwnProfile && (
             <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex justify-center gap-2">
                <Button className='rounded-full h-12 flex-1' size="lg" onClick={() => router.push(`/chat/${user.id}`)}>
                    <MessageSquare className="w-5 h-5 mr-2" /> Message
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                  <Phone className="w-5 h-5" />
                  <span className="sr-only">Appel</span>
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                  <Video className="w-5 h-5" />
                  <span className="sr-only">Appel Vidéo</span>
                </Button>
            </motion.div>
          )}

          {/* About Card */}
          {(user.bio || user.class || user.phone) && (
            <motion.div 
                variants={FADE_UP_ANIMATION_VARIANTS} 
                className="bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4">À propos</h2>
              <div className="space-y-5">
                {user.bio && (
                  <div className="flex items-start gap-4">
                    <FileText className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm">Biographie</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">{user.bio}</p>
                    </div>
                  </div>
                )}
                {user.class && (
                  <div className="flex items-start gap-4">
                    <BookUser className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm">Classe</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">{user.class}</p>
                    </div>
                  </div>
                )}
                 {user.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm">Téléphone</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">+225 {user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Last Seen Card */}
          {!user.online && user.lastSeen && (
            <motion.div 
                variants={FADE_UP_ANIMATION_VARIANTS}
                className="bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl p-6"
            >
                <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-sm">Dernière connexion</h3>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Vu {formatLastSeen(user.lastSeen)}
                        </p>
                    </div>
                </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
