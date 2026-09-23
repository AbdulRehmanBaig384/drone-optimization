"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RouteWaypoint } from "../../types/flight";

interface UseRouteAnimationProps {
  waypoints: RouteWaypoint[];
  initialSpeed?: number;
}

export function useRouteAnimation({ waypoints, initialSpeed = 1 }: UseRouteAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  
  const [dronePosition, setDronePosition] = useState(new THREE.Vector3());
  const [droneQuaternion, setDroneQuaternion] = useState(new THREE.Quaternion());
  const [currentLegIndex, setCurrentLegIndex] = useState(0);

  // Reduce motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setProgress(1);
    }
  }, []);

  const curve = useMemo(() => {
    if (waypoints.length < 2) return null;
    const points = waypoints.map(wp => new THREE.Vector3(wp.x, 2, wp.z));
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  }, [waypoints]);

  const curveLength = useMemo(() => (curve ? curve.getLength() : 0), [curve]);

  useFrame((state, delta) => {
    if (!curve || !isPlaying || progress >= 1) return;

    // Base speed = e.g., 10 units per second
    const baseSpeed = 10;
    const increment = (baseSpeed * speed * delta) / (curveLength || 1);
    
    let nextProgress = progress + increment;
    if (nextProgress >= 1) {
      nextProgress = 1;
      setIsPlaying(false);
    }
    
    setProgress(nextProgress);
  });

  useFrame(() => {
    if (!curve) return;
    
    const pos = curve.getPointAt(progress);
    // Smooth tangent
    const tangent = curve.getTangentAt(Math.min(progress + 0.01, 1)).normalize();
    
    // LookAt matrix
    const up = new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4().lookAt(pos, pos.clone().add(tangent), up);
    const quat = new THREE.Quaternion().setFromRotationMatrix(m);

    setDronePosition(pos);
    setDroneQuaternion(quat);

    // Calculate current leg
    if (waypoints.length > 1) {
      const legLength = 1 / (waypoints.length - 1);
      const leg = Math.min(Math.floor(progress / legLength), waypoints.length - 2);
      setCurrentLegIndex(leg);
    }
  });

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const restart = useCallback(() => {
    setProgress(0);
    setIsPlaying(true);
  }, []);

  return {
    progress,
    dronePosition,
    droneQuaternion,
    currentLegIndex,
    isPlaying,
    play,
    pause,
    restart,
    setSpeed,
    speed,
    curve
  };
}
