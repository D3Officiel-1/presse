
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { type User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Loader2, Phone, BookUser, Camera, Save, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { ImageCropper } from '@/components/chat/image-cropper';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.3 } },
};

export default function EditProfilePage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser, loading: userLoading } = useUser();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const isOwnProfile = currentUser?.uid === params.id;

  useEffect(() => {
    if (!firestore || !params.id) return;

    if (!userLoading && !isOwnProfile) {
        toast({ variant: 'destructive', title: 'Accès non autorisé' });
        router.back();
        return;
    }

    const fetchUser = async () => {
      setLoading(true);
      const userRef = doc(firestore, 'users', params.id as string);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = { id: docSnap.id, ...docSnap.data() } as UserType;
        setUser(userData);
        setEditedUser(userData);
      } else {
        notFound();
      }
      setLoading(false);
    };

    fetchUser();
  }, [firestore, params.id, currentUser, userLoading, isOwnProfile, router, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    setIsSaving(true);
    const userRef = doc(firestore, 'users', user.id);
    try {
        await updateDoc(userRef, editedUser);
        setUser(prev => prev ? { ...prev, ...editedUser } : null);
        toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées avec succès.' });
        router.back();
    } catch(error) {
        console.error("Error updating profile:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le profil.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedUser(prev => ({...prev, [e.target.id]: e.target.value}));
  }
  
  const handleClassChange = (value: string) => {
    setEditedUser({ ...editedUser, class: value });
  };
  
  const handleAvatarChangeClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Fichier non supporté', description: 'Veuillez sélectionner une image.' });
        return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  };
  
  const handleCroppedImage = async (imageBlob: Blob | null) => {
    setCropperOpen(false);
    if (!imageBlob) return;

    setIsUploading(true);
    toast({ title: 'Téléchargement...', description: "Votre nouvelle photo est en cours d'envoi." });

    const formData = new FormData();
    formData.append('file', imageBlob, 'profile.webp');
    formData.append('upload_preset', 'predict_uploads'); // Use your Cloudinary upload preset

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dlxomrluy/image/upload', { // Replace with your Cloudinary cloud name
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Cloudinary upload failed');
        }

        const data = await response.json();
        const newAvatarUrl = data.secure_url;
        
        setEditedUser(prev => ({...prev, avatar: newAvatarUrl}));
        toast({ title: 'Photo mise à jour', description: 'Cliquez sur "Enregistrer" pour finaliser.' });
    } catch (error) {
        console.error("Error uploading to Cloudinary: ", error);
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'envoyer la photo." });
    } finally {
        setIsUploading(false);
    }
  };


  if (loading || userLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || !isOwnProfile) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

      {imageToCrop && (
          <ImageCropper 
              imageSrc={imageToCrop}
              open={cropperOpen}
              onOpenChange={setCropperOpen}
              onCropped={handleCroppedImage}
          />
      )}

      <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className='flex items-center gap-2'>
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Modifier le profil</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className='w-4 h-4 mr-2' />}
            Enregistrer
        </Button>
      </header>

      <main className="flex-1 overflow-auto">
        <form onSubmit={handleSave} className="max-w-2xl mx-auto p-4 md:p-6 space-y-8">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={FADE_UP_ANIMATION_VARIANTS}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                        <AvatarImage src={editedUser.avatar || ''} alt={editedUser.name} />
                        <AvatarFallback className="text-5xl">{editedUser.name?.substring(0, 2)}</AvatarFallback>
                         {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        )}
                    </Avatar>
                    <Button 
                        type="button" 
                        size="icon" 
                        className="absolute bottom-1 right-1 rounded-full h-9 w-9"
                        onClick={handleAvatarChangeClick}
                        disabled={isUploading}
                    >
                        <Camera className='w-4 h-4'/>
                    </Button>
                </div>
            </motion.div>
          
            <motion.div 
              className='space-y-6'
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1
                  },
                },
              }}
            >
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-2">
                <Label htmlFor="name" className='flex items-center gap-2 text-muted-foreground'><User className='w-4 h-4'/>Nom complet</Label>
                <Input id="name" value={editedUser.name || ''} onChange={handleInputChange} placeholder="Ex: John Doe" className='text-base h-11' />
              </motion.div>
              
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-2">
                <Label htmlFor="bio" className='flex items-center gap-2 text-muted-foreground'><FileText className='w-4 h-4'/>Biographie</Label>
                <Textarea id="bio" value={editedUser.bio || ''} onChange={handleInputChange} placeholder="Parlez un peu de vous..." className="min-h-[120px] text-base" />
              </motion.div>
              
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-2">
                  <Label htmlFor="phone" className='flex items-center gap-2 text-muted-foreground'><Phone className='w-4 h-4'/>Téléphone</Label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none gap-2">
                          <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/langfr-250px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png" width={20} height={15} alt="Drapeau de la Côte d'Ivoire"/>
                          <span className="text-muted-foreground">+225</span>
                      </div>
                      <Input id="phone" type="tel" value={editedUser.phone || ''} onChange={handleInputChange} placeholder="01 23 45 67 89" className="pl-24 text-base h-11" />
                    </div>
              </motion.div>
              
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-2">
                  <Label htmlFor="class" className='flex items-center gap-2 text-muted-foreground'><BookUser className='w-4 h-4'/>Classe</Label>
                  <Select onValueChange={handleClassChange} value={editedUser.class || ''}>
                    <SelectTrigger className='text-base h-11'>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1ère A1">1ère A1</SelectItem>
                      <SelectItem value="1ère A22">1ère A22</SelectItem>
                      <SelectItem value="2nde A22">2nde A22</SelectItem>
                    </SelectContent>
                  </Select>
              </motion.div>

            </motion.div>
        </form>
      </main>
    </div>
  );
}
