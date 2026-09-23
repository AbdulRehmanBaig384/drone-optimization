import React from "react";
import { FlightScene } from "../../../components/flight/FlightScene";
import { FlightRoute } from "../../../types/flight";

export default function FlightViewPage() {
  // Sample fallback route data matching the 10 Meridian City locations
  const sampleRoute: FlightRoute = {
    waypoints: [
      { id: 1, name: "Central Hub", x: 0, z: 0 },
      { id: 2, name: "Downtown", x: 2, z: 12 },
      { id: 3, name: "South Complex", x: -5, z: 20 },
      { id: 4, name: "Industrial Park", x: 25, z: 18 },
    ],
    totalDistance: 45.2,
    totalEnergy: 1250,
    algorithm: "astar",
    nodesExplored: 24,
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <FlightScene route={sampleRoute} />
    </div>
  );
}
