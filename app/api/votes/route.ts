import { NextResponse } from "next/server";
import { anonHash } from "@/lib/server/anon";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Kind = "helpful" | "fake";

/** Returns this visitor's votes: { [report_id]: kind } */
export async function GET() {
  const db = await getDb();
  const voter = await anonHash();
  const { results } = await db
    .prepare(`SELECT report_id, kind FROM votes WHERE voter_hash = ?1`)
    .bind(voter)
    .all<{ report_id: string; kind: Kind }>();
  const votes: Record<string, Kind> = {};
  for (const r of results ?? []) votes[r.report_id] = r.kind;
  return NextResponse.json({ votes });
}

/** Toggle a vote. Same kind again removes it; other kind switches it. */
export async function POST(req: Request) {
  let body: { id?: string; kind?: Kind };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, kind } = body;
  if (!id || (kind !== "helpful" && kind !== "fake")) {
    return NextResponse.json({ error: "id and kind required" }, { status: 400 });
  }

  const db = await getDb();
  const voter = await anonHash();

  const exists = await db.prepare(`SELECT 1 FROM reports WHERE id = ?1`).bind(id).first();
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = await db
    .prepare(`SELECT kind FROM votes WHERE report_id = ?1 AND voter_hash = ?2`)
    .bind(id, voter)
    .first<{ kind: Kind }>();

  let vote: Kind | null;
  if (current?.kind === kind) {
    await db.prepare(`DELETE FROM votes WHERE report_id = ?1 AND voter_hash = ?2`).bind(id, voter).run();
    vote = null;
  } else {
    await db
      .prepare(
        `INSERT INTO votes (report_id, voter_hash, kind, created_at) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(report_id, voter_hash) DO UPDATE SET kind = excluded.kind, created_at = excluded.created_at`,
      )
      .bind(id, voter, kind, new Date().toISOString())
      .run();
    vote = kind;
  }

  const counts = await db
    .prepare(
      `SELECT
         SUM(CASE WHEN kind = 'helpful' THEN 1 ELSE 0 END) AS helpful,
         SUM(CASE WHEN kind = 'fake' THEN 1 ELSE 0 END) AS fake
       FROM votes WHERE report_id = ?1`,
    )
    .bind(id)
    .first<{ helpful: number | null; fake: number | null }>();

  return NextResponse.json({ vote, helpful: counts?.helpful ?? 0, fake: counts?.fake ?? 0 });
}
