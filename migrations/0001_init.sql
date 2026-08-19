CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL,
  department_name TEXT NOT NULL,
  department_slug TEXT NOT NULL,
  service_name TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  mode TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL,
  official_role TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL,
  outcome TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  featured INTEGER NOT NULL DEFAULT 0,
  submitter_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_dept ON reports(department_slug);
CREATE INDEX IF NOT EXISTS idx_reports_submitter ON reports(submitter_hash, created_at);

CREATE TABLE IF NOT EXISTS votes (
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('helpful','fake')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (report_id, voter_hash)
);
CREATE INDEX IF NOT EXISTS idx_votes_report ON votes(report_id);
