"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CameraRigProps {
  mode: "follow" | "free";
  dronePosition: THREE.Vector3;
  curve: THREE.CatmullRomCurve3 | null;
  progress: number;
}

export function CameraRig({ mode, dronePosition, curve, progress }: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (mode === "follow" && curve) {
      // Calculate desired camera position (behind and above the drone)
      const tangent = curve.getTangentAt(Math.min(progress + 0.01, 1)).normalize();
      
      const offset = tangent.clone().multiplyScalar(-5).add(new THREE.Vector3(0, 4, 0));
      const desiredPos = dronePosition.clone().add(offset);
      
      // Lerp camera position
      camera.position.lerp(desiredPos, delta * 3);
      
      // Lerp lookAt
      const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      const desiredLookAt = dronePosition.clone();
      
      currentLookAt.lerp(desiredLookAt, delta * 5);
      camera.lookAt(currentLookAt);

      if (controlsRef.current) {
        controlsRef.current.target.copy(dronePosition);
      }
    }
  });

  return (
    <>
      <OrbitControls 
        ref={controlsRef} 
        enabled={mode === "free"} 
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}
