-- ============================================================
-- TMS: Sendungen (Sendeaufträge) + Zuweisungen (Truck ↔ Sendung)
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Sendungen ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sendungen (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referenz
  referenz      TEXT NOT NULL,

  -- Kunde (nullable → Unternehmen)
  kunde_id      UUID REFERENCES unternehmen(id) ON DELETE SET NULL,

  -- Ladeort
  lade_plz      TEXT,
  lade_ort      TEXT NOT NULL,
  lade_adresse  TEXT,
  lade_land     TEXT DEFAULT 'AT',

  -- Entladeort
  entlade_plz   TEXT,
  entlade_ort   TEXT NOT NULL,
  entlade_adresse TEXT,
  entlade_land  TEXT DEFAULT 'AT',

  -- Zeitfenster
  ladedatum     DATE NOT NULL,
  ladezeit      TIME,
  entladedatum  DATE NOT NULL,
  entladezeit   TIME,

  -- Ladung
  gewicht       NUMERIC,                   -- kg
  packungseinheit TEXT DEFAULT 'europalette',
  anzahl        INTEGER,                   -- # units
  lademeter     NUMERIC,                   -- ldm (auto or manual)

  -- Preis
  verkaufspreis NUMERIC,                   -- € customer pays

  -- Status
  status        TEXT NOT NULL DEFAULT 'offen'
                CHECK (status IN ('offen','zugewiesen','unterwegs','abgeschlossen','storniert')),

  -- Soft delete + timestamps
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_sendungen_status ON sendungen(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sendungen_kunde  ON sendungen(kunde_id) WHERE deleted_at IS NULL;

-- Auto-update updated_at (safe: only creates if not exists)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sendungen_updated'
  ) THEN
    CREATE TRIGGER trg_sendungen_updated
      BEFORE UPDATE ON sendungen
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END;
$$;


-- ── 2. Zuweisungen (Truck ↔ Sendung) ────────────────────────
-- One truck can carry many sendungen. One sendung is on exactly one truck.
-- This is the join table created when you drag a Sendung onto a Truck.
CREATE TABLE IF NOT EXISTS truck_sendungen (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id      UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  sendung_id    UUID NOT NULL REFERENCES sendungen(id) ON DELETE CASCADE,

  -- Snapshot of relevant data at assignment time (for quick display)
  position      INTEGER DEFAULT 0,        -- ordering on the truck

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each sendung can only be on one truck at a time
  UNIQUE(sendung_id)
);

CREATE INDEX IF NOT EXISTS idx_truck_sendungen_truck   ON truck_sendungen(truck_id);
CREATE INDEX IF NOT EXISTS idx_truck_sendungen_sendung ON truck_sendungen(sendung_id);


-- ── 3. RLS Policies (adjust to your auth setup) ─────────────
ALTER TABLE sendungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_sendungen ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (tighten as needed)
CREATE POLICY "sendungen_all" ON sendungen
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "truck_sendungen_all" ON truck_sendungen
  FOR ALL USING (true) WITH CHECK (true);
