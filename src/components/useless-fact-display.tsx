'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Share2, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';

interface UselessFactDisplayProps {
  fact: string;
  loading: boolean;
}

export default function UselessFactDisplay({ fact, loading }: UselessFactDisplayProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A Useless Fact',
          text: fact,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({
            title: "Couldn't share fact",
            description: "An error occurred while trying to share.",
            variant: "destructive",
          });
        }
      }
    } else {
      handleCopy();
      toast({
        title: "Sharing not supported",
        description: "Fact copied to clipboard instead.",
      });
    }
  };

  const handleCopy = () => {
    if (!navigator.clipboard) {
        toast({
        title: "Copy not supported",
        description: "Your browser does not support copying to clipboard.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(fact).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Now go be useless somewhere else.",
      });
    }).catch(err => {
      console.error('Error copying text: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy fact to clipboard.",
        variant: "destructive",
      });
    });
  };

  return (
    <Card className="min-h-[250px] flex flex-col items-center justify-center p-6 sm:p-10 text-center shadow-2xl bg-card border-border transition-all duration-300">
      <CardContent className="p-0 flex-grow flex items-center justify-center w-full">
        {loading ? (
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-5 w-3/4 mx-auto bg-muted/50" />
            <Skeleton className="h-5 w-full mx-auto bg-muted/50" />
            <Skeleton className="h-5 w-5/6 mx-auto bg-muted/50" />
          </div>
        ) : (
          <blockquote className="text-2xl lg:text-3xl font-medium text-foreground leading-relaxed">
            <p>"{fact}"</p>
          </blockquote>
        )}
      </CardContent>
      {!loading && isClient && (
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share this fact">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy this fact">
            <Copy className="h-5 w-5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
