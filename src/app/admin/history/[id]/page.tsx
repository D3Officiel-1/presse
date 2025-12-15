
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, getDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PresenceRecord {
    id: string;
    status: 'present' | 'absent';
    timestamp: {
        toDate: () => Date;
    };
}

interface UserData {
    name: string;
    avatar: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const firestore = useFirestore();

    const [user, setUser] = useState<UserData | null>(null);
    const [presenceRecords, setPresenceRecords] = useState<PresenceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const presentDays = presenceRecords
        .filter(r => r.status === 'present')
        .map(r => r.timestamp.toDate());
        
    const absentDays = presenceRecords
        .filter(r => r.status === 'absent')
        .map(r => r.timestamp.toDate());

    useEffect(() => {
        if (!userId || !firestore) return;

        // Fetch user data
        const userRef = doc(firestore, 'users', userId);
        getDoc(userRef).then(docSnap => {
            if (docSnap.exists()) {
                setUser(docSnap.data() as UserData);
            } else {
                console.error("No such user!");
            }
        });

        // Listen for presence records
        const presenceCol = collection(firestore, 'users', userId, 'presences');
        const q = query(presenceCol, orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PresenceRecord));
            setPresenceRecords(records);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching presence history:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [userId, firestore]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="p-4 border-b flex items-center justify-between bg-background sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-3">
                         <Avatar className="w-9 h-9 border">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{user?.name?.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <h1 className="font-semibold text-lg tracking-tight">Historique de présence</h1>
                            <p className="text-sm text-muted-foreground">
                               {user?.name}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6 grid md:grid-cols-2 gap-6 items-start">
                <Card className='shadow-sm'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl"><Calendar className="w-5 h-5 text-muted-foreground"/> Calendrier</CardTitle>
                        <CardDescription>Vue mensuelle des présences et absences.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                       <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={fr}
                            modifiers={{
                                present: presentDays,
                                absent: absentDays,
                            }}
                            modifiersStyles={{
                                present: { color: 'hsl(var(--primary))', fontWeight: 'bold' },
                                absent: { color: 'hsl(var(--destructive))', fontWeight: 'bold' },
                            }}
                            modifiersClassNames={{
                                present: 'day-present',
                                absent: 'day-absent',
                            }}
                            className="p-0"
                        />
                    </CardContent>
                </Card>
                 <Card className='shadow-sm'>
                    <CardHeader>
                        <CardTitle className="text-xl">Liste des enregistrements</CardTitle>
                        <CardDescription>Détail de chaque pointage, du plus récent au plus ancien.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {presenceRecords.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
                                <Calendar className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                                <p className="text-sm">L'historique de présence de ce membre est vide.</p>
                            </div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-4 space-y-4">
                                {presenceRecords.map(record => (
                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                                        <div>
                                            <div className="font-medium text-sm capitalize">{format(record.timestamp.toDate(), 'eeee dd MMMM yyyy', { locale: fr })}</div>
                                            <div className="text-xs text-muted-foreground">{format(record.timestamp.toDate(), 'à HH:mm', { locale: fr })}</div>
                                        </div>
                                        {record.status === 'present' ? (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-semibold text-sm py-1 px-3 rounded-full bg-green-500/10 border border-green-500/20">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Présent</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-semibold text-sm py-1 px-3 rounded-full bg-red-500/10 border border-red-500/20">
                                                <XCircle className="w-4 h-4" />
                                                <span>Absent</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

