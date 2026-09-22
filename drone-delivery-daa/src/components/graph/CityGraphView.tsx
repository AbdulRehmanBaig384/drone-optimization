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
    <div style={{ width: '100%', height: '100%', minHeight: 520 }} className="rounded-xl overflow-hidden border border-slate-700/50">
      <style>{`
        .city-node { cursor: pointer; }
        .city-node-inner {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1.5px solid #334155;
          border-radius: 10px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 90px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          transition: border-color 0.2s;
        }
        .city-node-inner:hover { border-color: #38bdf8; }
        .city-node-id {
          font-size: 10px;
          color: #38bdf8;
          font-family: monospace;
        }
        .city-node-label {
          font-size: 12px;
          color: #e2e8f0;
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
        style={{ background: '#0a0f1e' }}
      >
        <Background color="#1e293b" gap={24} />
        <Controls className="react-flow-controls" />
        <MiniMap
          nodeColor="#1e40af"
          maskColor="rgba(0,0,0,0.6)"
          style={{ background: '#0f172a', border: '1px solid #334155' }}
        />
      </ReactFlow>
    </div>
  );
}
