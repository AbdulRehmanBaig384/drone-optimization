'use client';
// src/components/layout/Navbar.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Bell } from 'lucide-react';
import type { DeliveryRequest } from '@/types';

const routeTitles: Record<string, string> = {
  '/': 'Fleet Overview',
  '/city-map': 'Sector Map & Routing',
  '/drones': 'Drone Telemetry',
  '/deliveries': 'Active Manifests',
  '/simulation': 'DAA Simulation',
};

export default function Navbar() {
  const pathname = usePathname();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    fetch('/api/deliveries')
      .then((res) => res.json())
      .then((data: DeliveryRequest[]) => {
        if (Array.isArray(data)) {
          setPending(data.filter((d) => d.status === 'pending').length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[76px] h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center px-4 md:px-8 justify-between z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4">
        <h1 className="text-lg md:text-xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">
          {routeTitles[pathname] || 'Control Room'}
        </h1>
        {pending > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-energy/10 border border-energy/20">
            <div className="w-1.5 h-1.5 rounded-full bg-energy animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-energy">
              {pending} PENDING
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs font-mono text-text-dim hidden sm:block">SYSTEM NOMINAL</span>
        </div>
        
        <div className="w-px h-6 bg-border-theme hidden sm:block" />

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-faint hover:text-text-main hover:bg-surface transition-colors">
          <Bell size={18} />
          {pending > 0 && (
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border border-bg-elev" />
          )}
        </button>
      </div>
    </header>
  );
}
