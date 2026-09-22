'use client';
// src/components/deliveries/DeliveryTable.tsx

import { statusBg, cn } from '@/lib/utils';
import type { DeliveryRequest, Location } from '@/types';
import { Trash2 } from 'lucide-react';

interface DeliveryTableProps {
  deliveries: DeliveryRequest[];
  locations: Location[];
  onDelete?: (id: number) => void;
}

const priorityColors: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-yellow-400',
  4: 'text-green-400',
  5: 'text-slate-400',
};

export default function DeliveryTable({ deliveries, locations, onDelete }: DeliveryTableProps) {
  const locationMap = new Map(locations.map((l) => [l.id, l]));

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No delivery requests yet. Create one using the form above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60 bg-slate-900/60">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Destination</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
            {onDelete && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d, i) => (
            <tr
              key={d.id}
              className={cn(
                'border-b border-slate-800/60 transition-colors',
                i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10',
                'hover:bg-slate-800/40',
              )}
            >
              <td className="px-4 py-3 font-mono text-slate-400">#{d.id}</td>
              <td className="px-4 py-3 text-slate-200">
                {locationMap.get(d.destination)?.name ?? `#${d.destination}`}
              </td>
              <td className="px-4 py-3">
                <span className={cn('font-bold', priorityColors[d.priority])}>P{d.priority}</span>
              </td>
              <td className="px-4 py-3 text-slate-400">{d.package_weight} kg</td>
              <td className="px-4 py-3">
                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', statusBg(d.status))}>
                  {d.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {new Date(d.created_at).toLocaleString()}
              </td>
              {onDelete && (
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(d.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
