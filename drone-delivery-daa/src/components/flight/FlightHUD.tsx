"use client";

import React from "react";
import { FlightRoute } from "../../types/flight";

interface FlightHUDProps {
  route: FlightRoute;
  progress: number;
  currentLegIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  cameraMode: "follow" | "free";
  onCameraModeToggle: () => void;
}

export function FlightHUD({
  route,
  progress,
  currentLegIndex,
  isPlaying,
  onPlay,
  onPause,
  onRestart,
  speed,
  onSpeedChange,
  cameraMode,
  onCameraModeToggle
}: FlightHUDProps) {
  const distanceCovered = (route.totalDistance * progress).toFixed(1);
  const distanceRemaining = (route.totalDistance * (1 - progress)).toFixed(1);
  const percent = Math.round(progress * 100);

  const nextWaypointIndex = Math.min(currentLegIndex + 1, route.waypoints.length - 1);
  const nextWaypoint = route.waypoints[nextWaypointIndex];

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "20px",
      boxSizing: "border-box",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Breadcrumb */}
        <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "10px 15px", borderRadius: "8px", pointerEvents: "auto", border: "1px solid #334155" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>ROUTE PROGRESS</div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", maxWidth: "400px" }}>
            {route.waypoints.map((wp, i) => (
              <React.Fragment key={wp.id}>
                <span style={{ 
                  color: i === currentLegIndex ? "#4fd1c5" : i < currentLegIndex ? "#cbd5e1" : "#475569",
                  fontWeight: i === currentLegIndex ? "bold" : "normal"
                }}>
                  {wp.name}
                </span>
                {i < route.waypoints.length - 1 && <span style={{ color: "#475569" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: "8px", fontSize: "14px", fontWeight: "bold", color: "#f8fafc" }}>
            {progress < 1 ? `En route to ${nextWaypoint.name}` : "Arrived at Destination"}
          </div>
        </div>

        {/* Algorithm Badge */}
        <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>ALGORITHM</span>
          <div style={{ fontWeight: "bold", textTransform: "capitalize", color: "#f1f5f9" }}>
            {route.algorithm} · {route.nodesExplored} nodes explored
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: "15px", borderRadius: "8px", pointerEvents: "auto", border: "1px solid #334155" }}>
        
        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
          <div>Covered: <span style={{ color: "#4fd1c5", fontWeight: "bold" }}>{distanceCovered}km</span></div>
          <div>Remaining: <span style={{ color: "#f6ad55", fontWeight: "bold" }}>{distanceRemaining}km</span></div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: "100%", height: "6px", background: "#334155", borderRadius: "3px", marginBottom: "15px", overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: "#4fd1c5", transition: "width 0.1s linear" }} />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={isPlaying ? onPause : onPlay}
              style={{ background: "#4fd1c5", color: "#0f172a", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button 
              onClick={onRestart}
              style={{ background: "#334155", color: "white", border: "1px solid #475569", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
            >
              Restart
            </button>
            
            {/* Speed Selector */}
            <div style={{ display: "flex", background: "#1e293b", borderRadius: "4px", overflow: "hidden", border: "1px solid #334155" }}>
              {[0.5, 1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  style={{
                    background: speed === s ? "#475569" : "transparent",
                    color: speed === s ? "white" : "#94a3b8",
                    border: "none",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onCameraModeToggle}
            style={{ background: "#334155", color: "white", border: "1px solid #475569", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
          >
            Camera: {cameraMode === "follow" ? "Follow" : "Free Orbit"}
          </button>
        </div>
      </div>
    </div>
  );
}
