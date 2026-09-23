import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
// import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Drone Delivery Route Optimization | DAA Project',
  description:
    'A Design & Analysis of Algorithms project implementing Dijkstra, A*, and greedy algorithms for drone delivery route optimization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${ibmPlexSans.className} ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} bg-bg text-text-main antialiased`}>
          {children}
        </body>
      </html>
    // </ClerkProvider>
  );
}
