import type { Report, StateStat } from "./types";
import { DEPARTMENTS } from "./departments";
import { INDIAN_STATES, STATE_BY_NAME } from "./states";

export function computeStateStats(reports: Report[]): StateStat[] {
  const by = new Map<string, Report[]>();
  for (const r of reports) {
    const list = by.get(r.state) ?? [];
    list.push(r);
    by.set(r.state, list);
  }
  const rows: StateStat[] = [];
  for (const [state, list] of by) {
    const paid = list.filter((r) => r.report_type === "bribe_paid");
    const refused = list.filter((r) => r.report_type === "refused");
    const avg = paid.length
      ? Math.round(paid.reduce((s, r) => s + r.amount, 0) / paid.length)
      : null;
    rows.push({
      state,
      code: list[0]?.state_code || STATE_BY_NAME[state]?.code || "",
      reports: list.length,
      avg,
      refusedPct: list.length ? Math.round((refused.length / list.length) * 100) : 0,
      paidTotal: paid.length,
      refused: refused.length,
    });
  }
  return rows;
}

export function computeDeptStats(reports: Report[]) {
  return DEPARTMENTS.map((d) => {
    const list = reports.filter((r) => r.department_slug === d.slug);
    const paid = list.filter((r) => r.report_type === "bribe_paid");
    const refused = list.filter((r) => r.report_type === "refused");
    const avg = paid.length
      ? Math.round(paid.reduce((s, r) => s + r.amount, 0) / paid.length)
      : null;
    const helped = list.filter((r) => r.outcome === "helped").length;
    return {
      ...d,
      reports: list.length,
      avg,
      refusedPct: list.length ? Math.round((refused.length / list.length) * 100) : 0,
      helpedPct: list.length ? Math.round((helped / list.length) * 100) : 0,
    };
  }).sort((a, b) => b.reports - a.reports);
}

export function computeCityStats(reports: Report[]) {
  const by = new Map<string, Report[]>();
  for (const r of reports) {
    const key = `${r.city}||${r.state}`;
    const list = by.get(key) ?? [];
    list.push(r);
    by.set(key, list);
  }
  return [...by.entries()]
    .map(([key, list]) => {
      const [city, state] = key.split("||");
      const paid = list.filter((r) => r.report_type === "bribe_paid");
      const avg = paid.length
        ? Math.round(paid.reduce((s, r) => s + r.amount, 0) / paid.length)
        : 0;
      return { city, state, reports: list.length, avg, paid: paid.length };
    })
    .sort((a, b) => b.avg - a.avg || b.reports - a.reports);
}

export function nationalStats(reports: Report[]) {
  const paid = reports.filter((r) => r.report_type === "bribe_paid");
  const refused = reports.filter((r) => r.report_type === "refused");
  const cities = new Set(reports.map((r) => `${r.city}|${r.state}`));
  const refusedHelped = refused.filter((r) => r.outcome === "helped").length;
  const avg = paid.length
    ? Math.round(paid.reduce((s, r) => s + r.amount, 0) / paid.length)
    : 0;
  const latest = [...reports].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  return {
    total: reports.length,
    cities: cities.size,
    avg,
    refusedPct: reports.length ? Math.round((refused.length / reports.length) * 100) : 0,
    refusedHelpedPct: refused.length ? Math.round((refusedHelped / refused.length) * 100) : 0,
    latest,
    paid: paid.length,
    refused: refused.length,
  };
}

export function allStateCodes() {
  return INDIAN_STATES.map((s) => s.code);
}
