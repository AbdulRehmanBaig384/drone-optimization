"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DroneProps {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

export function Drone({ position, quaternion }: DroneProps) {
  const rotorRefs = useRef<THREE.Mesh[]>([]);
  const bobGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Spin rotors
    rotorRefs.current.forEach((rotor) => {
      if (rotor) rotor.rotation.y += 0.4;
    });
    
    // Hover bob
    if (bobGroupRef.current) {
      bobGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      {/* Bobbing animation wrapper */}
      <group ref={bobGroupRef}>
        {/* Drone Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.2, 0.6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.2} />
        </mesh>
        
        {/* Drone Arms & Rotors */}
        {[
          [0.4, 0.4], [0.4, -0.4], [-0.4, 0.4], [-0.4, -0.4]
        ].map((pos, i) => (
          <group key={i} position={[pos[0], 0.1, pos[1]]}>
            {/* Arm */}
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.2]} />
              <meshStandardMaterial color="#4a5568" />
            </mesh>
            {/* Rotor */}
            <mesh 
              ref={(el) => {
                if (el) rotorRefs.current[i] = el;
              }}
              position={[0, 0.05, 0]}
            >
              <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
              <meshStandardMaterial color="#4fd1c5" transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
