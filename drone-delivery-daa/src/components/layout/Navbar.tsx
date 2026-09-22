'use client';
// src/components/layout/Navbar.tsx

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">D</span>
        </div>
        <span className="font-semibold text-slate-100 text-sm hidden sm:block">
          Drone Delivery <span className="text-sky-400">DAA</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 hidden md:block">
          Design &amp; Analysis of Algorithms
        </span>
        <UserButton fallbackRedirectUrl="/sign-in" />
      </div>
    </header>
  );
}
