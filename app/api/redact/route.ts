import { NextResponse } from "next/server";
import { getDb, getEnv } from "@/lib/server/db";
import { makeRedactor } from "@/lib/server/redact";

export const dynamic = "force-dynamic";

/** Preview: returns the masked version of free-text fields so the reporter sees what will be published. */
export async function POST(req: Request) {
  let body: { note?: string; official_role?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const note = String(body.note ?? "").slice(0, 2000);
  const official_role = String(body.official_role ?? "").slice(0, 120);
  const redactor = makeRedactor(await getDb(), (await getEnv()).AI ?? null);
  const [n, r] = await Promise.all([redactor.redact(note), redactor.redact(official_role)]);
  return NextResponse.json({ note: n, official_role: r, changed: n !== note || r !== official_role });
}
