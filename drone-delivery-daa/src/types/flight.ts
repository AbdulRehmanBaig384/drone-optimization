export interface RouteWaypoint {
  id: number;
  name: string;
  x: number;
  z: number;
}

export interface FlightRoute {
  waypoints: RouteWaypoint[];
  totalDistance: number;
  totalEnergy: number;
  algorithm: "dijkstra" | "astar";
  nodesExplored: number;
}
