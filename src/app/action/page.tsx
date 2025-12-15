
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function ActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Traitement en cours, veuillez patienter...');
  const [action, setAction] = useState('');

  useEffect(() => {
    if (!mode || !actionCode) {
      router.push('/login');
      return;
    }

    const handleAction = async () => {
      try {
        switch (mode) {
          case 'verifyEmail':
            setAction('Vérification d\'e-mail');
            await applyActionCode(auth, actionCode);
            setStatus('success');
            setMessage('Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant vous connecter.');
            break;
          case 'resetPassword':
            // This would be the place to handle password reset, which requires a new password form.
            // For now, we'll just show a success message.
            setAction('Réinitialisation de mot de passe');
            // You would typically verify the code and then show a form to enter a new password.
            const info = await checkActionCode(auth, actionCode);
            // In a real app, you'd redirect to a page with a form:
            // router.push(`/reset-password?oobCode=${actionCode}`);
            setStatus('success');
            setMessage(`Vous pouvez maintenant définir un nouveau mot de passe pour ${info.data.email}. (Fonctionnalité à implémenter)`);
            break;
          default:
            throw new Error('Mode d\'action non supporté.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Le lien est invalide ou a expiré. Veuillez réessayer ou contacter le support.');
      }
    };

    handleAction();
  }, [mode, actionCode, auth, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{action || 'Action Firebase'}</CardTitle>
          <CardDescription>Portail de gestion des actions par e-mail.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>{message}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <MailCheck className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">Succès !</p>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          {status === 'error' && (
             <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Erreur</p>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActionPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ActionHandler />
        </Suspense>
    )
}

    