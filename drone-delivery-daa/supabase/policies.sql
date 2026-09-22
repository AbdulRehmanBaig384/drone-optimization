-- ============================================================
-- supabase/policies.sql
-- Row-Level Security policies for the Drone Delivery system
-- Run AFTER schema.sql
--
-- Strategy: All authenticated users share the same data (single-tenant demo).
-- Clerk JWT is verified by Supabase using a shared JWT secret.
-- See README.md → Setup → Clerk + Supabase JWT integration.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments       ENABLE ROW LEVEL SECURITY;

-- ── locations — read/write for authenticated users ────────────────────────────
CREATE POLICY "Authenticated users can read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true);

-- ── edges — read/write for authenticated users ────────────────────────────────
CREATE POLICY "Authenticated users can read edges"
  ON edges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert edges"
  ON edges FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update edges"
  ON edges FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete edges"
  ON edges FOR DELETE
  TO authenticated
  USING (true);

-- ── drones — read/write for authenticated users ───────────────────────────────
CREATE POLICY "Authenticated users can read drones"
  ON drones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert drones"
  ON drones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update drones"
  ON drones FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete drones"
  ON drones FOR DELETE
  TO authenticated
  USING (true);

-- ── delivery_requests — read/write for authenticated users ────────────────────
CREATE POLICY "Authenticated users can read deliveries"
  ON delivery_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deliveries"
  ON delivery_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deliveries"
  ON delivery_requests FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete deliveries"
  ON delivery_requests FOR DELETE
  TO authenticated
  USING (true);

-- ── assignments — read/write for authenticated users ──────────────────────────
CREATE POLICY "Authenticated users can read assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (true);
