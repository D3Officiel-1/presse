
'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="text-4xl font-bold mb-4">Nouveau Projet</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        L'ancien projet a été effacé. Votre environnement est maintenant vierge et prêt pour une nouvelle création !
      </p>
      <div className="p-8 border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5">
        <p className="text-lg font-medium text-primary">Dites-moi ce que vous souhaitez construire maintenant.</p>
      </div>
    </div>
  );
}
