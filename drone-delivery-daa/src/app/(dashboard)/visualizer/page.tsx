'use client';
import React from 'react';
import dynamic from 'next/dynamic';

import type { FlightRoute } from '@/types/flight';

const FlightScene = dynamic(
  () => import('@/components/flight/FlightScene').then((mod) => mod.FlightScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#050a1f] text-cyan-500 w-full rounded-xl border border-white/10">
        Loading 3D Engine...
      </div>
    )
  }
);

const DualFlightScene = dynamic(
  () => import('@/components/flight/DualFlightScene').then((mod) => mod.DualFlightScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#050a1f] text-cyan-500 w-full rounded-xl border border-white/10">
        Loading 3D Engine for Dual Comparison...
      </div>
    )
  }
);

import { useEffect, useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import type { Location, Edge } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

const DUMMY_ROUTE: FlightRoute = {
  algorithm: 'astar',
  nodesExplored: 5,
  totalDistance: 12.5,
  totalEnergy: 25.0,
  waypoints: [
    { id: 1, name: 'Depot Alpha', x: -50, z: -50 },
    { id: 5, name: 'Riverside', x: -38, z: -42 },
    { id: 6, name: 'Tech Park', x: -28, z: -46 },
    { id: 7, name: 'Greenwood', x: -20, z: -38 },
    { id: 10, name: 'Hillcrest', x: -12, z: -30 },
  ],
};
export default function VisualizerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCompareMode = searchParams.get('mode') === 'compare';

  const activeRoute = useSimulationStore((s) => s.activeVisualizerRoute);
  const activeComparisonRoutes = useSimulationStore((s) => s.activeComparisonRoutes);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentRoute, setCurrentRoute] = useState<FlightRoute>(DUMMY_ROUTE);
  
  // For comparison mode
  const [dijkstraRoute, setDijkstraRoute] = useState<FlightRoute>(DUMMY_ROUTE);
  const [astarRoute, setAstarRoute] = useState<FlightRoute>(DUMMY_ROUTE);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/locations').then(res => res.json()),
      fetch('/api/edges').then(res => res.json())
    ])
      .then(([locData, edgeData]) => {
        if (Array.isArray(locData)) setLocations(locData);
        if (Array.isArray(edgeData)) setEdges(edgeData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (locations.length === 0) return;
    const locMap = new Map(locations.map(l => [l.id, l]));

    if (isCompareMode && activeComparisonRoutes) {
      // Build Dijkstra Route
      const dWaypoints = activeComparisonRoutes.dijkstra.nodeIds.map((id) => {
        const loc = locMap.get(id);
        if (!loc) return null;
        return { id: loc.id, name: loc.name, x: loc.pos_x - 50, z: loc.pos_y - 50 };
      }).filter(Boolean) as FlightRoute['waypoints'];

      setDijkstraRoute({
        algorithm: 'dijkstra',
        nodesExplored: activeComparisonRoutes.dijkstra.nodeIds.length,
        totalDistance: activeComparisonRoutes.dijkstra.distance,
        totalEnergy: activeComparisonRoutes.dijkstra.energy,
        waypoints: dWaypoints,
      });

      // Build A* Route
      const aWaypoints = activeComparisonRoutes.astar.nodeIds.map((id) => {
        const loc = locMap.get(id);
        if (!loc) return null;
        return { id: loc.id, name: loc.name, x: loc.pos_x - 50, z: loc.pos_y - 50 };
      }).filter(Boolean) as FlightRoute['waypoints'];

      setAstarRoute({
        algorithm: 'astar',
        nodesExplored: activeComparisonRoutes.astar.nodeIds.length,
        totalDistance: activeComparisonRoutes.astar.distance,
        totalEnergy: activeComparisonRoutes.astar.energy,
        waypoints: aWaypoints,
      });
    } else if (activeRoute) {
      const waypoints = activeRoute.nodeIds.map((id) => {
        const loc = locMap.get(id);
        if (!loc) return null;
        return {
          id: loc.id,
          name: loc.name,
          x: loc.pos_x - 50,
          z: loc.pos_y - 50,
        };
      }).filter(Boolean) as FlightRoute['waypoints'];

      setCurrentRoute({
        algorithm: activeRoute.algorithm as any,
        nodesExplored: activeRoute.nodeIds.length,
        totalDistance: activeRoute.distance,
        totalEnergy: activeRoute.energy,
        waypoints,
      });
    } else {
      setCurrentRoute(DUMMY_ROUTE);
    }
  }, [activeRoute, activeComparisonRoutes, isCompareMode, locations]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[600px] items-center justify-center text-accent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Loading geographical data...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display text-text-main">
          {isCompareMode ? 'Algorithm 3D Comparison' : (activeRoute ? 'Active Flight Tracking' : '3D Visualizer')}
        </h1>
        <p className="text-text-dim text-sm mt-1">
          {isCompareMode 
            ? 'Comparing Dijkstra and A* pathfinding algorithms in 3D.'
            : (activeRoute 
                ? `Tracking live drone flight along computed ${activeRoute.algorithm} route.`
                : 'Cinematic 3D flight path visualization of drone routes across Meridian City.')}
        </p>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden border border-border-theme shadow-2xl">
        {isCompareMode ? (
          <DualFlightScene 
            route1={dijkstraRoute} 
            route2={astarRoute} 
            locations={locations} 
            edges={edges} 
            onSelectAlgorithm={(alg) => {
              // Note: Just showing an alert and redirecting. Real implementation would update assignment algorithm.
              alert(`Selected ${alg.toUpperCase()}! Applying logic to delivery and returning to simulation...`);
              router.push('/simulation');
            }}
          />
        ) : (
          <FlightScene route={currentRoute} locations={locations} edges={edges} />
        )}
      </div>
    </>
  );
}
