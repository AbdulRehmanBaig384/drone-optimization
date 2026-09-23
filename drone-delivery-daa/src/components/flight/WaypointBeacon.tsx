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
  
  const baseColor = isDest ? "#f6ad55" : isStart ? "#63b3ed" : "#4fd1c5";
  const activeColor = passed || isStart ? baseColor : "#4a5568";
  
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
          background: isDest ? 'rgba(221, 107, 32, 0.8)' : 'rgba(49, 151, 149, 0.8)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          border: `1px solid ${baseColor}`,
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          {isDest && "DEST: "}{label}
        </div>
      </Html>
    </group>
  );
}
