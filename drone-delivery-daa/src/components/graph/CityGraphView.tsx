'use client';
// src/components/graph/CityGraphView.tsx
// React Flow graph of all city locations and edges.
// Highlights the computed route when simulation runs.

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect, useCallback, memo } from 'react';
import { locationsToNodes, edgesToRFEdges } from './graphLayout';
import type { Location, Edge } from '@/types';

// Custom node component for city locations
const CityNode = memo(({ data }: { data: { label: string; locationId: number } }) => (
  <div className="city-node">
    <div className="city-node-inner">
      <span className="city-node-id">#{data.locationId}</span>
      <span className="city-node-label">{data.label}</span>
    </div>
  </div>
));
CityNode.displayName = 'CityNode';

const nodeTypes: NodeTypes = { cityNode: CityNode };

interface CityGraphViewProps {
  locations: Location[];
  edges: Edge[];
  highlightedPath?: number[];
}

export default function CityGraphView({
  locations,
  edges,
  highlightedPath = [],
}: CityGraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState([]);

  const rebuildGraph = useCallback(() => {
    setNodes(locationsToNodes(locations));
    setEdges(edgesToRFEdges(edges, highlightedPath));
  }, [locations, edges, highlightedPath, setNodes, setEdges]);

  useEffect(() => {
    rebuildGraph();
  }, [rebuildGraph]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 520 }} className="rounded-xl overflow-hidden border border-border-theme">
      <style>{`
        .city-node { cursor: pointer; }
        .city-node-inner {
          background: #131E36;
          border: 1px solid #263355;
          border-radius: 8px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 90px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }
        .city-node-inner:hover {
          border-color: #41D6FF;
          box-shadow: 0 0 12px rgba(65, 214, 255, 0.2);
          transform: translateY(-2px);
        }
        .city-node-id {
          font-size: 10px;
          color: #5C6A8C;
          font-family: monospace;
          letter-spacing: 1px;
        }
        .city-node-label {
          font-size: 12px;
          color: #E8ECF6;
          font-family: var(--font-display);
          font-weight: 600;
          text-align: center;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ background: '#0A1120' }}
      >
        <Background color="#131E36" gap={24} />
        <Controls className="react-flow-controls" />
        <MiniMap
          nodeColor="#1A2745"
          maskColor="rgba(10, 17, 32, 0.7)"
          style={{ background: '#0E1626', border: '1px solid #263355', borderRadius: '8px' }}
        />
      </ReactFlow>
    </div>
  );
}
