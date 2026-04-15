-- ============================================================
-- TMS: Add standort (starting location) to trucks
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE trucks
  ADD COLUMN IF NOT EXISTS standort_plz  TEXT,
  ADD COLUMN IF NOT EXISTS standort_ort  TEXT,
  ADD COLUMN IF NOT EXISTS standort_land TEXT DEFAULT 'AT';

COMMENT ON COLUMN trucks.standort_plz  IS 'PLZ des Heimatstandorts / Startpunkts des LKW';
COMMENT ON COLUMN trucks.standort_ort  IS 'Ort des Heimatstandorts / Startpunkts des LKW';
COMMENT ON COLUMN trucks.standort_land IS 'Land des Heimatstandorts (ISO-Code, z.B. AT, DE)';
