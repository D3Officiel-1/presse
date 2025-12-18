
import type { User as FirebaseUser } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import type { NextRouter } from 'next/router';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const handleSelectUser = async (
    selectedUserId: string,
    currentUser: FirebaseUser | null,
    firestore: Firestore | null,
    setIsCreatingChat: (userId: string | null) => void,
    router: AppRouterInstance
) => {
    if (!currentUser || !firestore) return;
    
    setIsCreatingChat(selectedUserId);

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
        if (chat.members.includes(selectedUserId)) {
            existingChatId = doc.id;
        }
    });

    if (existingChatId) {
        router.push(`/chat/${existingChatId}`);
    } else {
        try {
            const newChatDoc = await addDoc(chatsRef, {
                type: 'private',
                members: [currentUser.uid, selectedUserId],
                lastMessage: null,
                lastMessageTimestamp: null,
                createdAt: serverTimestamp(),
                unreadCounts: { [currentUser.uid]: 0, [selectedUserId]: 0 },
                typing: { [currentUser.uid]: false, [selectedUserId]: false },
            });
            router.push(`/chat/${newChatDoc.id}`);
        } catch (error) {
            console.error("Error creating new chat:", error);
            setIsCreatingChat(null);
        }
    }
};

export const handleCreateGroup = async (
    groupName: string,
    selectedUserIds: string[],
    currentUser: FirebaseUser | null,
    firestore: Firestore | null,
    router: AppRouterInstance,
    groupAvatar?: string
) => {
    if (!currentUser || !firestore || !groupName.trim() || selectedUserIds.length === 0) {
        return;
    }

    const members = [currentUser.uid, ...selectedUserIds];
    const unreadCounts = members.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
    const typing = members.reduce((acc, id) => ({ ...acc, [id]: false }), {});

    try {
        const chatsRef = collection(firestore, 'chats');
        const newGroupDoc = await addDoc(chatsRef, {
            type: 'group',
            name: groupName,
            groupAvatar: groupAvatar || `https://avatar.vercel.sh/${encodeURIComponent(groupName)}.png`,
            members,
            lastMessage: { content: `${currentUser.displayName || 'Quelqu\'un'} a créé le groupe.` },
            lastMessageTimestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            unreadCounts,
            typing,
        });
        router.push(`/chat/${newGroupDoc.id}`);
    } catch (error) {
        console.error("Error creating new group:", error);
    }
};
