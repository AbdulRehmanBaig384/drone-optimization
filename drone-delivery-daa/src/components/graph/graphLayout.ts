// src/components/graph/graphLayout.ts
// Converts location (pos_x, pos_y) into React Flow node positions
// Scales database coordinates (0-100) to viewport pixels.

import type { Location, Edge } from '@/types';
import type { Node, Edge as RFEdge } from 'reactflow';

const VIEWPORT_SCALE = 7; // multiply pos_x/pos_y by this to get pixel positions
const NODE_OFFSET_X = 50;
const NODE_OFFSET_Y = 50;

export function locationsToNodes(locations: Location[]): Node[] {
  return locations.map((loc) => ({
    id: String(loc.id),
    type: 'cityNode',
    position: {
      x: loc.pos_x * VIEWPORT_SCALE + NODE_OFFSET_X,
      y: (100 - loc.pos_y) * VIEWPORT_SCALE + NODE_OFFSET_Y, // flip Y axis (SVG convention)
    },
    data: {
      label: loc.name,
      locationId: loc.id,
      pos_x: loc.pos_x,
      pos_y: loc.pos_y,
    },
  }));
}

export function edgesToRFEdges(
  edges: Edge[],
  highlightedPath: number[] = [],
): RFEdge[] {
  // Build a set of (from, to) pairs from the highlighted path
  const highlightedPairs = new Set<string>();
  for (let i = 0; i < highlightedPath.length - 1; i++) {
    const a = highlightedPath[i];
    const b = highlightedPath[i + 1];
    highlightedPairs.add(`${a}-${b}`);
    highlightedPairs.add(`${b}-${a}`); // bidirectional
  }

  return edges.map((edge) => {
    const isHighlighted =
      highlightedPairs.has(`${edge.from_location}-${edge.to_location}`) ||
      highlightedPairs.has(`${edge.to_location}-${edge.from_location}`);

    return {
      id: `e${edge.id}`,
      source: String(edge.from_location),
      target: String(edge.to_location),
      type: 'straight',
      animated: isHighlighted,
      style: {
        stroke: isHighlighted ? '#41D6FF' : '#263355',
        strokeWidth: isHighlighted ? 3 : 1.5,
        filter: isHighlighted ? 'drop-shadow(0px 0px 4px rgba(65, 214, 255, 0.8))' : 'none',
      },
      label: `${edge.distance.toFixed(1)}km`,
      labelStyle: { fill: '#5C6A8C', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0E1626', stroke: '#263355', strokeWidth: 1 },
      data: {
        distance: edge.distance,
        energy_cost: edge.energy_cost,
        travel_time: edge.travel_time,
      },
    };
  });
}
