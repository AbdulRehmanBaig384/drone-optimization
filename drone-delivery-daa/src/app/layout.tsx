import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
