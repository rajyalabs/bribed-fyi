-- Privacy: reports carry no submitter identifier at all. Rate limiting moves to a separate,
-- short-lived table that is purged on every write (rows older than 1 hour are useless anyway).
CREATE TABLE IF NOT EXISTS rate_limit (
  bucket TEXT NOT NULL,          -- salted, day-rotated hash of the connection
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket ON rate_limit(bucket, created_at);

-- Wipe existing hashes and drop the column (SQLite ≥3.35 supports DROP COLUMN; D1 does).
UPDATE reports SET submitter_hash = NULL;
DROP INDEX IF EXISTS idx_reports_submitter;
ALTER TABLE reports DROP COLUMN submitter_hash;
