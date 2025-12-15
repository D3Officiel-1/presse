
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { type User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, FileText, ChevronRight, Link as LinkIcon, File, Image as ImageIcon, AlertTriangle, Ban, Video, MessageSquare, MoreVertical, Share, Edit, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc, collection, query, where, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';


export default function ProfilePage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

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

  const startChat = async () => {
    if (!currentUser || !firestore || !user) return;
    
    const chatsRef = collection(firestore, 'chats');
    const q = query(
        chatsRef,
        where('type', '==', 'private'),
        where('members', 'array-contains', currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    let existingChatId: string | null = null;

    querySnapshot.forEach(doc => {
        const chat = doc.data();
        if (chat.members.includes(user.id)) {
            existingChatId = doc.id;
        }
    });

    if (existingChatId) {
        router.push(`/chat/${existingChatId}`);
    } else {
        try {
            const newChatDoc = await addDoc(chatsRef, {
                type: 'private',
                members: [currentUser.uid, user.id],
                lastMessage: null,
                lastMessageTimestamp: null,
                createdAt: serverTimestamp(),
            });
            router.push(`/chat/${newChatDoc.id}`);
        } catch (error) {
            console.error("Error creating new chat:", error);
        }
    }
  };


  if (loading || userLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    notFound();
    return null;
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col bg-background">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}/share`}>
                        <Share className="mr-2 h-4 w-4" />
                        Partager
                    </Link>
                </DropdownMenuItem>
                {isOwnProfile &&
                  <DropdownMenuItem onSelect={() => router.push(`/chat/settings/${user.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                  </DropdownMenuItem>
                }
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="max-w-md mx-auto w-full">
        <CardHeader className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            {user.online && (
              <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
            )}
          </div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {user.online ? 'En ligne' : 'Hors ligne'}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <Phone className="w-5 h-5" />
                <span className="sr-only">Appel audio</span>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <Video className="w-5 h-5" />
                <span className="sr-only">Appel vidéo</span>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={startChat}>
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">Message</span>
              </Button>
           </div>
           <Separator />
           {user.bio && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Biographie
              </h3>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
           )}
           {user.phone && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Téléphone
              </h3>
              <p className="text-sm text-muted-foreground">+225 {user.phone}</p>
            </div>
           )}
          <Separator />
          <Link href={`/profile/${user.id}/media`}>
            <div className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-accent cursor-pointer">
              <div className="font-semibold">Médias, liens et documents</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">0</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm w-full">
              <ImageIcon className="w-4 h-4" /> Médias
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm w-full">
              <LinkIcon className="w-4 h-4" /> Liens
            </div>
             <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm w-full">
              <File className="w-4 h-4" /> Docs
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <AlertTriangle className="mr-2" />
                Signaler {user.name}
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <Ban className="mr-2" />
                Bloquer {user.name}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
