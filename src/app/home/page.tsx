
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in and redirect
    const userId = localStorage.getItem('userId');
    if (userId) {
      router.replace('/chat');
    }
  }, [router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
        <video
          src="https://cdn.pixabay.com/video/2018/03/03/14676-258508803_large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-black/70 -z-10" />

      <header className="fixed top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-20 bg-black/10 backdrop-blur-sm">
        <motion.div
            initial="hidden"
            animate="visible"
            variants={FADE_UP_ANIMATION_VARIANTS}
        >
        <Link href="/home" className="flex items-center gap-2">
            <Image
              src="https://i.postimg.cc/fbtSZFWz/icon-256x256.png"
              alt="Club de Presse Logo"
              width={32}
              height={32}
              className="size-8 text-white"
            />
            <span className="font-bold text-lg tracking-tight text-white">
                Club de Presse
            </span>
        </Link>
        </motion.div>
         <motion.div
              initial="hidden"
              animate="visible"
              variants={FADE_UP_ANIMATION_VARIANTS}
          >
            <Link href="/login">
                <Image
                    src="https://i.postimg.cc/PxfxJRTJ/images-1-removebg-preview.png"
                    alt="Connexion"
                    width={40}
                    height={40}
                    className="size-10 cursor-pointer transition-transform hover:scale-110 invert"
                />
            </Link>
        </motion.div>
      </header>
      
      <div className="container mx-auto flex items-center justify-center min-h-screen relative z-10 px-4">
        <motion.div 
            className="space-y-6 text-center"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
        >
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="inline-block bg-white/10 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                L'exclusivité au service de l'information
            </motion.div>
            <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-lg">
                Bienvenue au Club de Presse
            </motion.h1>
            <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                L'espace de collaboration définitif pour les membres du Club de Presse. Échangez, innovez et façonnez l'actualité de demain.
            </motion.p>
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex gap-4 justify-center">
                <Link href="/login">
                <Button size="lg" className="group relative overflow-hidden bg-white text-black shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl h-12 text-base px-8">
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                    <span className="relative flex items-center">
                        Rejoindre le club <MoveRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                </Button>
                </Link>
            </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
