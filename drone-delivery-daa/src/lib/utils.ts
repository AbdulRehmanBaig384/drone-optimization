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
    available: 'text-success',
    in_flight: 'text-accent',
    charging:  'text-energy',
    offline:   'text-critical',
    pending:   'text-text-dim',
    assigned:  'text-violet-400',
    delivered: 'text-success',
    failed:    'text-critical',
  };
  return map[status] ?? 'text-text-faint';
}

/** Status badge background color */
export function statusBg(status: string): string {
  const map: Record<string, string> = {
    available: 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(57,217,138,0.1)]',
    in_flight: 'bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(65,214,255,0.1)]',
    charging:  'bg-energy/10 text-energy border-energy/20 shadow-[0_0_10px_rgba(255,180,84,0.1)]',
    offline:   'bg-critical/10 text-critical border-critical/20 shadow-[0_0_10px_rgba(255,107,129,0.1)]',
    pending:   'bg-surface-2 text-text-dim border-border-theme',
    assigned:  'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
    delivered: 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(57,217,138,0.1)]',
    failed:    'bg-critical/10 text-critical border-critical/20 shadow-[0_0_10px_rgba(255,107,129,0.1)]',
  };
  return map[status] ?? 'bg-surface-2 text-text-faint border-border-theme';
}
