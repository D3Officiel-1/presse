import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageDate(timestamp: Timestamp | null): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();

    if (isToday(date)) {
        return 'Aujourd\'hui';
    }
    if (isYesterday(date)) {
        return 'Hier';
    }
    // For dates within the last week, show the day name
    // The logic below is a bit simplistic, date-fns `differenceInCalendarDays` is better
    const today = new Date();
    const diffDays = (today.getTime() - date.getTime()) / (1000 * 3600 * 24);
    if (diffDays < 7) {
        return format(date, 'eeee', { locale: fr });
    }
    
    // Otherwise, show the full date
    return format(date, 'dd/MM/yyyy', { locale: fr });
}
