'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { getUselessFact } from '@/app/actions';
import UselessFactDisplay from '@/components/useless-fact-display';

export default function Home() {
  const [fact, setFact] = useState('');
  const [isPending, startTransition] = useTransition();

  const fetchFact = () => {
    startTransition(async () => {
      try {
        const { fact: newFact } = await getUselessFact({});
        setFact(newFact);
      } catch (error) {
        console.error('Failed to generate fact:', error);
        setFact('Failed to load a useless fact. The AI is probably on a coffee break.');
      }
    });
  };

  useEffect(() => {
    fetchFact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-3 tracking-tight font-headline">
            Useless Facts Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover facts you never knew you didn't need to know.
          </p>
        </header>

        <main>
          <UselessFactDisplay fact={fact} loading={isPending || !fact} />

          <div className="text-center mt-8">
            <Button onClick={fetchFact} disabled={isPending} className="transform hover:scale-105 transition-transform duration-200" size="lg">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Another Useless Fact
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
