'use client';
// src/components/deliveries/DeliveryTable.tsx

import { statusBg, cn } from '@/lib/utils';
import type { DeliveryRequest, Location } from '@/types';
import { Trash2, RotateCcw } from 'lucide-react';

interface DeliveryTableProps {
  deliveries: DeliveryRequest[];
  locations: Location[];
  onDelete?: (id: number) => void;
  onUnassign?: (id: number) => void;
}

const priorityColors: Record<number, string> = {
  1: 'text-critical bg-critical/10 border-critical/20',
  2: 'text-energy bg-energy/10 border-energy/20',
  3: 'text-accent bg-accent/10 border-accent/20',
  4: 'text-success bg-success/10 border-success/20',
  5: 'text-text-dim bg-surface-2 border-border-theme',
};

export default function DeliveryTable({ deliveries, locations, onDelete, onUnassign }: DeliveryTableProps) {
  const locationMap = new Map(locations.map((l) => [l.id, l]));

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12 text-text-dim text-sm glass-card">
        No delivery requests yet. Create a new manifest above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-theme bg-surface shadow-xl">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border-theme bg-surface-2/80 backdrop-blur-md">
            <th className="px-5 py-4 text-xs font-semibold font-display text-text-faint uppercase tracking-wider sticky top-0">ID</th>
            <th className="px-5 py-4 text-xs font-semibold font-display text-text-faint uppercase tracking-wider sticky top-0">Destination</th>
            <th className="px-5 py-4 text-xs font-semibold font-display text-text-faint uppercase tracking-wider sticky top-0">Priority</th>
            <th className="px-5 py-4 text-xs font-semibold font-display text-text-faint uppercase tracking-wider sticky top-0">Weight</th>
            <th className="px-5 py-4 text-xs font-semibold font-display text-text-faint uppercase tracking-wider sticky top-0">Status</th>
            <th className="px-5 py-4 text-xs font-semibold font-display text-text-faint uppercase tracking-wider sticky top-0">Created</th>
            {(onDelete || onUnassign) && <th className="px-5 py-4 sticky top-0 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-theme/50">
          {deliveries.map((d) => (
            <tr
              key={d.id}
              className="transition-colors hover:bg-surface-2 group"
            >
              <td className="px-5 py-4 font-mono text-text-dim text-xs">#{d.id}</td>
              <td className="px-5 py-4 text-text-main font-medium">
                {locationMap.get(d.destination)?.name ?? `Sector #${d.destination}`}
              </td>
              <td className="px-5 py-4">
                <span className={cn('px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider', priorityColors[d.priority])}>
                  Priority {d.priority}
                </span>
              </td>
              <td className="px-5 py-4 text-text-dim font-mono text-xs">{d.package_weight.toFixed(1)} kg</td>
              <td className="px-5 py-4">
                <span className={cn('text-[10px] px-2.5 py-1 rounded border font-bold uppercase tracking-wide', statusBg(d.status))}>
                  {d.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-5 py-4 text-text-faint text-xs font-mono">
                {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              {(onDelete || onUnassign) && (
                <td className="px-5 py-4 text-right flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onUnassign && d.status === 'assigned' && (
                    <button
                      onClick={() => onUnassign(d.id)}
                      className="text-text-faint hover:text-accent transition-colors"
                      title="Unassign Delivery"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(d.id)}
                      className="text-text-faint hover:text-critical transition-colors"
                      title="Delete Request"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
