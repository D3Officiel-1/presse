
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AUTH_DOMAIN = "@leadersclub.ci";

export default function ForgotPasswordPage() {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const authInstance = useAuth();
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez saisir votre matricule.' });
      return;
    }

    setLoading(true);
    try {
      const technicalEmail = `${matricule.trim().toLowerCase()}${AUTH_DOMAIN}`;
      await sendPasswordResetEmail(authInstance, technicalEmail);
      setSuccess(true);
      toast({
        title: 'Requête envoyée',
        description: 'Veuillez contacter l\'administrateur si vous ne recevez rien sur votre canal dédié.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Matricule introuvable ou erreur réseau.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl text-center">Récupération</CardTitle>
            <CardDescription className="text-center">
              Saisissez votre matricule pour réinitialiser l'accès
            </CardDescription>
          </CardHeader>
          {!success ? (
            <form onSubmit={handleReset}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricule">Matricule</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="matricule"
                      placeholder="Ex: 20492945R"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      className="pl-10 h-12"
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Réinitialiser'}
                </Button>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6 pt-4 text-center">
              <div className="flex justify-center text-emerald-500">
                <CheckCircle2 className="w-16 h-16 animate-bounce" />
              </div>
              <p className="text-sm text-muted-foreground">
                Instructions envoyées pour le matricule <strong>{matricule}</strong>.
              </p>
              <Link href="/auth/login" className="block w-full">
                <Button variant="outline" className="w-full">Retour à la connexion</Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
