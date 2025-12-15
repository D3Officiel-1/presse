
'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MoveRight, Loader2, User, Phone, BookUser } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';

function LoginComponent() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    class: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and redirect
    const userId = localStorage.getItem('userId');
    if (userId) {
      router.replace('/chat');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleClassChange = (value: string) => {
    setFormData({ ...formData, class: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.class || !formData.phone) {
        toast({
            variant: "destructive",
            title: "Champs incomplets",
            description: "Veuillez remplir tous les champs.",
        });
        return;
    }
    
    setIsLoading(true);

    if (!firestore) {
        toast({ variant: "destructive", title: "Erreur", description: "Service de base de données non disponible." });
        setIsLoading(false);
        return;
    }

    try {
        const usersRef = collection(firestore, 'users');
        const q = query(
            usersRef,
            where('name', '==', formData.fullName),
            where('class', '==', formData.class),
            where('phone', '==', formData.phone)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ variant: "destructive", title: "Erreur de connexion", description: "Aucun membre ne correspond à ces informations." });
            setIsLoading(false);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('deviceId', deviceId);
        }

        // The new device logs in, update the deviceId in Firestore.
        // This will trigger the onSnapshot listener on the old device, logging it out.
        await updateDoc(doc(firestore, 'users', userDoc.id), { deviceId });
        
        localStorage.setItem('userId', userDoc.id);
        localStorage.setItem('user', JSON.stringify({ uid: userDoc.id, ...userData}));


        toast({ title: "Connexion réussie!", description: "Bienvenue au Club de Presse." });
        router.push('/chat');

    } catch (error) {
        console.error("Login error: ", error);
        toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Une erreur interne est survenue. Veuillez réessayer.",
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <video
          src="https://cdn.pixabay.com/video/2018/03/03/14676-258508803_large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center">
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
        <Link href="/login">
            <Image
                src="https://i.postimg.cc/PxfxJRTJ/images-1-removebg-preview.png"
                alt="Connexion"
                width={40}
                height={40}
                className="size-10 cursor-pointer transition-transform hover:scale-110 invert"
            />
        </Link>
      </header>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-sm bg-white/10 text-white backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Connexion Membre</CardTitle>
            <CardDescription className="text-white/80">
              Accédez à votre espace membre.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-white flex items-center gap-2"><User size={16}/> Nom et Prénom</Label>
                  <Input id="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white" />
                </div>
                <div className="grid gap-2">
                   <Label htmlFor="class" className="text-white flex items-center gap-2"><BookUser size={16}/> Classe</Label>
                   <Select onValueChange={handleClassChange} value={formData.class}>
                        <SelectTrigger className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white">
                            <SelectValue placeholder="Sélectionner votre classe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1ère A1">1ère A1</SelectItem>
                            <SelectItem value="1ère A22">1ère A22</SelectItem>
                            <SelectItem value="2nde A22">2nde A22</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-white flex items-center gap-2"><Phone size={16}/> Numéro de téléphone</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none gap-2">
                        <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/langfr-250px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png" width={20} height={15} alt="Drapeau de la Côte d'Ivoire"/>
                        <span className="text-white/80">+225</span>
                    </div>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="01 23 45 67 89" className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white pl-24" />
                  </div>
                </div>
            </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full group relative overflow-hidden bg-white text-black shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            <span className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                            <span className="relative flex items-center justify-center">
                                Se connecter <MoveRight className="ml-2" />
                            </span>
                        </>
                    )}
                </Button>
              </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen w-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <LoginComponent />
    </Suspense>
  )
}
