"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Votes } from "@/components/Votes";
import { dailyWageMultiple, formatDate, formatInr, modeLabel, outcomeLabel } from "@/lib/format";
import { useReports } from "@/lib/store";
import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { reports, ready } = useReports();
  const listed = reports.find((x) => x.id === id);
  const [fetched, setFetched] = useState<{ report: Report; hidden: boolean } | null | undefined>(undefined);

  // Not in the public list (hidden by community flags, or a fresh id) — fetch it directly.
  useEffect(() => {
    if (!ready || listed) return;
    let cancelled = false;
    fetch(`/api/reports/${id}`)
      .then((res) => (res.ok ? (res.json() as Promise<{ report: Report; hidden: boolean }>) : null))
      .then((d) => {
        if (!cancelled) setFetched(d);
      })
      .catch(() => {
        if (!cancelled) setFetched(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, ready, listed]);

  const r = listed ?? fetched?.report;
  const hidden = !listed && Boolean(fetched?.hidden);

  if (!ready || (!listed && fetched === undefined)) return <div className="detail">Loading…</div>;
  if (!r) {
    return (
      <div className="detail">
        <Link href="/" className="back-link">
          ← Live reports
        </Link>
        <h1>Report not found</h1>
        <p style={{ color: "var(--mid)" }}>No report with this id exists.</p>
      </div>
    );
  }

  const wage = dailyWageMultiple(r.amount);

  return (
    <article className="detail">
      {hidden && (
        <p className="hidden-banner" role="status">
          Hidden from the public feed: readers have flagged this report as fake ({r.fake_count} fake vs {r.helpful_count}{" "}
          helpful). It stays on record and reappears if helpful votes catch up.
        </p>
      )}
      <Link href="/" className="back-link">
        ← Live reports
      </Link>
      <div className="detail-kicker">
        {r.department_name} · {r.city}, {r.state}
      </div>
      <h1>
        {r.report_type === "refused"
          ? `Someone refused a bribe at ${r.department_name}, ${r.city}`
          : `₹${r.amount.toLocaleString("en-IN")} bribe at ${r.department_name}, ${r.city}`}
      </h1>
      <div className="detail-amt">
        {r.report_type === "refused" ? "Refused" : formatInr(r.amount)}
        {wage && <span style={{ fontSize: 14, color: "var(--mid)", marginLeft: 10 }}>({wage})</span>}
      </div>
      {r.note && <p className="detail-note">{r.note}</p>}
      <div className="detail-facts">
        <div>
          <small>When</small>
          {formatDate(r.created_at)}
        </div>
        <div>
          <small>Type</small>
          {r.report_type === "refused" ? "Refused" : "Paid"}
        </div>
        <div>
          <small>Mode</small>
          {modeLabel(r.mode)}
        </div>
        <div>
          <small>Outcome</small>
          {outcomeLabel(r.outcome)}
        </div>
        <div>
          <small>Role</small>
          {r.official_role || "—"}
        </div>
        <div>
          <small>Status</small>
          {r.status}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Votes id={r.id} helpful={r.helpful_count} fake={r.fake_count} />
      </div>
    </article>
  );
}
