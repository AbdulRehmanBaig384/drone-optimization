"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { FlightRoute } from "../../types/flight";
import { CityGround } from "./CityGround";
import { Building } from "./Building";
import { RouteLine } from "./RouteLine";
import { RouteTrail } from "./RouteTrail";
import { WaypointBeacon } from "./WaypointBeacon";
import { Drone } from "./Drone";
import { CameraRig } from "./CameraRig";
import { FlightHUD } from "./FlightHUD";
import { useRouteAnimation } from "./useRouteAnimation";
import { GraphEdges } from "./GraphEdges";
import type { Location, Edge } from "@/types";

interface DualFlightSceneProps {
  route1: FlightRoute; // e.g., Dijkstra
  route2: FlightRoute; // e.g., A*
  locations?: Location[];
  edges?: Edge[];
  onSelectAlgorithm?: (algorithm: string) => void;
}

function DualSceneContent({ route1, route2, locations = [], edges = [], onSelectAlgorithm }: DualFlightSceneProps) {
  const anim1 = useRouteAnimation({ waypoints: route1.waypoints });
  const anim2 = useRouteAnimation({ waypoints: route2.waypoints });

  const [cameraMode, setCameraMode] = useState<"follow" | "free">("free");

  // Let's use anim1's controls for both drones for simplicity in HUD
  const isPlaying = anim1.isPlaying;
  const play = () => { anim1.play(); anim2.play(); };
  const pause = () => { anim1.pause(); anim2.pause(); };
  const restart = () => { anim1.restart(); anim2.restart(); };
  const setSpeed = (s: number) => { anim1.setSpeed(s); anim2.setSpeed(s); };
  const speed = anim1.speed;

  return (
    <>
      <CityGround />
      
      {locations.map((loc) => (
        <Building 
          key={loc.id} 
          position={[loc.pos_x - 50, 0, loc.pos_y - 50]} 
          name={loc.name} 
        />
      ))}

      {edges.length > 0 && <GraphEdges locations={locations} edges={edges} />}

      {/* Route 1 - Blue (Dijkstra) */}
      <RouteLine curve={anim1.curve} color="#3b82f6" />
      <RouteTrail curve={anim1.curve} progress={anim1.progress} color="#60a5fa" />
      <Drone position={anim1.dronePosition} quaternion={anim1.droneQuaternion} />

      {/* Route 2 - Green (A*) */}
      <RouteLine curve={anim2.curve} color="#10b981" />
      <RouteTrail curve={anim2.curve} progress={anim2.progress} color="#34d399" />
      <Drone position={anim2.dronePosition} quaternion={anim2.droneQuaternion} />

      {/* Waypoints for Route 1 */}
      {route1.waypoints.map((wp, i) => {
        let type: "start" | "waypoint" | "destination" = "waypoint";
        if (i === 0) type = "start";
        else if (i === route1.waypoints.length - 1) type = "destination";
        return (
          <WaypointBeacon 
            key={`r1-${wp.id}`}
            type={type}
            position={[wp.x, 0, wp.z]}
            label={wp.name}
            passed={i <= anim1.currentLegIndex}
          />
        );
      })}

      {/* Waypoints for Route 2 (only distinct ones?) For now we can render all, they might overlap. */}
      {route2.waypoints.map((wp, i) => {
        let type: "start" | "waypoint" | "destination" = "waypoint";
        if (i === 0) type = "start";
        else if (i === route2.waypoints.length - 1) type = "destination";
        return (
          <WaypointBeacon 
            key={`r2-${wp.id}`}
            type={type}
            position={[wp.x, 0, wp.z]}
            label={""} // hide label to avoid double rendering text
            passed={i <= anim2.currentLegIndex}
          />
        );
      })}
      
      <CameraRig 
        mode={cameraMode} 
        dronePosition={anim1.dronePosition} // Follow drone 1
        curve={anim1.curve}
        progress={anim1.progress}
      />

      <Html fullscreen zIndexRange={[100, 0]}>
        <div className="absolute inset-0 pointer-events-none">
          <FlightHUD 
            route={route1}
            progress={anim1.progress}
            currentLegIndex={anim1.currentLegIndex}
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onRestart={restart}
            speed={speed}
            onSpeedChange={setSpeed}
            cameraMode={cameraMode}
            onCameraModeToggle={() => setCameraMode(m => m === "follow" ? "free" : "follow")}
          />
          
          {/* Overlay Comparison Panel */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-surface-2/90 backdrop-blur border border-border-theme p-4 rounded-xl shadow-2xl pointer-events-auto">
            <h2 className="text-sm font-bold font-display text-white mb-4 text-center">Select Algorithm to Assign</h2>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Route 1 Stats */}
              <div className="p-3 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30">
                <p className="font-bold text-[#3b82f6] text-xs uppercase mb-2">🔵 {route1.algorithm}</p>
                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  <p>Nodes Explored: <span className="text-white">{route1.nodesExplored}</span></p>
                  <p>Distance: <span className="text-white">{route1.totalDistance.toFixed(2)} km</span></p>
                  <p>Energy: <span className="text-white">{route1.totalEnergy.toFixed(2)} units</span></p>
                </div>
                {onSelectAlgorithm && (
                  <button 
                    onClick={() => onSelectAlgorithm(route1.algorithm)}
                    className="mt-3 w-full py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold uppercase rounded shadow-lg transition-colors"
                  >
                    Select {route1.algorithm}
                  </button>
                )}
              </div>

              {/* Route 2 Stats */}
              <div className="p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30">
                <p className="font-bold text-[#10b981] text-xs uppercase mb-2">🟢 {route2.algorithm}</p>
                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  <p>Nodes Explored: <span className="text-white">{route2.nodesExplored}</span></p>
                  <p>Distance: <span className="text-white">{route2.totalDistance.toFixed(2)} km</span></p>
                  <p>Energy: <span className="text-white">{route2.totalEnergy.toFixed(2)} units</span></p>
                </div>
                {onSelectAlgorithm && (
                  <button 
                    onClick={() => onSelectAlgorithm(route2.algorithm)}
                    className="mt-3 w-full py-1.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold uppercase rounded shadow-lg transition-colors"
                  >
                    Select {route2.algorithm}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Html>
    </>
  );
}

export function DualFlightScene({ route1, route2, locations, edges, onSelectAlgorithm }: DualFlightSceneProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#0f172a" }}>
      <Canvas shadows camera={{ position: [20, 30, 30], fov: 45 }}>
        <DualSceneContent 
          route1={route1} 
          route2={route2} 
          locations={locations} 
          edges={edges} 
          onSelectAlgorithm={onSelectAlgorithm}
        />
      </Canvas>
    </div>
  );
}
