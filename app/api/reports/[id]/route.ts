import { NextResponse } from "next/server";
import { getDb, REPORT_SELECT, rowToReport } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const row = await db.prepare(`${REPORT_SELECT} WHERE r.id = ?1 AND r.status = 'approved'`).bind(id).first();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const report = rowToReport(row as never);
  const hidden = report.fake_count >= 5 && report.fake_count >= 2 * report.helpful_count;
  return NextResponse.json({ report, hidden });
}
