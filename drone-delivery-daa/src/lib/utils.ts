// src/lib/utils.ts
// Utility functions used across the app

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number to fixed decimal places */
export function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

/** Format battery level as percentage string */
export function batteryPct(current: number, capacity: number): string {
  if (capacity === 0) return '0%';
  return `${Math.round((current / capacity) * 100)}%`;
}

/** Capitalize first letter of a string */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Status color mapping for UI badges */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    available: 'text-emerald-400',
    in_flight: 'text-sky-400',
    charging:  'text-amber-400',
    offline:   'text-red-400',
    pending:   'text-slate-400',
    assigned:  'text-violet-400',
    delivered: 'text-emerald-400',
    failed:    'text-red-400',
  };
  return map[status] ?? 'text-slate-400';
}

/** Status badge background color */
export function statusBg(status: string): string {
  const map: Record<string, string> = {
    available: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    in_flight: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    charging:  'bg-amber-400/10 text-amber-400 border-amber-400/20',
    offline:   'bg-red-400/10 text-red-400 border-red-400/20',
    pending:   'bg-slate-400/10 text-slate-400 border-slate-400/20',
    assigned:  'bg-violet-400/10 text-violet-400 border-violet-400/20',
    delivered: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    failed:    'bg-red-400/10 text-red-400 border-red-400/20',
  };
  return map[status] ?? 'bg-slate-400/10 text-slate-400 border-slate-400/20';
}
