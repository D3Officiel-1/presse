
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { doc, onSnapshot, updateDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Loader2, Phone, Mic, MicOff, Volume2, Video, PhoneOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Peer from 'simple-peer';

type CallStatus = 'outgoing' | 'incoming' | 'connected' | 'ended';

export default function CallPage() {
    const params = useParams();
    const router = useRouter();
    const callId = params.callId as string;

    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [callData, setCallData] = useState<any>(null);
    const [callee, setCallee] = useState<UserType | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer.Instance | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!firestore || !callId || !currentUser) return;

        const callRef = doc(firestore, 'calls', callId);

        const unsubscribe = onSnapshot(callRef, async (snapshot) => {
            if (!snapshot.exists()) {
                toast({ variant: 'destructive', title: 'Appel terminé', description: "Cet appel n'existe plus." });
                router.push('/chat');
                return;
            }

            const data = snapshot.data();
            setCallData(data);

            const otherUserId = data.callerId === currentUser.uid ? data.receiverId : data.callerId;
            const userDoc = await getDoc(doc(firestore, 'users', otherUserId));
            if (userDoc.exists()) {
                setCallee(userDoc.data() as UserType);
            }

            if (data.status === 'ended') {
                setCallStatus('ended');
                return;
            }
            
            // Initiate call if we are the caller
            if (data.callerId === currentUser.uid && !data.offer) {
                setCallStatus('outgoing');
                createPeer(true);
            }
            
            // Answer call if we are the receiver and there's an offer
            if (data.receiverId === currentUser.uid && data.offer && !data.answer) {
                 setCallStatus('incoming');
                 // Wait for user to accept
            }
            
            // Caller receives answer
            if (data.callerId === currentUser.uid && data.answer && peerRef.current && !peerRef.current.connected) {
                peerRef.current.signal(data.answer);
            }

        });

        return () => unsubscribe();
    }, [firestore, callId, currentUser]);


    const createPeer = async (initiator: boolean) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            localStreamRef.current = stream;
            
            const peer = new Peer({
                initiator,
                trickle: false,
                stream: stream,
            });

            peer.on('signal', async (signal) => {
                 const callRef = doc(firestore, 'calls', callId);
                 if (initiator) {
                     await updateDoc(callRef, { offer: signal });
                 } else {
                     await updateDoc(callRef, { answer: signal });
                 }
            });

            peer.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            });

            peer.on('connect', () => {
                setCallStatus('connected');
                 updateDoc(doc(firestore, 'calls', callId), { status: 'active' });
            });
            
            peer.on('close', () => {
                endCall();
            });

            peer.on('error', (err) => {
                console.error('Peer error:', err);
                endCall();
            });

            peerRef.current = peer;

        } catch (error) {
            console.error('Error getting media stream:', error);
            toast({ variant: 'destructive', title: "Erreur de Média", description: "Impossible d'accéder au microphone."});
            endCall();
        }
    };
    
    const handleAcceptCall = () => {
        createPeer(false);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const endCall = async () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        
        if (firestore && callId && callData?.status !== 'ended') {
            await updateDoc(doc(firestore, 'calls', callId), { status: 'ended', endedAt: serverTimestamp() });
        }
        setCallStatus('ended');
        router.push('/chat');
    };
    
    if (!callee || !callStatus) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (callStatus === 'ended') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background flex-col gap-4">
                <h1 className="text-2xl font-bold">Appel terminé</h1>
                <Button onClick={() => router.push('/chat')}>Retour aux discussions</Button>
            </div>
        );
    }

    const renderCallStatus = () => {
        switch(callStatus) {
            case 'outgoing': return 'Appel en cours...';
            case 'incoming': return 'Appel entrant...';
            case 'connected': return 'Connecté';
            default: return '';
        }
    }


    return (
        <div className="relative flex flex-col h-screen w-full items-center justify-between p-8 bg-gradient-to-br from-background via-black to-background text-white">
            <video ref={localVideoRef} autoPlay muted className="hidden" />
            <video ref={remoteVideoRef} autoPlay className="hidden" />

            <div className="text-center mt-12">
                <Avatar className="w-40 h-40 mx-auto border-4 border-white/10 shadow-2xl">
                    <AvatarImage src={callee.avatar} />
                    <AvatarFallback className="text-6xl">{callee.name?.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold mt-6">{callee.name}</h1>
                <p className="text-lg text-muted-foreground mt-2">{renderCallStatus()}</p>
            </div>
            
             <div className="flex items-center justify-center gap-6">
                 {callStatus === 'connected' && (
                     <Button variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white/10 border-white/20 hover:bg-white/20" onClick={toggleMute}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                 )}
                 
                 {callStatus === 'incoming' ? (
                     <Button size="icon" className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600" onClick={handleAcceptCall}>
                        <Phone />
                    </Button>
                 ) : null}

                 <Button size="icon" className="w-20 h-20 rounded-full bg-destructive hover:bg-destructive/80" onClick={endCall}>
                    <PhoneOff />
                </Button>
             </div>
        </div>
    );
}
