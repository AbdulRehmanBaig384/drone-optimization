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
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Glowing inner core */}
      <mesh>
        <boxGeometry args={[0.5, height * 0.99, 0.5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Label */}
      <Html
        position={[0, height / 2 + 0.5, 0]}
        center
        distanceFactor={15}
        zIndexRange={[100, 0]}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          userSelect: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}
