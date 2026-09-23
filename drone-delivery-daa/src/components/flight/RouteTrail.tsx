"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RouteTrailProps {
  curve: THREE.CatmullRomCurve3 | null;
  progress: number;
  color?: string;
}

export function RouteTrail({ curve, progress, color = "#4fd1c5" }: RouteTrailProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 100, 0.06, 8, false);
  }, [curve]);

  useFrame(() => {
    if (!meshRef.current || !geometry) return;
    const totalIndices = 100 * 8 * 6;
    const drawCount = Math.floor(progress * totalIndices);
    geometry.setDrawRange(0, drawCount);
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
