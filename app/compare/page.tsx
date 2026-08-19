"use client";

import { useMemo, useState } from "react";
import { DEPARTMENTS } from "@/lib/departments";
import { formatInr } from "@/lib/format";
import { computeDeptStats } from "@/lib/stats";
import { useReports } from "@/lib/store";

const PRESETS = [
  ["rto", "police", "RTO vs Police"],
  ["rto", "municipal-corp", "RTO vs MCD"],
  ["police", "passport", "Police vs Passport"],
  ["municipal-corp", "electricity-board", "MCD vs Electricity"],
] as const;

export default function ComparePage() {
  const { reports } = useReports();
  const stats = computeDeptStats(reports);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const left = stats.find((d) => d.slug === a);
  const right = stats.find((d) => d.slug === b);

  const citiesA = useMemo(
    () => new Set(reports.filter((r) => r.department_slug === a).map((r) => r.city)).size,
    [reports, a],
  );
  const citiesB = useMemo(
    () => new Set(reports.filter((r) => r.department_slug === b).map((r) => r.city)).size,
    [reports, b],
  );

  return (
    <>
      <header className="page-hero">
        <h1>
          Compare
          <br />
          <em>departments.</em>
        </h1>
        <p>
          Put two departments next to each other: typical amounts, how many reports, which cities, and how often people
          refused.
        </p>
        <div className="compare-picks">
          {PRESETS.map(([x, y, label]) => (
            <button key={label} className="filter-pill" onClick={() => { setA(x); setB(y); }}>
              {label}
            </button>
          ))}
        </div>
      </header>
      <div className="sec" style={{ paddingTop: 0 }}>
        <div className="compare-grid">
          <div className="compare-col">
            <select className="select" value={a} onChange={(e) => setA(e.target.value)}>
              <option value="">Select department A</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
            {left && <DeptPane d={left} cities={citiesA} />}
          </div>
          <div className="compare-vs">VS</div>
          <div className="compare-col">
            <select className="select" value={b} onChange={(e) => setB(e.target.value)}>
              <option value="">Select department B</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
            {right && <DeptPane d={right} cities={citiesB} />}
          </div>
        </div>
        {!a || !b ? (
          <p className="empty" style={{ textAlign: "center" }}>
            CHOOSE TWO DEPARTMENTS
            <br />
            OR TAP ONE OF THE PAIRINGS ABOVE
          </p>
        ) : null}
      </div>
    </>
  );
}

function DeptPane({
  d,
  cities,
}: {
  d: ReturnType<typeof computeDeptStats>[number];
  cities: number;
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 16 }}>{d.name}</h2>
      <div className="compare-metric">
        <span>Reports</span>
        <b>{d.reports}</b>
      </div>
      <div className="compare-metric">
        <span>Average bribe</span>
        <b>{d.avg != null ? formatInr(d.avg) : "—"}</b>
      </div>
      <div className="compare-metric">
        <span>Refusal rate</span>
        <b>{d.refusedPct}%</b>
      </div>
      <div className="compare-metric">
        <span>Got work done</span>
        <b>{d.helpedPct}%</b>
      </div>
      <div className="compare-metric">
        <span>Cities</span>
        <b>{cities}</b>
      </div>
    </div>
  );
}
