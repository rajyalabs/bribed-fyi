export type ReportType = "bribe_paid" | "refused";
export type Outcome = "helped" | "partial" | "no_help";
export type PayMode = "cash" | "upi" | "agent" | "other";

export type Department = {
  id: string;
  name: string;
  slug: string;
  category: string;
  jurisdiction: string;
  blurb: string;
  initials: string;
};

export type Report = {
  id: string;
  department_id: string;
  department_name: string;
  department_slug: string;
  service_name: string;
  amount: number;
  currency: "INR";
  mode: PayMode;
  city: string;
  state: string;
  state_code: string;
  official_role: string;
  note: string;
  outcome: Outcome;
  report_type: ReportType;
  status: "approved" | "pending";
  helpful_count: number;
  fake_count: number;
  created_at: string;
  featured?: boolean;
};

export type ReportDraft = {
  report_type: ReportType;
  department_slug: string;
  amount: number;
  mode: PayMode;
  city: string;
  state: string;
  official_role: string;
  note: string;
  outcome: Outcome;
};

export type StateStat = {
  state: string;
  code: string;
  reports: number;
  avg: number | null;
  refusedPct: number;
  paidTotal: number;
  refused: number;
};
