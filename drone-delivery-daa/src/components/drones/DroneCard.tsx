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
    battPct > 60 ? 'bg-success' : battPct > 30 ? 'bg-energy' : 'bg-critical';

  return (
    <div className="glass-card p-5 flex flex-col gap-4 hover:border-text-faint hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold font-display text-text-main text-base group-hover:text-accent transition-colors">{drone.name}</h3>
          <p className="text-xs text-text-faint mt-0.5 font-mono">DRONE #{drone.id}</p>
        </div>
        <span className={cn('text-[10px] px-2.5 py-1 rounded border font-bold uppercase tracking-wide', statusBg(drone.status))}>
          {drone.status.replace('_', ' ')}
        </span>
      </div>

      {/* Battery bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-text-dim flex items-center gap-1.5 uppercase tracking-wider">
            <BatteryMedium size={14} className={battPct <= 30 ? 'text-critical animate-pulse' : ''} /> Battery
          </span>
          <span className="text-[11px] font-mono font-bold text-text-main">
            {drone.current_battery.toFixed(0)}/{drone.battery_capacity.toFixed(0)} <span className="text-text-faint font-normal">({batteryPct(drone.current_battery, drone.battery_capacity)})</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden border border-border-theme">
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', battColor)}
            style={{ width: `${Math.min(battPct, 100)}%`, boxShadow: battPct > 30 ? `0 0 10px ${battPct > 60 ? '#39D98A' : '#FFB454'}` : 'none' }}
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-xs text-text-dim bg-surface-2/50 p-2 rounded-lg border border-border-theme/50">
        <MapPin size={14} className="text-accent" />
        <span className="font-medium">{loc ? loc.name : `Location #${drone.current_location}`}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border-theme/50 mt-1">
        {onRecharge && (
          <button
            onClick={() => onRecharge(drone.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded font-bold text-[10px] uppercase tracking-wider bg-energy/10 text-energy border border-energy/20 hover:bg-energy/20 transition-colors"
          >
            <Zap size={14} /> Recharge
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(drone.id)}
            className="flex-1 py-2 rounded font-bold text-[10px] uppercase tracking-wider bg-critical/10 text-critical border border-critical/20 hover:bg-critical/20 transition-colors"
          >
            Decommission
          </button>
        )}
      </div>
    </div>
  );
}
