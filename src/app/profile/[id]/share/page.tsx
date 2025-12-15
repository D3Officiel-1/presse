
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase/provider';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import QRCode from "react-qr-code";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

export default function ShareProfilePage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const firestore = useFirestore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#FF2700'); // Default primary color

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const rootStyles = getComputedStyle(document.documentElement);
        const primaryHsl = rootStyles.getPropertyValue('--primary').trim();
        if (primaryHsl) {
            const [h, s, l] = primaryHsl.split(' ').map(parseFloat);
            const toHex = (c: number) => {
                const hex = Math.round(c).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            };

            const s_norm = s / 100;
            const l_norm = l / 100;
            const c = (1 - Math.abs(2 * l_norm - 1)) * s_norm;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = l_norm - c / 2;
            let r=0, g=0, b=0;

            if (h < 60) { [r,g,b] = [c,x,0]; }
            else if (h < 120) { [r,g,b] = [x,c,0]; }
            else if (h < 180) { [r,g,b] = [0,c,x]; }
            else if (h < 240) { [r,g,b] = [0,x,c]; }
            else if (h < 300) { [r,g,b] = [x,0,c]; }
            else { [r,g,b] = [c,0,x]; }

            setPrimaryColor(`#${toHex((r + m) * 255)}${toHex((g + m) * 255)}${toHex((b + m) * 255)}`);
        }
    }
  }, []);

  useEffect(() => {
    if (!firestore || !params.id) return;
    
    const fetchUser = async () => {
        const userRef = doc(firestore, 'users', params.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setUser({ id: userSnap.id, ...userSnap.data() } as User);
        } else {
            notFound();
        }
        setLoading(false);
    };

    fetchUser();
  }, [firestore, params.id]);

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${user?.id}` : '';

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    notFound();
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 bg-background">
      {/* Background Image */}
      <div className="absolute inset-0">
          <Image src={user.avatar} alt="Profile Banner" layout="fill" objectFit="cover" className="blur-2xl scale-150 opacity-30" />
          <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Header */}
       <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 rounded-full bg-background/50 backdrop-blur-sm">
          <ArrowLeft size={20} />
        </Button>
      </motion.header>

      {/* Main Content */}
       <motion.div 
        className="relative w-full max-w-sm"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
      >
        <motion.div 
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="bg-card/50 backdrop-blur-lg border border-border/20 rounded-3xl p-8 space-y-6 shadow-2xl"
        >
            <div className="text-center space-y-3">
                <Avatar className="w-20 h-20 mx-auto border-4 border-background shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-3xl">{user.name.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground text-sm">Scannez ce code pour discuter avec moi</p>
                </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-card/80 to-card/60 p-4 rounded-xl shadow-inner border border-white/10">
                <QRCode
                    value={profileUrl}
                    size={256}
                    level="H" // High error correction
                    fgColor={primaryColor}
                    bgColor="transparent"
                    viewBox={`0 0 256 256`}
                    className="w-full h-full rounded-md"
                />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                    <Image
                        src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
                        alt="Club de Presse Logo"
                        width={40}
                        height={40}
                    />
                </div>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
