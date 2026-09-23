"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface RouteLineProps {
  curve: THREE.CatmullRomCurve3 | null;
  color?: string;
}

export function RouteLine({ curve, color = "#319795" }: RouteLineProps) {
  const geometry = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
  }, [curve]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}
