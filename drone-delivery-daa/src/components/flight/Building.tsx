"use client";

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";

interface BuildingProps {
  position: [number, number, number];
  name: string;
}

export function Building({ position, name }: BuildingProps) {
  // Random height for variety
  const height = useMemo(() => 2 + Math.random() * 4, []);
  
  return (
    <group position={[position[0], position[1] + height / 2, position[2]]}>
      {/* Core pillar */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial 
          color="#0f172a" 
          emissive="#38bdf8" 
          emissiveIntensity={0.15}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Glowing inner core */}
      <mesh>
        <boxGeometry args={[0.5, height * 0.99, 0.5]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      
      {/* Label */}
      <Html
        position={[0, height / 2 + 0.5, 0]}
        center
        distanceFactor={15}
        zIndexRange={[100, 0]}
      >
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          color: '#38bdf8',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
          pointerEvents: 'none',
          userSelect: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}
