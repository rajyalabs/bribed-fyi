"use client";

import { useMemo, useState } from "react";
import { DEPARTMENTS } from "@/lib/departments";
import { formatInr } from "@/lib/format";
import { computeCityStats } from "@/lib/stats";
import { useReports } from "@/lib/store";

export default function KnowBeforePage() {
  const { reports } = useReports();
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");

  const deptReports = useMemo(
    () => reports.filter((r) => r.department_slug === slug),
    [reports, slug],
  );
  const cities = useMemo(() => computeCityStats(deptReports), [deptReports]);
  const scoped = city ? deptReports.filter((r) => r.city === city) : deptReports;
  const paid = scoped.filter((r) => r.report_type === "bribe_paid");
  const refused = scoped.filter((r) => r.report_type === "refused");
  const avg = paid.length ? Math.round(paid.reduce((s, r) => s + r.amount, 0) / paid.length) : null;
  const refusedHelped = refused.filter((r) => r.outcome === "helped").length;
  const refuseWin = refused.length ? Math.round((refusedHelped / refused.length) * 100) : null;
  const typical = paid.length ? paid.map((r) => r.amount).sort((a, b) => a - b)[Math.floor(paid.length / 2)] : null;

  return (
    <>
      <header className="page-hero">
        <h1>
          Before You
          <br />
          <em>Go</em>
        </h1>
        <p>Before you walk into an office: what that department is known to ask for, how often refusals still worked, and the rules that are on your side.</p>
      </header>
      <div className="sec" style={{ paddingTop: 0, maxWidth: 640 }}>
        <div className="field">
          <label>Department</label>
          <select className="select" value={slug} onChange={(e) => { setSlug(e.target.value); setCity(""); }}>
            <option value="">Select a department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>City (optional, narrows the estimate further)</label>
          <select className="select" value={city} onChange={(e) => setCity(e.target.value)} disabled={!slug}>
            <option value="">{slug ? "All cities" : "Pick a department to see cities"}</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.reports})
              </option>
            ))}
          </select>
        </div>

        {slug && (
          <div className="kb-result">
            <small style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--mid)" }}>
              Expected ask {city ? `in ${city}` : "nationally"}
            </small>
            <div className="kb-big">{avg != null ? formatInr(avg) : "Not enough paid reports"}</div>
            <p style={{ color: "var(--mid)", fontSize: 13 }}>
              Based on {scoped.length} report{scoped.length === 1 ? "" : "s"}. This is a self-selected sample, not an official fee.
            </p>
            <div className="kb-grid">
              <div>
                <small>Median paid</small>
                <b>{typical != null ? formatInr(typical) : "—"}</b>
              </div>
              <div>
                <small>Refusal success</small>
                <b>{refuseWin != null ? `${refuseWin}%` : "—"}</b>
              </div>
              <div>
                <small>Paid reports</small>
                <b>{paid.length}</b>
              </div>
              <div>
                <small>Refused</small>
                <b>{refused.length}</b>
              </div>
            </div>
            <div style={{ marginTop: 20, fontSize: 13, lineHeight: 1.65, color: "var(--ink-light)" }}>
              <strong style={{ color: "var(--ink)" }}>Know your rights.</strong> No official can demand cash to do their job.
              Ask for a written receipt. You can refuse, file an RTI, or report the demand to the state anti-corruption bureau
              or the Central Vigilance Commission. This page is information, not legal advice.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
