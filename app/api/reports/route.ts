import { NextResponse } from "next/server";
import { deptBySlug } from "@/lib/departments";
import { checkAndRecordRateLimit, getDb, getEnv, rateLimitBucket, REPORT_SELECT, rowToReport } from "@/lib/server/db";
import { makeRedactor } from "@/lib/server/redact";
import { STATE_BY_NAME, codeForState } from "@/lib/states";
import type { Outcome, PayMode, ReportDraft, ReportType } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_PER_HOUR = 5;
const MODES: PayMode[] = ["cash", "upi", "agent", "other"];
const OUTCOMES: Outcome[] = ["helped", "partial", "no_help"];
const TYPES: ReportType[] = ["bribe_paid", "refused"];

export async function GET() {
  const db = await getDb();
  const { results } = await db
    // Community rule (no human moderators): hide from the public feed once a report has ≥5 "fake" flags
    // and at least twice as many fake as helpful. Never deleted; still reachable by direct link.
    .prepare(
      `${REPORT_SELECT} WHERE r.status = 'approved'
         AND NOT ((SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.kind = 'fake') >= 5
              AND (SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.kind = 'fake')
                  >= 2 * (SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.kind = 'helpful'))
       ORDER BY r.created_at DESC LIMIT 2000`,
    )
    .all();
  return NextResponse.json({ reports: (results ?? []).map((r) => rowToReport(r as never)) });
}

export async function POST(req: Request) {
  let body: Partial<ReportDraft>;
  try {
    body = (await req.json()) as Partial<ReportDraft>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const report_type = body.report_type;
  const note = String(body.note ?? "").trim();
  const city = String(body.city ?? "").trim();
  const state = String(body.state ?? "");
  const amount = Number(body.amount ?? 0);
  const mode = body.mode;
  const outcome = body.outcome;
  const department_slug = String(body.department_slug ?? "");
  const official_role = String(body.official_role ?? "").trim().slice(0, 120);

  if (!report_type || !TYPES.includes(report_type)) return bad("report_type");
  if (!mode || !MODES.includes(mode)) return bad("mode");
  if (!outcome || !OUTCOMES.includes(outcome)) return bad("outcome");
  if (!department_slug) return bad("department_slug");
  if (!city || city.length > 80) return bad("city");
  if (!STATE_BY_NAME[state]) return bad("state");
  if (note.length < 10 || note.length > 2000) return bad("note");
  if (report_type === "bribe_paid" && !(amount > 0 && amount <= 10_000_000)) return bad("amount");

  const db = await getDb();
  if (await checkAndRecordRateLimit(db, await rateLimitBucket(req), MAX_PER_HOUR)) {
    return NextResponse.json({ error: "Too many reports from this connection. Try again later." }, { status: 429 });
  }

  const redactor = makeRedactor(db, (await getEnv()).AI ?? null);
  const [safeNote, safeRole] = await Promise.all([redactor.redact(note), redactor.redact(official_role)]);

  const dept = deptBySlug(department_slug);
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO reports (id, department_id, department_name, department_slug, service_name, amount, currency, mode,
         city, state, state_code, official_role, note, outcome, report_type, status, featured, created_at)
       VALUES (?1, ?2, ?3, ?4, '', ?5, 'INR', ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'approved', 0, ?14)`,
    )
    .bind(
      id,
      dept?.id ?? "other",
      dept?.name ?? department_slug,
      department_slug,
      report_type === "refused" ? 0 : Math.round(amount),
      mode,
      city,
      state,
      codeForState(state),
      safeRole,
      safeNote,
      outcome,
      report_type,
      created_at,
    )
    .run();

  const row = await db.prepare(`${REPORT_SELECT} WHERE r.id = ?1`).bind(id).first();
  return NextResponse.json({ report: rowToReport(row as never) }, { status: 201 });
}

function bad(field: string) {
  return NextResponse.json({ error: `Invalid or missing field: ${field}` }, { status: 400 });
}
