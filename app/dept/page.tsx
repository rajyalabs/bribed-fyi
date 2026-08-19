"use client";

import Link from "next/link";
import { formatInr } from "@/lib/format";
import { computeDeptStats } from "@/lib/stats";
import { useReports } from "@/lib/store";

export default function DeptPage() {
  const { reports } = useReports();
  const depts = computeDeptStats(reports);

  return (
    <>
      <header className="page-hero">
        <h1>Departments</h1>
        <p>Open a department for its reports, typical amounts and where they came from.</p>
      </header>
      <div className="dept-grid">
        {depts.map((d) => (
          <Link key={d.slug} href={`/dept/${d.slug}`} className="dept-card">
            <div className="dept-card-top">
              <div className="dept-init">{d.initials}</div>
              <div className="dept-count">{d.reports} reports</div>
            </div>
            <h3>{d.name}</h3>
            <div className="muted">{d.blurb}</div>
            <div className="muted" style={{ marginTop: 12 }}>
              avg {d.avg != null ? formatInr(d.avg) : "—"} · refused {d.refusedPct}%
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
