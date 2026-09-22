-- ============================================================
-- supabase/schema.sql
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- Creates all tables for the Drone Delivery Route Optimization System
-- ============================================================

-- Enable UUID extension (optional, we use serial PKs here)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Locations ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id        SERIAL PRIMARY KEY,
  name      TEXT    NOT NULL,
  pos_x     FLOAT   NOT NULL,  -- x-coordinate on the city map (0-100 scale)
  pos_y     FLOAT   NOT NULL   -- y-coordinate on the city map (0-100 scale)
);

-- ── Edges (bidirectional city routes) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS edges (
  id              SERIAL PRIMARY KEY,
  from_location   INT     NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_location     INT     NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  distance        FLOAT   NOT NULL,     -- km
  travel_time     FLOAT   NOT NULL,     -- minutes
  energy_cost     FLOAT   NOT NULL,     -- battery units consumed
  CONSTRAINT edges_no_self_loop CHECK (from_location <> to_location)
);

-- ── Drones ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drones (
  id                  SERIAL PRIMARY KEY,
  name                TEXT    NOT NULL,
  battery_capacity    FLOAT   NOT NULL,   -- max battery units
  current_battery     FLOAT   NOT NULL,   -- current battery units
  current_location    INT     NOT NULL REFERENCES locations(id) ON DELETE SET NULL,
  status              TEXT    NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'in_flight', 'charging', 'offline'))
);

-- ── Delivery Requests ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_requests (
  id              SERIAL PRIMARY KEY,
  destination     INT     NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  priority        INT     NOT NULL DEFAULT 3
    CHECK (priority BETWEEN 1 AND 5),    -- 1=highest, 5=lowest
  package_weight  FLOAT   NOT NULL DEFAULT 1.0,  -- kg
  status          TEXT    NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'assigned', 'in_flight', 'delivered', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Assignments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id              SERIAL PRIMARY KEY,
  delivery_id     INT     NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  drone_id        INT     NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  route           JSONB   NOT NULL,           -- ordered array of location ids
  total_distance  FLOAT   NOT NULL,           -- km
  total_energy    FLOAT   NOT NULL,           -- battery units consumed
  algorithm_used  TEXT    NOT NULL,           -- 'dijkstra' | 'astar' | 'dijkstra+astar'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_edges_from   ON edges(from_location);
CREATE INDEX IF NOT EXISTS idx_edges_to     ON edges(to_location);
CREATE INDEX IF NOT EXISTS idx_drones_status ON drones(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_priority ON delivery_requests(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_delivery ON assignments(delivery_id);
CREATE INDEX IF NOT EXISTS idx_assignments_drone    ON assignments(drone_id);
