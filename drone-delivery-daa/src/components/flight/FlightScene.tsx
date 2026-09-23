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

interface FlightSceneProps {
  route: FlightRoute;
  locations?: Location[];
  edges?: Edge[];
}

function SceneContent({ route, locations = [], edges = [] }: { route: FlightRoute, locations?: Location[], edges?: Edge[] }) {
  const {
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
  } = useRouteAnimation({ waypoints: route.waypoints });

  const [cameraMode, setCameraMode] = useState<"follow" | "free">("free");

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

      <RouteLine curve={curve} />
      <RouteTrail curve={curve} progress={progress} />

      {route.waypoints.map((wp, i) => {
        let type: "start" | "waypoint" | "destination" = "waypoint";
        if (i === 0) type = "start";
        else if (i === route.waypoints.length - 1) type = "destination";
        
        return (
          <WaypointBeacon 
            key={wp.id}
            type={type}
            position={[wp.x, 0, wp.z]}
            label={wp.name}
            passed={i <= currentLegIndex}
          />
        );
      })}

      <Drone position={dronePosition} quaternion={droneQuaternion} />
      
      <CameraRig 
        mode={cameraMode} 
        dronePosition={dronePosition} 
        curve={curve}
        progress={progress}
      />

      <Html fullscreen zIndexRange={[100, 0]}>
        <FlightHUD 
          route={route}
          progress={progress}
          currentLegIndex={currentLegIndex}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          onRestart={restart}
          speed={speed}
          onSpeedChange={setSpeed}
          cameraMode={cameraMode}
          onCameraModeToggle={() => setCameraMode(m => m === "follow" ? "free" : "follow")}
        />
      </Html>
    </>
  );
}

export function FlightScene({ route, locations, edges }: FlightSceneProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#0f172a" }}>
      <Canvas shadows camera={{ position: [20, 30, 30], fov: 45 }}>
        <SceneContent route={route} locations={locations} edges={edges} />
      </Canvas>
    </div>
  );
}
