-- ============================================================
-- supabase/seed.sql
-- Sample data for the Drone Delivery Route Optimization System
-- Run AFTER schema.sql
-- Safe to re-run: deletes existing rows first (TRUNCATE with CASCADE)
-- ============================================================

-- Clear existing data (order matters due to FK constraints)
TRUNCATE TABLE assignments       RESTART IDENTITY CASCADE;
TRUNCATE TABLE delivery_requests RESTART IDENTITY CASCADE;
TRUNCATE TABLE drones            RESTART IDENTITY CASCADE;
TRUNCATE TABLE edges             RESTART IDENTITY CASCADE;
TRUNCATE TABLE locations         RESTART IDENTITY CASCADE;

-- ── Locations (8 fictional city districts) ────────────────────────────────────
-- Coordinates on a 0-100 scale representing a city grid
INSERT INTO locations (name, pos_x, pos_y) VALUES
  ('Central Hub',       50.0, 50.0),   -- id=1  (main depot)
  ('North Market',      50.0, 85.0),   -- id=2
  ('East Industrial',   85.0, 50.0),   -- id=3
  ('South Residential', 50.0, 15.0),   -- id=4
  ('West Campus',       15.0, 50.0),   -- id=5
  ('NE Commerce',       80.0, 80.0),   -- id=6
  ('SE Harbor',         80.0, 20.0),   -- id=7
  ('SW Park',           20.0, 20.0),   -- id=8
  ('NW Hospital',       20.0, 80.0),   -- id=9
  ('Midtown Plaza',     50.0, 50.0);   -- id=10 (near hub, different zone)

-- ── Edges (18 weighted connections) ───────────────────────────────────────────
-- distance (km), travel_time (minutes), energy_cost (battery units)
-- Energy cost is roughly proportional to distance but varies by terrain
INSERT INTO edges (from_location, to_location, distance, travel_time, energy_cost) VALUES
  -- Hub (1) connections
  (1, 2,  3.5, 7.0,  4.2),   -- Hub → North Market
  (1, 3,  3.5, 7.0,  4.2),   -- Hub → East Industrial
  (1, 4,  3.5, 7.0,  4.2),   -- Hub → South Residential
  (1, 5,  3.5, 7.0,  4.2),   -- Hub → West Campus
  (1, 10, 0.5, 1.0,  0.5),   -- Hub → Midtown Plaza (very close)
  -- Ring connections (outer district to outer district)
  (2, 6,  4.2, 8.5,  5.5),   -- North Market → NE Commerce
  (2, 9,  4.2, 8.5,  4.8),   -- North Market → NW Hospital
  (3, 6,  4.2, 8.5,  5.0),   -- East Industrial → NE Commerce
  (3, 7,  4.2, 8.5,  5.8),   -- East Industrial → SE Harbor (heavy traffic)
  (4, 7,  4.2, 8.5,  5.0),   -- South Residential → SE Harbor
  (4, 8,  4.2, 8.5,  4.8),   -- South Residential → SW Park
  (5, 8,  4.2, 8.5,  4.5),   -- West Campus → SW Park
  (5, 9,  4.2, 8.5,  5.2),   -- West Campus → NW Hospital
  -- Diagonal shortcuts
  (6, 7,  6.0, 12.0, 7.5),   -- NE Commerce → SE Harbor
  (7, 8,  6.0, 12.0, 7.0),   -- SE Harbor → SW Park
  (8, 9,  6.0, 12.0, 7.5),   -- SW Park → NW Hospital
  (9, 6,  6.0, 12.0, 7.8),   -- NW Hospital → NE Commerce
  -- Midtown connections
  (10, 2, 3.0, 6.0,  3.8),   -- Midtown → North Market
  (10, 3, 3.0, 6.0,  3.8);   -- Midtown → East Industrial

-- ── Drones (4 drones with varying capacity and starting locations) ─────────────
INSERT INTO drones (name, battery_capacity, current_battery, current_location, status) VALUES
  ('DroneAlpha',   100.0,  95.0, 1, 'available'),   -- Almost full, at hub
  ('DroneBeta',    120.0,  80.0, 1, 'available'),   -- High capacity, at hub
  ('DroneGamma',    80.0,  60.0, 9, 'available'),   -- Medium capacity, NW Hospital
  ('DroneDelta',   150.0, 140.0, 3, 'available');   -- Max capacity, East Industrial

-- ── Sample Delivery Requests (5 pending deliveries) ───────────────────────────
INSERT INTO delivery_requests (destination, priority, package_weight, status) VALUES
  (6, 1, 2.5, 'pending'),   -- NE Commerce, urgent (P1), heavy package
  (8, 2, 1.0, 'pending'),   -- SW Park, high priority (P2)
  (7, 3, 1.5, 'pending'),   -- SE Harbor, medium priority (P3)
  (9, 1, 0.5, 'pending'),   -- NW Hospital, urgent (P1), medical supplies
  (2, 4, 3.0, 'pending');   -- North Market, low priority (P4)
