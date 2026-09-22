'use client';
// src/components/layout/Sidebar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Map, Bot, Package, PlayCircle,
} from 'lucide-react';

const navItems = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/city-map',   icon: Map,             label: 'City Map'   },
  { href: '/drones',     icon: Bot,             label: 'Drones'     },
  { href: '/deliveries', icon: Package,         label: 'Deliveries' },
  { href: '/simulation', icon: PlayCircle,      label: 'Simulation' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col py-6 px-3 gap-1">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
        Navigation
      </p>
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              active
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
            )}
          >
            <Icon size={16} className={active ? 'text-sky-400' : ''} />
            {label}
          </Link>
        );
      })}

      <div className="mt-auto pt-6 px-3">
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-500">Algorithms Used</p>
          <p>• Dijkstra (O((V+E) log V))</p>
          <p>• A* with Euclidean h(n)</p>
          <p>• Greedy Scheduling</p>
          <p>• Priority Queue (Min-Heap)</p>
        </div>
      </div>
    </aside>
  );
}
