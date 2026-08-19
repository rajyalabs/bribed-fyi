"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Votes } from "@/components/Votes";
import { deptBySlug } from "@/lib/departments";
import { formatDate, formatInr, initials } from "@/lib/format";
import { computeCityStats, computeDeptStats } from "@/lib/stats";
import { useReports } from "@/lib/store";

export default function DeptDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { reports } = useReports();
  const dept = deptBySlug(slug);
  const mine = reports.filter((r) => r.department_slug === slug);
  const stat = computeDeptStats(reports).find((d) => d.slug === slug);
  const cities = computeCityStats(mine);

  if (!dept) {
    return (
      <div className="page-hero">
        <h1>Unknown department</h1>
      </div>
    );
  }

  return (
    <>
      <header className="page-hero">
        <Link href="/dept" className="back-link">
          ← All departments
        </Link>
        <h1>{dept.name}</h1>
        <p>
          {stat?.reports ?? 0} reports · average {stat?.avg != null ? formatInr(stat.avg) : "—"} · {stat?.refusedPct ?? 0}%
          refused · {dept.blurb}
        </p>
      </header>
      <div className="stat-row" style={{ borderTop: "1px solid var(--ink)" }}>
        <div className="stat-block">
          <div className="stat-big">{stat?.reports ?? 0}</div>
          <div className="stat-label">Reports</div>
        </div>
        <div className="stat-block">
          <div className="stat-big">{stat?.avg != null ? formatInr(stat.avg) : "—"}</div>
          <div className="stat-label">Average paid</div>
        </div>
        <div className="stat-block">
          <div className="stat-big">{stat?.refusedPct ?? 0}%</div>
          <div className="stat-label">Refusal rate</div>
        </div>
      </div>
      {cities.length > 0 && (
        <section className="sec" style={{ paddingTop: 32 }}>
          <h2 className="sec-h2" style={{ fontSize: 28, marginBottom: 16 }}>
            Cities
          </h2>
          {cities.slice(0, 12).map((c, i) => (
            <div key={`${c.city}-${c.state}`} className="city-row" style={{ cursor: "default" }}>
              <div className="city-rank">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="city-name">{c.city}</div>
                <div className="city-state">{c.state}</div>
              </div>
              <div>{formatInr(c.avg)}</div>
              <div className="muted">{c.reports} reports</div>
            </div>
          ))}
        </section>
      )}
      <section className="sec" style={{ paddingTop: 8 }}>
        <h2 className="sec-h2" style={{ fontSize: 28, marginBottom: 16 }}>
          Reports
        </h2>
        <div className="feed-grid">
          {mine.map((r) => (
            <Link key={r.id} className="feed-cell" href={`/reports/${r.id}`}>
              <div className="feed-top">
                <div className="feed-dept">
                  <div className="feed-avatar">{initials(r.department_name)}</div>
                  <div>
                    <div className="feed-dept-name">
                      {r.city}, {r.state}
                    </div>
                    <div className="feed-city">{formatDate(r.created_at)}</div>
                  </div>
                </div>
                <div className="feed-amt">{r.report_type === "refused" ? "Refused" : formatInr(r.amount)}</div>
              </div>
              {r.note && <p className="feed-note">“{r.note.slice(0, 160)}”</p>}
              <Votes id={r.id} helpful={r.helpful_count} fake={r.fake_count} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
