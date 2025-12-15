'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link as LinkIcon, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Message, User } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';

export default function SharedMediaPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const [user, setUser] = useState<User | null>(null);
  const [mediaMessages, setMediaMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !currentUser || !params.id) return;

    const fetchUserDataAndMedia = async () => {
      setLoading(true);

      // Fetch user data
      const userRef = doc(firestore, 'users', params.id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser({ id: userSnap.id, ...userSnap.data() } as User);
      } else {
        notFound();
        return;
      }

      // Find the private chat between the two users
      const chatsRef = collection(firestore, 'chats');
      const chatQuery = query(
        chatsRef,
        where('type', '==', 'private'),
        where('members', 'in', [[currentUser.uid, params.id], [params.id, currentUser.uid]])
      );
      
      const chatSnap = await getDocs(chatQuery);
      
      if (!chatSnap.empty) {
        const chatDoc = chatSnap.docs[0];
        const messagesRef = collection(firestore, 'chats', chatDoc.id, 'messages');
        const mediaQuery = query(messagesRef, where('type', '==', 'image'));
        const mediaSnap = await getDocs(mediaQuery);
        
        const mediaList = mediaSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMediaMessages(mediaList);
      }
      
      setLoading(false);
    };

    fetchUserDataAndMedia();

  }, [firestore, currentUser, params.id]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    notFound();
    return null;
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Médias, liens & docs</h1>
            <p className="text-sm text-muted-foreground">avec {user.name}</p>
        </div>
      </div>
      
      <Tabs defaultValue="media" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="media">
            <ImageIcon className="w-4 h-4 mr-2" />
            Médias
          </TabsTrigger>
          <TabsTrigger value="links">
            <LinkIcon className="w-4 h-4 mr-2" />
            Liens
          </TabsTrigger>
          <TabsTrigger value="docs">
            <File className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="media" className="flex-1 overflow-auto mt-4">
          {mediaMessages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {mediaMessages.map(msg => (
                <div key={msg.id} className="aspect-square relative rounded-md overflow-hidden">
                  <Image src={msg.content} alt="Média partagé" fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold">Aucun média partagé</h3>
              <p className="text-sm">Les photos et vidéos que vous partagez avec {user.name} apparaîtront ici.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="links" className="flex-1">
           <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <LinkIcon className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold">Aucun lien partagé</h3>
              <p className="text-sm">Les liens que vous partagez avec {user.name} apparaîtront ici.</p>
            </div>
        </TabsContent>
        <TabsContent value="docs" className="flex-1">
           <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <File className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold">Aucun document partagé</h3>
              <p className="text-sm">Les documents que vous partagez avec {user.name} apparaîtront ici.</p>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
