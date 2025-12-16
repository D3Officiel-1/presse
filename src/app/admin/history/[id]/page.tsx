'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle, XCircle, Loader2, BarChart3, Check, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, getMonth, getYear, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface PresenceRecord {
    id: string;
    status: 'present' | 'absent';
    timestamp: Timestamp;
}

interface UserData {
    name: string;
    avatar: string;
    class: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const firestore = useFirestore();

    const [user, setUser] = useState<UserData | null>(null);
    const [presenceRecords, setPresenceRecords] = useState<PresenceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!userId || !firestore) return;

        const userRef = doc(firestore, 'users', userId);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setUser(docSnap.data() as UserData);
            } else {
                console.error("No such user!");
                setLoading(false);
            }
        });

        const presenceCol = collection(firestore, 'users', userId, 'presences');
        const q = query(presenceCol, orderBy('timestamp', 'desc'));
        const unsubscribePresence = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PresenceRecord));
            setPresenceRecords(records);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching presence history:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribePresence();
        };

    }, [userId, firestore]);
    
    const presentDays = presenceRecords
        .filter(r => r.status === 'present')
        .map(r => r.timestamp.toDate());
    
    const absentDays = presenceRecords
        .filter(r => r.status === 'absent')
        .map(r => r.timestamp.toDate());

    const filteredRecordsForMonth = presenceRecords.filter(r => isSameMonth(r.timestamp.toDate(), currentDate));
    const monthlyPresent = filteredRecordsForMonth.filter(r => r.status === 'present').length;
    const monthlyAbsent = filteredRecordsForMonth.filter(r => r.status === 'absent').length;

    const totalPresent = presentDays.length;
    const totalAbsent = absentDays.length;

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-transparent sticky top-0 z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-9 bg-white/5 hover:bg-white/10">
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-3">
                         <Avatar className="w-11 h-11 border-2 border-background/50">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{user?.name?.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-2xl tracking-tight">{user?.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                Historique de présence
                            </p>
                        </div>
                    </div>
                </div>
                 <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-lg text-green-400">{totalPresent}</div>
                        <div className="text-xs text-muted-foreground">Présences</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg text-red-400">{totalAbsent}</div>
                        <div className="text-xs text-muted-foreground">Absences</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6 grid lg:grid-cols-2 gap-8 items-start">
                 <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className='lg:sticky lg:top-24'
                 >
                     <Card className='bg-card/30 backdrop-blur-md border-white/10 shadow-lg overflow-hidden'>
                        <CalendarComponent
                            mode="single"
                            selected={new Date()}
                            month={currentDate}
                            onMonthChange={setCurrentDate}
                            locale={fr}
                            modifiers={{
                                present: presentDays,
                                absent: absentDays,
                            }}
                             modifiersClassNames={{
                                present: 'day-present',
                                absent: 'day-absent',
                            }}
                            styles={{
                                day: {
                                    borderRadius: '9999px',
                                    position: 'relative',
                                    fontWeight: 'bold',
                                },
                                day_present: {
                                    color: 'hsl(var(--primary))',
                                },
                                day_absent: {
                                    color: 'hsl(var(--destructive))',
                                }
                            }}
                        />
                         <CardFooter className="bg-black/20 p-4 border-t border-white/10 flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold text-green-400">{monthlyPresent}</p>
                                <p className="text-xs text-muted-foreground">Présent</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-400">{monthlyAbsent}</p>
                                <p className="text-xs text-muted-foreground">Absent</p>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-muted-foreground"/> Chronologie des pointages</h2>
                    {presenceRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 bg-card/20 rounded-xl border border-dashed">
                            <CalendarIcon className="w-12 h-12 mb-4" />
                            <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                            <p className="text-sm">Cet historique est vide pour le moment.</p>
                        </div>
                    ) : (
                        <div className="relative pl-6">
                             <div className="absolute left-[30px] top-4 bottom-4 w-0.5 bg-border -translate-x-1/2"></div>
                             <AnimatePresence>
                                {presenceRecords.map((record, index) => (
                                    <motion.div 
                                        key={record.id} 
                                        className="relative flex items-start gap-6 mb-8"
                                        custom={index}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <div className="absolute left-[30px] top-5 h-px w-6 bg-border -translate-x-full"></div>
                                        <div className="z-10 flex items-center justify-center h-12 w-12 rounded-full bg-background border-2">
                                            {record.status === 'present' ? (
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <p className="font-semibold text-foreground">
                                                {format(record.timestamp.toDate(), "eeee dd MMMM yyyy", { locale: fr })}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Pointé {record.status === 'present' ? 'présent(e)' : 'absent(e)'} à {format(record.timestamp.toDate(), "HH:mm", { locale: fr })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
