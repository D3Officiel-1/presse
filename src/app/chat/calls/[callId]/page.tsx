
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { doc, onSnapshot, updateDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Loader2, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Peer from 'simple-peer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


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
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [duration, setDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer.Instance | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const isVideoCall = callData?.type === 'video';

    const endCall = useCallback(async (updateFirebase = true) => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
        }
        
        setCallStatus('ended');

        if (updateFirebase && firestore && callId && callData?.status !== 'ended') {
            try {
                await updateDoc(doc(firestore, 'calls', callId), { status: 'ended', endedAt: serverTimestamp() });
            } catch (e) {
                console.error("Error ending call in Firebase:", e);
            }
        }
        if (router) {
            // Use a timeout to ensure the user sees the 'ended' state before redirecting
            setTimeout(() => router.push('/chat'), 1500);
        }
    }, [firestore, callId, callData?.status, router]);


    useEffect(() => {
        if (!firestore || !callId || !currentUser) return;

        const callRef = doc(firestore, 'calls', callId);

        const unsubscribe = onSnapshot(callRef, async (snapshot) => {
            if (!snapshot.exists()) {
                toast({ variant: 'destructive', title: 'Appel terminé', description: "Cet appel n'existe plus." });
                endCall(false); // Don't update doc if it doesn't exist
                return;
            }

            const data = snapshot.data();
            setCallData(data);
            
            const otherUserId = data.callerId === currentUser.uid ? data.receiverId : data.callerId;
            if (callee?.id !== otherUserId) {
                const userDoc = await getDoc(doc(firestore, 'users', otherUserId));
                if (userDoc.exists()) {
                    setCallee(userDoc.data() as UserType);
                }
            }


            if (data.status === 'ended' && callStatus !== 'ended') {
                endCall(false);
                return;
            }
            
            // Caller logic: create and send offer
            if (data.callerId === currentUser.uid && !data.offer && !peerRef.current) {
                setCallStatus('outgoing');
                createPeer(true, data.type === 'video');
            }
            
            // Receiver logic: receive offer
            if (data.receiverId === currentUser.uid && data.offer && !data.answer && !peerRef.current) {
                 setCallStatus('incoming');
            }
            
            // Caller logic: receive answer
            if (data.callerId === currentUser.uid && data.answer && peerRef.current && !peerRef.current.connected) {
                peerRef.current.signal(data.answer);
            }

        });

        return () => {
            unsubscribe();
            // This cleanup is crucial
            if (peerRef.current) {
                peerRef.current.destroy();
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, [firestore, callId, currentUser, endCall, callee?.id]);


    const createPeer = useCallback(async (initiator: boolean, videoEnabled: boolean) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            const newPeer = new Peer({
                initiator,
                trickle: false,
                stream: stream,
            });

            newPeer.on('signal', async (signal) => {
                 const callRef = doc(firestore, 'calls', callId);
                 if (initiator) {
                     await updateDoc(callRef, { offer: signal });
                 } else {
                     await updateDoc(callRef, { answer: signal, status: 'active' });
                 }
            });

            newPeer.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            });

            newPeer.on('connect', () => {
                setCallStatus('connected');
                if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = setInterval(() => setDuration(d => d + 1), 1000);
            });
            
            newPeer.on('close', () => endCall());
            newPeer.on('error', (err) => { console.error('Peer error:', err); endCall(); });

            peerRef.current = newPeer;

        } catch (error) {
            console.error('Error getting media stream:', error);
            toast({ variant: 'destructive', title: "Erreur de Média", description: "Impossible d'accéder à la caméra ou au microphone."});
            endCall();
        }
    }, [callId, firestore, toast, endCall]);
    
    const handleAcceptCall = () => {
        createPeer(false, callData.type === 'video');
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };
    
    const toggleCamera = () => {
        if (localStreamRef.current && isVideoCall) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(!isCameraOff);
        }
    };
    
    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
    }
    
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
                <p className="text-muted-foreground">Vous allez être redirigé...</p>
            </div>
        );
    }

    const renderCallStatus = () => {
        switch(callStatus) {
            case 'outgoing': return 'Appel en cours...';
            case 'incoming': return 'Appel entrant...';
            case 'connected': return formatDuration(duration);
            default: return '';
        }
    }


    return (
        <div className="relative flex flex-col h-screen w-full items-center justify-between p-8 bg-black text-white">
            {/* Remote Video */}
            <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover -z-10" />
            <div className="absolute inset-0 bg-black/50 -z-10" />

            {/* Local Video */}
            <AnimatePresence>
                {isVideoCall && (
                    <motion.div 
                        className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                         <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                         {isCameraOff && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><VideoOff className="w-8 h-8 text-white"/></div>}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-12 z-10"
                >
                    <AnimatePresence>
                        {remoteVideoRef.current?.srcObject ? null : (
                             <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                             >
                                 <Avatar className="w-40 h-40 mx-auto border-4 border-white/10 shadow-2xl">
                                    <AvatarImage src={callee.avatar} />
                                    <AvatarFallback className="text-6xl">{callee.name?.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                             </motion.div>
                        )}
                    </AnimatePresence>
                    <h1 className="text-4xl font-bold mt-6 drop-shadow-lg">{callee.name}</h1>
                    <p className="text-lg text-white/80 mt-2 font-mono drop-shadow-md">{renderCallStatus()}</p>
                </motion.div>
            </AnimatePresence>
            
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-6 z-10"
             >
                 {callStatus === 'connected' && (
                    <>
                        {isVideoCall && (
                           <Button variant="outline" size="icon" className={cn("w-16 h-16 rounded-full bg-white/10 border-white/20 hover:bg-white/20", isCameraOff && "bg-destructive/70")} onClick={toggleCamera}>
                                {isCameraOff ? <VideoOff /> : <Video />}
                            </Button>
                        )}
                        <Button variant="outline" size="icon" className={cn("w-16 h-16 rounded-full bg-white/10 border-white/20 hover:bg-white/20", isMuted && "bg-destructive/70")} onClick={toggleMute}>
                            {isMuted ? <MicOff /> : <Mic />}
                        </Button>
                    </>
                 )}
                 
                 {callStatus === 'incoming' ? (
                     <Button size="icon" className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 animate-pulse" onClick={handleAcceptCall}>
                        {isVideoCall ? <Video /> : <PhoneOff style={{transform: "rotate(-135deg)"}}/>}
                    </Button>
                 ) : null}

                 <Button size="icon" className="w-20 h-20 rounded-full bg-destructive hover:bg-destructive/80" onClick={() => endCall()}>
                    <PhoneOff />
                </Button>
             </motion.div>
        </div>
    );
}


    