"use client";

import { useMemo, useState } from "react";
import { formatInr } from "@/lib/format";
import { computeCityStats, nationalStats } from "@/lib/stats";
import { INDIAN_STATES } from "@/lib/states";
import { useReports } from "@/lib/store";

export default function CitiesPage() {
  const { reports } = useReports();
  const [state, setState] = useState("all");
  const all = useMemo(() => computeCityStats(reports), [reports]);
  const cities = state === "all" ? all : all.filter((c) => c.state === state);
  const stats = nationalStats(reports);
  const maxAvg = Math.max(1, ...cities.map((c) => c.avg));
  const ranked = [...cities].sort((a, b) => b.avg - a.avg);
  const most = ranked[0];
  const cleanest = [...ranked].reverse().find((c) => c.paid > 0);

  return (
    <>
      <header className="page-hero">
        <h1>Reports by city</h1>
        <p>Every city with at least one report, ordered by the average amount asked.</p>
        <div style={{ marginTop: 20, maxWidth: 280 }}>
          <select className="select" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="all">All states</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="stat-row">
        <div className="stat-block">
          <div className="stat-n">Most corrupt</div>
          <div className="stat-big" style={{ fontSize: 28 }}>
            {most ? formatInr(most.avg) : "—"}
          </div>
          <div className="stat-label">{most ? `${most.city}, ${most.state}` : "—"}</div>
        </div>
        <div className="stat-block">
          <div className="stat-n">Cleanest</div>
          <div className="stat-big" style={{ fontSize: 28 }}>
            {cleanest ? formatInr(cleanest.avg) : "—"}
          </div>
          <div className="stat-label">{cleanest ? `${cleanest.city}, ${cleanest.state}` : "—"}</div>
        </div>
        <div className="stat-block">
          <div className="stat-n">National avg</div>
          <div className="stat-big" style={{ fontSize: 28 }}>
            {formatInr(stats.avg)}
          </div>
          <div className="stat-label">{cities.length} cities in view</div>
        </div>
      </div>
      {cities.map((c, i) => (
        <div key={`${c.city}-${c.state}`} className="city-row">
          <div className="city-rank">{String(i + 1).padStart(2, "0")}</div>
          <div>
            <div className="city-name">{c.city}</div>
            <div className="city-state">
              {c.state} · {c.reports} reports
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)" }}>{c.avg ? formatInr(c.avg) : "—"}</div>
          <div className="city-bar">
            <span style={{ width: `${(c.avg / maxAvg) * 100}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}
