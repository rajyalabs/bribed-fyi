import type { Outcome, PayMode, Report } from "./types";

export function formatInr(amount: number) {
  if (!amount) return "₹0";
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

export function formatInrCompact(amount: number) {
  if (!amount) return "—";
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

export function dailyWageMultiple(amount: number) {
  const wage = 346;
  if (!amount) return null;
  const n = amount / wage;
  if (n < 1.5) return null;
  return `${n.toFixed(n >= 10 ? 0 : 1).replace(/\.0$/, "")}x daily min wage`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatRelative(iso: string) {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.max(0, Math.round((now - d) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days}d ago`;
  return formatDate(iso);
}

export function outcomeLabel(outcome: Outcome) {
  if (outcome === "helped") return "Got work done";
  if (outcome === "partial") return "Partial help";
  return "No help";
}

export function modeLabel(mode: PayMode) {
  if (mode === "upi") return "UPI";
  if (mode === "agent") return "agent";
  if (mode === "other") return "other";
  return "cash";
}

export function initials(name: string) {
  const parts = name.replace("/", " ").split(/\s+/).filter(Boolean);
  if (name === "RTO") return "R";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function tickerText(r: Report) {
  if (r.report_type === "refused") {
    return `Someone refused a bribe at ${r.department_name} , ${r.city}`;
  }
  return `Someone reported paying ${formatInr(r.amount)} at ${r.department_name} , ${r.city}`;
}

export function csvEscape(value: string | number) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
