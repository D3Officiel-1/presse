
'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp,
  limit,
  where,
  getDocs,
} from 'firebase/firestore';
import type { Chat as ChatType, Message as MessageType, User as UserType } from '@/lib/types';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages, type ReplyInfo } from '@/components/chat/chat-messages';
import { Loader2 } from 'lucide-react';
import { ChatTopbar } from '@/components/chat/chat-topbar';
import { useToast } from '@/hooks/use-toast';

function ChatPageContent() {
  const params = useParams() as { id: string };
  const chatId = params.id;
  const { user: currentUser, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [chatData, setChatData] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [usersData, setUsersData] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);
  const [replyInfo, setReplyInfo] = useState<ReplyInfo | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser && firestore) {
      const userRef = doc(firestore, 'users', currentUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().admin === true) {
          setIsAdmin(true);
        }
      });
    }
  }, [currentUser, firestore]);

  // Fetch Chat and Users Data
  useEffect(() => {
    if (!firestore || !chatId || !currentUser) return;

    setLoading(true);
    const chatRef = doc(firestore, 'chats', chatId);

    const unsubscribeChat = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const chat = { id: docSnap.id, ...docSnap.data() } as ChatType;
        if (!chat.members.includes(currentUser.uid) && chat.type !== 'community') {
            toast({ variant: 'destructive', title: 'Accès non autorisé' });
            router.push('/chat');
            return;
        }
        setChatData(chat);

        const userIds = new Set(chat.members);
        if (chat.type === 'community') {
            // In a community, members might not be listed. We'll fetch users as they appear in messages.
        } else {
             userIds.add(currentUser.uid); // ensure current user is included
        }
        
        if (userIds.size > 0) {
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', Array.from(userIds)));
            onSnapshot(usersQuery, (usersSnap) => {
                const fetchedUsers: { [key: string]: UserType } = {};
                usersSnap.forEach(userDoc => {
                    fetchedUsers[userDoc.id] = { id: userDoc.id, ...userDoc.data() } as UserType;
                });
                setUsersData(prev => ({...prev, ...fetchedUsers}));
            });
        }
      } else {
        toast({ variant: 'destructive', title: 'Discussion non trouvée' });
        router.push('/chat');
      }
    });

    return () => unsubscribeChat();
  }, [firestore, chatId, currentUser, router, toast]);

  // Fetch Messages
  useEffect(() => {
    if (!firestore || !chatId) return;

    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: MessageType[] = [];
      const userIdsToFetch = new Set<string>();

      querySnapshot.forEach(doc => {
        const message = { id: doc.id, ...doc.data() } as MessageType;
        if (currentUser && !message.deletedFor?.includes(currentUser.uid)) {
            msgs.push(message);
            if (!usersData[message.senderId]) {
                 userIdsToFetch.add(message.senderId);
            }
             if (message.type === 'contact' && message.content && !usersData[message.content]) {
                userIdsToFetch.add(message.content);
            }
        }
      });
      
      const msgsWithContactData = msgs.map(msg => {
          if (msg.type === 'contact' && msg.content && usersData[msg.content]) {
              return { ...msg, contactData: usersData[msg.content] };
          }
          return msg;
      });
      setMessages(msgsWithContactData);
      
      // Fetch sender data if not already present (especially for community chats)
      if (userIdsToFetch.size > 0) {
          const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', Array.from(userIdsToFetch)));
           getDocs(usersQuery).then(usersSnap => {
              const fetchedUsers: { [key: string]: UserType } = {};
              usersSnap.forEach(userDoc => {
                  fetchedUsers[userDoc.id] = { id: userDoc.id, ...userDoc.data() } as UserType;
              });
              setUsersData(prev => ({...prev, ...fetchedUsers}));
           });
      }

      setLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
    });

    return () => unsubscribeMessages();
  }, [firestore, chatId, currentUser, usersData]);
  
  // Fetch all users for sharing functionality
    useEffect(() => {
        if (!firestore) return;
        const usersCol = collection(firestore, 'users');
        const unsubscribe = onSnapshot(usersCol, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
             const usersMap = usersList.reduce((acc, user) => {
                acc[user.id] = user;
                return acc;
            }, {} as { [key: string]: UserType });
            setUsersData(prev => ({...prev, ...usersMap}));
        });
        return () => unsubscribe();
    }, [firestore]);


  // Mark messages as read
  useEffect(() => {
    if (firestore && chatId && currentUser && messages.length > 0) {
      const chatRef = doc(firestore, 'chats', chatId);
      const unreadCount = chatData?.unreadCounts?.[currentUser.uid] ?? 0;
      if (unreadCount > 0) {
        updateDoc(chatRef, {
          [`unreadCounts.${currentUser.uid}`]: 0,
        });
      }
    }
  }, [firestore, chatId, currentUser, messages, chatData]);
  
  const otherUser = useMemo(() => {
    if (!chatData || !currentUser || chatData.type !== 'private') return undefined;
    const otherUserId = chatData.members.find(uid => uid !== currentUser.uid);
    return otherUserId ? usersData[otherUserId] : undefined;
  }, [chatData, currentUser, usersData]);

  const handleSendMessage = async (content: string, type: MessageType['type'] = 'text', metadata: any = {}) => {
    if (!firestore || !currentUser || !chatId) return;

    let finalContent = content;
    if (type === 'location') {
        const [lat, lon] = content.split(',');
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        finalContent = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=256x256&markers=color:red%7C${lat},${lon}&key=${apiKey}`;
    }

    let messageData: Partial<MessageType> = {
      chatId,
      senderId: currentUser.uid,
      content: finalContent,
      timestamp: serverTimestamp() as Timestamp,
      type,
      readBy: [currentUser.uid],
      ...(replyInfo && { replyTo: { messageId: replyInfo.id, senderName: replyInfo.sender.name, message: replyInfo.content } }),
    };
    
    if (type === 'audio' && metadata.duration) {
      messageData.audioMetadata = { duration: metadata.duration };
    }
     if (type === 'contact' && metadata.contactData) {
      messageData.contactData = metadata.contactData;
    }
     if (type === 'document' && metadata.fileName) {
      messageData.documentMetadata = { fileName: metadata.fileName, fileSize: metadata.fileSize, fileType: metadata.fileType };
    }
    
    // Add message to subcollection
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    await addDoc(messagesRef, messageData);

    // Update last message on chat document
    const chatRef = doc(firestore, 'chats', chatId);
    const batch = writeBatch(firestore);
    
    let lastMessageContent = content;
    if (type === 'contact' && metadata.contactData) {
      lastMessageContent = `${currentUser.displayName} a partagé le contact de ${metadata.contactData.name}.`;
    } else if (type === 'document' && metadata.fileName) {
        lastMessageContent = `📄 ${metadata.fileName}`;
    } else if (type === 'location') {
        lastMessageContent = `📍 Position partagée`;
    }


    batch.update(chatRef, {
      lastMessage: { content: lastMessageContent, type, senderId: currentUser.uid },
      lastMessageTimestamp: serverTimestamp(),
    });

    // Increment unread counts for other members
    chatData?.members.forEach(memberId => {
      if (memberId !== currentUser.uid) {
        const currentCount = chatData.unreadCounts?.[memberId] || 0;
        batch.update(chatRef, { [`unreadCounts.${memberId}`]: currentCount + 1 });
      }
    });

    await batch.commit();
    setReplyInfo(undefined);
  };
  
    const handleShareMessage = async (message: MessageType, userIds: string[]) => {
        if (!firestore || !currentUser) return;

        const sender = usersData[message.senderId] || { name: 'Quelqu\'un' };

        userIds.forEach(async (userId) => {
            // Find existing private chat
            const chatsRef = collection(firestore, 'chats');
            const chatQuery = query(chatsRef, 
                where('type', '==', 'private'),
                where('members', 'array-contains', currentUser.uid)
            );
            const chatSnap = await getDocs(chatQuery);
            
            let targetChatId: string | null = null;
            let targetChatData: ChatType | null = null;

            chatSnap.forEach(doc => {
              const chat = doc.data();
              if (chat.members.includes(userId)) {
                targetChatId = doc.id;
                targetChatData = chat as ChatType;
              }
            });


            if (!targetChatId) {
                // Create new chat if it doesn't exist
                const newChatDoc = await addDoc(chatsRef, {
                    type: 'private',
                    members: [currentUser.uid, userId].sort(),
                    createdAt: serverTimestamp(),
                    unreadCounts: { [currentUser.uid]: 0, [userId]: 0 },
                    typing: { [currentUser.uid]: false, [userId]: false },
                });
                targetChatId = newChatDoc.id;
            }

            // Send the message
            const messagesRef = collection(firestore, 'chats', targetChatId);
            await addDoc(messagesRef, {
                chatId: targetChatId,
                senderId: currentUser.uid,
                content: message.content, // Forward original content
                type: message.type,
                timestamp: serverTimestamp(),
                readBy: [currentUser.uid],
                // Add a marker that this is a forwarded message
                forwardedFrom: {
                    senderName: sender.name,
                    chatId: message.chatId
                }
            });

             // Update last message and unread count
            const chatRef = doc(firestore, 'chats', targetChatId);
            await updateDoc(chatRef, {
                lastMessage: { content: message.content, type: message.type, senderId: currentUser.uid },
                lastMessageTimestamp: serverTimestamp(),
                [`unreadCounts.${userId}`]: (targetChatData?.unreadCounts?.[userId] || 0) + 1,
            });
        });

        toast({
            title: 'Message transféré',
            description: `Le message a été envoyé à ${userIds.length} membre(s).`,
        });
    };

  const handleDeleteForMe = async (messageId: string) => {
    if (!firestore || !chatId || !currentUser) return;
    const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, { deletedFor: arrayUnion(currentUser.uid) });
    toast({ description: 'Message supprimé pour vous.' });
  };
  
  const handleDeleteForEveryone = async (messageId: string) => {
    if (!firestore || !chatId) return;
    const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
      content: "Ce message a été supprimé",
      type: 'text'
    });
    toast({ description: 'Message supprimé pour tout le monde.' });
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!firestore || !chatId) return;
    const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
      content: newContent,
      editedAt: serverTimestamp(),
    });
    toast({ description: 'Message modifié.' });
  };

  const handleToggleStar = async (messageId: string, isStarred: boolean) => {
    if (!firestore || !chatId || !currentUser) return;
    const msgRef = doc(firestore, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
        starredBy: isStarred ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    });
    toast({ description: isStarred ? 'Message retiré des favoris.' : 'Message ajouté aux favoris.' });
  }

  const handleReply = (message: MessageType) => {
      const sender = usersData[message.senderId] || message.sender;
      if (sender) {
        setReplyInfo({ ...message, sender });
      }
  };

  const handleTogglePin = async (message: MessageType, isPinned: boolean) => {
    if (!firestore || !chatData || !isAdmin || chatData.type !== 'community') return;
    
    const chatRef = doc(firestore, 'chats', chatData.id);
    try {
      await updateDoc(chatRef, {
        pinnedMessages: isPinned ? arrayRemove(message) : arrayUnion(message)
      });
      toast({ description: isPinned ? 'Message désépinglé.' : 'Message épinglé dans la communauté.' });
    } catch (error) {
      console.error("Error pinning message:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier l\'épinglage du message.' });
    }
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('animate-ping-slow-once');
      setTimeout(() => {
        messageElement.classList.remove('animate-ping-slow-once');
      }, 1500);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!chatData) {
    // notFound() could be used here if it's a separate page, but here we redirect.
    return null;
  }

  const isTyping = otherUser ? chatData.typing?.[otherUser.id] ?? false : false;
  const chatMembers = chatData.members.map(id => usersData[id]).filter(Boolean) as UserType[];
  const allUsersInApp = Object.values(usersData);


  return (
    <div className="relative flex flex-col h-screen w-full bg-background overflow-hidden">
      <video
        src="https://cdn.pixabay.com/video/2024/05/20/212953-944519999_large.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10 opacity-10"
      />
       <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -z-10"/>

      <div className="sticky top-0 z-20 backdrop-blur-sm">
        <ChatTopbar 
          info={otherUser || { name: chatData.name, users: chatMembers }} 
          isGroup={chatData.type !== 'private'} 
          chat={chatData} 
          allUsers={allUsersInApp}
          onPinnedMessageClick={scrollToMessage}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
        <ChatMessages
          messages={messages}
          chat={chatData}
          loggedInUser={currentUser}
          otherUser={otherUser!}
          isTyping={isTyping}
          chatMembers={chatMembers}
          onReply={handleReply}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onToggleStar={handleToggleStar}
          onTogglePin={handleTogglePin}
          onEditMessage={handleEditMessage}
          onShare={handleShareMessage}
          allUsersInApp={allUsersInApp}
          isAdmin={isAdmin}
          onScrollToMessage={scrollToMessage}
        />
      </div>
      
      <div className="mt-auto p-2">
        <ChatInput
          chat={chatData}
          onSendMessage={handleSendMessage}
          replyInfo={replyInfo}
          onClearReply={() => setReplyInfo(undefined)}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ChatPageContent />
        </Suspense>
    )
}
