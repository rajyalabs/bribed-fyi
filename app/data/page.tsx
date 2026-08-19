"use client";

import Link from "next/link";
import { csvEscape } from "@/lib/format";
import { useReports } from "@/lib/store";

export default function DataPage() {
  const { reports } = useReports();

  const download = (kind: "csv" | "json") => {
    const approved = reports.filter((r) => r.status === "approved");
    let blob: Blob;
    let name: string;
    if (kind === "json") {
      blob = new Blob([JSON.stringify(approved, null, 2)], { type: "application/json" });
      name = "bribed-fyi-reports.json";
    } else {
      const header = [
        "id",
        "reported_on",
        "department_slug",
        "department_name",
        "service_name",
        "report_type",
        "amount",
        "currency",
        "mode",
        "city",
        "state",
        "official_role",
        "outcome",
        "note",
      ];
      const rows = approved.map((r) =>
        [
          r.id,
          r.created_at.slice(0, 10),
          r.department_slug,
          r.department_name,
          r.service_name,
          r.report_type,
          r.amount,
          r.currency,
          r.mode,
          r.city,
          r.state,
          r.official_role,
          r.outcome,
          r.note,
        ]
          .map(csvEscape)
          .join(","),
      );
      blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
      name = "bribed-fyi-reports.csv";
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="page-hero">
        <h1>
          Data &
          <br />
          <em>Downloads</em>
        </h1>
        <p>The full bribed.fyi dataset, free to download, for journalism, research, and civic-tech projects.</p>
        <p style={{ fontSize: 13, color: "var(--mid)" }}>
          41 reports recovered from bribes.fyi (via the Internet Archive) + everything submitted here since 18 August 2026.
        </p>
      </header>
      <div className="prose">
        <h2 id="provenance">Where the data comes from</h2>
        <p>
          bribes.fyi, India’s original crowdsourced bribe registry, went offline in August 2026 without publishing a
          final export. bribed.fyi continues its work. Here is exactly what we have and don’t have:
        </p>
        <ul>
          <li>
            <strong>Recovered: 41 bribes.fyi reports, 30 June – 26 July 2026.</strong> Pulled from Internet Archive
            (Wayback Machine) captures of bribes.fyi’s public API taken on 25–26 July 2026. These are the original
            submissions as published there, licensed CC BY 4.0. Their bribes.fyi report IDs are preserved.
          </li>
          <li>
            <strong>Not recovered: about 32 reports, 27 July – 5 August 2026.</strong> The last archive capture (5
            August) shows bribes.fyi had 95 reports across 61 cities — but only city-level totals survived, not the
            reports themselves. Cities with reports on 5 August alone included Pune, Bengaluru, Mumbai, Delhi, Mysore,
            Rajkot, Visakhapatnam, Metpally, Bhadrajun and Connaught Place.
          </li>
          <li>
            <strong>Not recovered: anything after 5 August 2026.</strong> No public archive captured it.
          </li>
          <li>
            <strong>New reports</strong> have been accepted here since 18 August 2026, 6:57 PM IST. If you reported to
            bribes.fyi after 26 July, please <Link href="/report">file it again</Link>.
          </li>
        </ul>
        <p>
          We searched the Wayback Machine, archive.today and Common Crawl. If you hold a copy of the bribes.fyi export
          or database, please write to <a href="mailto:contact@bribed.fyi">contact@bribed.fyi</a> — it would be added with attribution.
        </p>
        <p>
          <strong>Read this before you use the data.</strong> bribed.fyi currently has {reports.length} reports. It is a
          small, self-selected sample of people who chose to report. It is not a statistically representative survey of
          corruption in India. Please don’t compute national or per-state corruption rates from it, or headline a ranking
          of “most corrupt” states/departments from sample sizes this small.
        </p>
        <h2>Download</h2>
        <p>Approved reports only, including the recovered bribes.fyi reports.</p>
        <p style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="np-btn-fill" onClick={() => download("csv")}>
            Download CSV
          </button>
          <button className="np-btn-ghost" onClick={() => download("json")}>
            Download JSON
          </button>
        </p>
        <h2>Schema</h2>
        <table className="schema">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>id</td>
              <td>string (UUID)</td>
              <td>Stable identifier, links to /reports/{"{id}"}</td>
            </tr>
            <tr>
              <td>reported_on</td>
              <td>date (YYYY-MM-DD)</td>
              <td>Day the report was submitted</td>
            </tr>
            <tr>
              <td>department_slug</td>
              <td>string</td>
              <td>e.g. police, rto</td>
            </tr>
            <tr>
              <td>report_type</td>
              <td>bribe_paid | refused</td>
              <td>Whether money changed hands</td>
            </tr>
            <tr>
              <td>amount</td>
              <td>number</td>
              <td>INR; 0 for refused reports</td>
            </tr>
            <tr>
              <td>mode</td>
              <td>string</td>
              <td>cash / upi / agent / other</td>
            </tr>
            <tr>
              <td>city / state</td>
              <td>string</td>
              <td>As entered by the reporter</td>
            </tr>
            <tr>
              <td>note</td>
              <td>string</td>
              <td>Free text, published as submitted</td>
            </tr>
          </tbody>
        </table>
        <h2>What we never publish</h2>
        <p>
          The export never includes a reporter’s IP address, anonymous session token, device fingerprint, or account ID.
          Do not put names or phone numbers in a report.
        </p>
        <h2>License</h2>
        <p>
          The bribed.fyi export is licensed under Creative Commons Attribution 4.0 (CC BY 4.0). Recovered rows are ©
          their original bribes.fyi submitters, published under bribes.fyi’s CC BY 4.0 licence. See{" "}
          <Link href="/terms">Terms</Link>.
        </p>
      </div>
    </>
  );
}
