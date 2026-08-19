import { NextResponse } from "next/server";
import { getDb, getEnv } from "@/lib/server/db";
import { makeRedactor } from "@/lib/server/redact";

export const dynamic = "force-dynamic";

/**
 * Re-run the redactor over every stored report (note + official_role).
 * Protected by the ADMIN_TOKEN secret: `curl -X POST -H "x-admin-token: …" https://bribed.fyi/api/admin/remask`
 */
export async function POST(req: Request) {
  const env = await getEnv();
  const token = req.headers.get("x-admin-token");
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = await getDb();
  const redactor = makeRedactor(db, env.AI ?? null);
  const { results } = await db.prepare(`SELECT id, note, official_role FROM reports`).all<{ id: string; note: string; official_role: string }>();
  let changed = 0;
  const samples: Array<{ id: string; before: string; after: string }> = [];
  for (const r of results ?? []) {
    const [n, o] = await Promise.all([redactor.redact(r.note), redactor.redact(r.official_role)]);
    if (n !== r.note || o !== r.official_role) {
      await db.prepare(`UPDATE reports SET note = ?1, official_role = ?2 WHERE id = ?3`).bind(n, o, r.id).run();
      changed++;
      if (samples.length < 20) samples.push({ id: r.id, before: r.note, after: n });
    }
  }
  return NextResponse.json({ scanned: results?.length ?? 0, changed, samples });
}
