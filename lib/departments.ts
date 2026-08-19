import type { Department } from "./types";

export const DEPARTMENTS: Department[] = [
  {
    id: "d1000000-0000-0000-0000-000000000002",
    name: "Police",
    slug: "police",
    category: "law-enforcement",
    jurisdiction: "State",
    blurb: "Law enforcement · State",
    initials: "P",
  },
  {
    id: "d1000000-0000-0000-0000-000000000001",
    name: "RTO",
    slug: "rto",
    category: "transport",
    jurisdiction: "State",
    blurb: "Transport · State",
    initials: "R",
  },
  {
    id: "d1000000-0000-0000-0000-000000000005",
    name: "Revenue / Land Records",
    slug: "revenue",
    category: "revenue",
    jurisdiction: "State",
    blurb: "Revenue · State",
    initials: "R/",
  },
  {
    id: "d1000000-0000-0000-0000-000000000006",
    name: "Passport Office",
    slug: "passport",
    category: "central",
    jurisdiction: "Central",
    blurb: "Central · Central",
    initials: "PO",
  },
  {
    id: "d1000000-0000-0000-0000-000000000003",
    name: "Municipal Corporation",
    slug: "municipal-corp",
    category: "municipal",
    jurisdiction: "Local",
    blurb: "Municipal · Local",
    initials: "MC",
  },
  {
    id: "d1000000-0000-0000-0000-000000000009",
    name: "GST Office",
    slug: "gst",
    category: "central",
    jurisdiction: "Central",
    blurb: "Central · Central",
    initials: "GO",
  },
  {
    id: "d1000000-0000-0000-0000-000000000004",
    name: "Electricity Board",
    slug: "electricity-board",
    category: "utilities",
    jurisdiction: "State",
    blurb: "Utilities · State",
    initials: "EB",
  },
  {
    id: "d1000000-0000-0000-0000-000000000007",
    name: "Income Tax",
    slug: "income-tax",
    category: "central",
    jurisdiction: "Central",
    blurb: "Central · Central",
    initials: "IT",
  },
  {
    id: "d1000000-0000-0000-0000-000000000008",
    name: "Food & Drug Administration",
    slug: "fda",
    category: "regulatory",
    jurisdiction: "State",
    blurb: "Regulatory · State",
    initials: "F&",
  },
];

export const OTHER_DEPT: Department = {
  id: "d1000000-0000-0000-0000-000000000099",
  name: "Other / Not listed",
  slug: "other",
  category: "other",
  jurisdiction: "Other",
  blurb: "specify below",
  initials: "?",
};

export const ALL_DEPARTMENTS = [...DEPARTMENTS, OTHER_DEPT];

export function deptBySlug(slug: string) {
  return ALL_DEPARTMENTS.find((d) => d.slug === slug);
}
