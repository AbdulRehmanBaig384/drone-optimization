'use client';
// src/components/drones/DroneCard.tsx

import { batteryPct, statusBg, cn } from '@/lib/utils';
import { BatteryMedium, MapPin, Zap } from 'lucide-react';
import type { Drone, Location } from '@/types';

interface DroneCardProps {
  drone: Drone;
  locations: Location[];
  onRecharge?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function DroneCard({ drone, locations, onRecharge, onDelete }: DroneCardProps) {
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const loc = locationMap.get(drone.current_location);
  const battPct = drone.battery_capacity > 0
    ? (drone.current_battery / drone.battery_capacity) * 100
    : 0;
  const battColor =
    battPct > 60 ? 'bg-emerald-500' : battPct > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-5 flex flex-col gap-4 hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-base">{drone.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Drone #{drone.id}</p>
        </div>
        <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', statusBg(drone.status))}>
          {drone.status.replace('_', ' ')}
        </span>
      </div>

      {/* Battery bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <BatteryMedium size={13} /> Battery
          </span>
          <span className="text-xs font-mono text-slate-300">
            {drone.current_battery.toFixed(0)}/{drone.battery_capacity.toFixed(0)} ({batteryPct(drone.current_battery, drone.battery_capacity)})
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', battColor)}
            style={{ width: `${Math.min(battPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MapPin size={13} className="text-sky-400" />
        <span>{loc ? loc.name : `Location #${drone.current_location}`}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {onRecharge && (
          <button
            onClick={() => onRecharge(drone.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Zap size={12} /> Recharge
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(drone.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
