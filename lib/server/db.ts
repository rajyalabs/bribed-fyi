import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Report } from "@/lib/types";

export async function getEnv() {
  const { env } = await getCloudflareContext({ async: true });
  return env as { DB?: D1Database; AI?: Ai; HASH_SALT?: string; ADMIN_TOKEN?: string };
}

export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as { DB?: D1Database }).DB;
  if (!db) throw new Error("D1 binding `DB` is not configured");
  return db;
}

type Row = Omit<Report, "featured" | "helpful_count" | "fake_count"> & {
  featured: number;
  helpful_count: number | null;
  fake_count: number | null;
};

export const REPORT_SELECT = `
  SELECT r.id, r.department_id, r.department_name, r.department_slug, r.service_name, r.amount, r.currency,
         r.mode, r.city, r.state, r.state_code, r.official_role, r.note, r.outcome, r.report_type, r.status,
         r.featured, r.created_at,
         (SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.kind = 'helpful') AS helpful_count,
         (SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.kind = 'fake') AS fake_count
  FROM reports r`;

export function rowToReport(row: Row): Report {
  return {
    ...row,
    featured: Boolean(row.featured),
    helpful_count: row.helpful_count ?? 0,
    fake_count: row.fake_count ?? 0,
  };
}

export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Short-lived rate-limit bucket for a connection: sha256(secret salt + today's date + IP).
 * The raw IP is never stored, the hash rotates daily (so it cannot be verified after the day),
 * and it is only ever written to the `rate_limit` table, whose rows are purged after one hour.
 * Reports themselves carry no submitter identifier.
 */
export async function rateLimitBucket(req: Request): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  const salt = (env as { HASH_SALT?: string }).HASH_SALT ?? "bribed-fyi-dev-salt";
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "0.0.0.0";
  const day = new Date().toISOString().slice(0, 10);
  return sha256(`${salt}:${day}:${ip}`);
}

/** Returns true if this connection has hit the hourly cap; records the attempt otherwise. Purges stale rows. */
export async function checkAndRecordRateLimit(db: D1Database, bucket: string, maxPerHour: number): Promise<boolean> {
  const cutoff = new Date(Date.now() - 3600_000).toISOString();
  await db.prepare(`DELETE FROM rate_limit WHERE created_at < ?1`).bind(cutoff).run();
  const recent = await db
    .prepare(`SELECT COUNT(*) AS n FROM rate_limit WHERE bucket = ?1 AND created_at >= ?2`)
    .bind(bucket, cutoff)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= maxPerHour) return true;
  await db.prepare(`INSERT INTO rate_limit (bucket, created_at) VALUES (?1, ?2)`).bind(bucket, new Date().toISOString()).run();
  return false;
}
