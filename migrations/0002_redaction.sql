-- Lookup tables for server-side masking of personal names in submitted text.
CREATE TABLE IF NOT EXISTS redact_names (tok TEXT PRIMARY KEY) WITHOUT ROWID;
-- Multi-word Indian place names that contain a personal-name token (e.g. "karol bagh", "gandhi nagar") — never masked.
CREATE TABLE IF NOT EXISTS redact_places (phrase TEXT PRIMARY KEY) WITHOUT ROWID;
