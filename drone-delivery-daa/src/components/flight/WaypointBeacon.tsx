"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface WaypointBeaconProps {
  type: "start" | "waypoint" | "destination";
  position: [number, number, number];
  label: string;
  passed: boolean;
}

export function WaypointBeacon({ type, position, label, passed }: WaypointBeaconProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  const isDest = type === "destination";
  const isStart = type === "start";
  
  const baseColor = isDest ? "#ffb454" : isStart ? "#41d6ff" : "#ffffff";
  const activeColor = passed || isStart ? baseColor : "#93a0be";
  
  useFrame((state) => {
    if (ringRef.current && (passed || isDest || isStart)) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* Ground Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color={activeColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Beacon Light */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshBasicMaterial color={activeColor} transparent opacity={passed ? 0.8 : 0.3} />
      </mesh>
      
      {/* Base Pad for start/destination */}
      {(isDest || isStart) && (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, 2.5, 0]} center distanceFactor={12}>
        <div style={{
          background: isDest ? 'rgba(255, 180, 84, 0.15)' : 'rgba(255, 255, 255, 0.15)',
          color: isDest ? '#ffb454' : '#ffffff',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          border: `1px solid ${isDest ? 'rgba(255, 180, 84, 0.4)' : 'rgba(255, 255, 255, 0.4)'}`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 12px ${isDest ? 'rgba(255, 180, 84, 0.2)' : 'rgba(0, 0, 0, 0.3)'}`,
          pointerEvents: 'none',
          userSelect: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          {isDest && "DEST: "}{label}
        </div>
      </Html>
    </group>
  );
}
