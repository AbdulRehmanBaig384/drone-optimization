"use client";

import React from "react";
import { Grid } from "@react-three/drei";

export function CityGround() {
  return (
    <group>
      {/* Fog */}
      <fog attach="fog" args={['#0f172a', 10, 50]} />
      
      {/* Lights */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#4fd1c5" />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0f172a" roughness={1} metalness={0} />
      </mesh>

      {/* Grid */}
      <Grid 
        args={[100, 100]} 
        position={[0, 0, 0]} 
        cellColor="#1e293b" 
        sectionColor="#334155"
        fadeDistance={40}
        cellSize={1}
        sectionSize={5}
      />
    </group>
  );
}
