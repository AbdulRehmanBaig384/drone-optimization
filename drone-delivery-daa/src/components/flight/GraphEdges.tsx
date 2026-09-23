"use client";

import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { Location, Edge } from "@/types";

interface GraphEdgesProps {
  locations: Location[];
  edges: Edge[];
}

export function GraphEdges({ locations, edges }: GraphEdgesProps) {
  const locMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  const lines = useMemo(() => {
    return edges.map(edge => {
      const fromLoc = locMap.get(edge.from_location);
      const toLoc = locMap.get(edge.to_location);
      if (!fromLoc || !toLoc) return null;

      return {
        id: edge.id,
        points: [
          [fromLoc.pos_x - 50, 0.05, fromLoc.pos_y - 50],
          [toLoc.pos_x - 50, 0.05, toLoc.pos_y - 50]
        ] as [[number, number, number], [number, number, number]],
      };
    }).filter(Boolean) as { id: number, points: [[number, number, number], [number, number, number]] }[];
  }, [edges, locMap]);

  return (
    <group>
      {lines.map(line => (
        <Line
          key={line.id}
          points={line.points}
          color="#1e3a8a" // Darker blue/cyan color
          lineWidth={2}
          opacity={0.4}
          transparent
        />
      ))}
    </group>
  );
}
