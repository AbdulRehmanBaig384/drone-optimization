'use client';
// src/components/layout/Sidebar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Map, Bot, Package, PlayCircle,
} from 'lucide-react';

const navItems = [
  { href: '/',           icon: LayoutDashboard, label: 'Dash'  },
  { href: '/city-map',   icon: Map,             label: 'Map'   },
  { href: '/drones',     icon: Bot,             label: 'Drones'},
  { href: '/deliveries', icon: Package,         label: 'Orders'},
  { href: '/simulation', icon: PlayCircle,      label: 'Sim' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto md:right-auto md:w-[76px] md:h-screen bg-bg-elev border-t md:border-t-0 md:border-r border-border-theme z-50 flex md:flex-col items-center py-2 md:py-6 px-2 md:px-0 justify-around md:justify-start md:gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] md:shadow-none">
      <div className="hidden md:flex w-10 h-10 rounded-xl bg-surface border border-border-theme items-center justify-center mb-4 shadow-lg shadow-black/20">
        <span className="text-accent text-lg font-display font-bold">D</span>
      </div>
      
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex flex-col items-center justify-center w-14 h-14 md:w-[60px] md:h-[60px] rounded-xl transition-all duration-200',
              active
                ? 'bg-accent/10 text-accent'
                : 'text-text-faint hover:text-text-main hover:bg-surface-2',
            )}
          >
            {active && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-b-md md:top-auto md:-left-0 md:translate-x-0 md:w-1 md:h-8 md:top-1/2 md:-translate-y-1/2 md:rounded-r-md md:rounded-b-none" />
            )}
            <Icon size={20} className={cn("mb-1", active && "drop-shadow-[0_0_8px_rgba(65,214,255,0.5)]")} />
            <span className="text-[10px] font-sans font-medium uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
