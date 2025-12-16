import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import React from 'react';
import { ThemeUpdater } from '@/lib/theme';
import { GlobalContextMenuBlocker } from '@/components/global-context-menu-blocker';

const APP_NAME = "Club de Presse - Leader's Club";
const APP_DESCRIPTION = "L'application de chat dédiée aux membres du Club de Presse du Leader's Club.";
const APP_URL = "https://leaders-club-saint-exupery.web.app";
const APP_LOGO = "https://i.postimg.cc/fbtSZFWz/icon-256x256.png";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: APP_LOGO,
        width: 256,
        height: 256,
        alt: "Club de Presse Logo",
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [APP_LOGO],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('SW registered: ', registration);
                  }).catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body 
        className="font-body antialiased h-full"
      >
        <FirebaseClientProvider>
          <ThemeUpdater />
          <GlobalContextMenuBlocker />
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
