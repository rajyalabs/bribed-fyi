"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IndiaMap } from "@/components/IndiaMap";
import { Votes } from "@/components/Votes";
import { formatDate, formatInr, formatRelative, initials, modeLabel, outcomeLabel, tickerText } from "@/lib/format";
import { computeDeptStats, computeStateStats, nationalStats } from "@/lib/stats";
import { useReports } from "@/lib/store";
import type { Report } from "@/lib/types";

const FAQS = [
  {
    q: "Can anyone find out I reported?",
    a: "Yes. No account, no name, no email. Your report is stored in our database without any identifier that points back to you — for spam control we keep only a salted hash of your connection, and that is never published. Names, phone numbers and IDs typed into a report are masked automatically before it goes live.",
  },
  {
    q: "Can I report a bribe I refused to pay?",
    a: "Yes. Refusals are as important as paid bribes — they show where people stood their ground, and whether the service still went through.",
  },
  {
    q: "What if a report is false?",
    a: "There are no moderators — bribed.fyi is run by volunteers and no one reads reports before they go live. Instead, every reader can mark a report Helpful or Fake, and the counts are shown on each report. A report that collects 5 or more Fake flags, and at least twice as many Fake as Helpful, is automatically hidden from the public feed (it stays on record and reappears if Helpful votes catch up). Judge each report the way you would any anonymous first-hand account.",
  },
];

export function HomePage() {
  const { reports, ready } = useReports();
  const [loaderOut, setLoaderOut] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [sort, setSort] = useState<"new" | "amount" | "votes">("new");
  const [kind, setKind] = useState<"all" | "paid" | "refused">("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [ledgerSort, setLedgerSort] = useState<"reports" | "bribes" | "refusals">("reports");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const a = setTimeout(() => setLoaderOut(true), 900);
    const b = setTimeout(() => setLoaderGone(true), 1400);
    const c = setTimeout(() => setRevealed(true), 500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, []);

  const stats = useMemo(() => nationalStats(reports), [reports]);
  const depts = useMemo(() => computeDeptStats(reports), [reports]);
  const states = useMemo(() => computeStateStats(reports), [reports]);
  const maxDept = Math.max(1, ...depts.map((d) => d.reports));

  const ledger = useMemo(() => {
    const rows = [...states];
    if (ledgerSort === "bribes") rows.sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
    else if (ledgerSort === "refusals") rows.sort((a, b) => b.refusedPct - a.refusedPct);
    else rows.sort((a, b) => b.reports - a.reports);
    return rows;
  }, [states, ledgerSort]);

  const filtered = useMemo(() => {
    let list = reports;
    if (selectedState) list = list.filter((r) => r.state === selectedState);
    if (kind === "paid") list = list.filter((r) => r.report_type === "bribe_paid");
    if (kind === "refused") list = list.filter((r) => r.report_type === "refused");
    list = [...list];
    if (sort === "amount") list.sort((a, b) => b.amount - a.amount);
    else if (sort === "votes") list.sort((a, b) => b.helpful_count - a.helpful_count);
    else list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return list;
  }, [reports, selectedState, kind, sort]);

  const featured = reports.find((r) => r.featured) ?? filtered[0];
  const cards = filtered.filter((r) => r.id !== featured?.id);
  const quotes = reports.filter((r) => r.note && r.note.length > 40).slice(0, 3);
  const latest = stats.latest;

  return (
    <>
      {!loaderGone && (
        <div className={`home-loader${loaderOut ? " out" : ""}`} role="status" aria-label="Loading bribed.fyi">
          <div>
            <div className="home-loader-word">
              bribed<em>.fyi</em>
            </div>
            <div className="home-loader-bar" aria-hidden>
              <span />
            </div>
          </div>
        </div>
      )}

      <section className="np-hero">
        <div className="np-kicker">
          <div className="np-live-dot" />
          Live · {ready ? stats.total : "…"} reports across India
        </div>
        <h1 className="np-h1">
          Which <Redact on={revealed}>office</Redact>.
          <br />
          How <Redact on={revealed}>much</Redact>.
          <br />
          What <Redact on={revealed}>happened</Redact>.
        </h1>
        <p className="np-sub">An open, anonymous record of the bribes India is asked to pay — reported by the people who were asked.</p>
        <div className="np-btns">
          <Link className="np-btn-fill" href="/report">
            Report a bribe →
          </Link>
          <a href="#live-feed" className="np-btn-ghost">
            See the reports
          </a>
        </div>
        <div className="hero-panel">
          <div className="h-col">
            <div className="h-col-label">Latest bribe</div>
            <div className="h-amount">
              {latest && latest.report_type === "bribe_paid" ? (
                <>
                  ₹<span className="h-amount-hi">{Math.round(latest.amount).toLocaleString("en-IN")}</span>
                </>
              ) : (
                <span className="h-amount-hi">Refused</span>
              )}
            </div>
            <div className="h-dept">
              {latest ? `${latest.department_name} · ${latest.city}` : "—"}
            </div>
            <div className="h-date">{latest ? formatDate(latest.created_at) : "—"}</div>
            <p className="h-quote">
              “{latest?.note ? trim(latest.note, 140) : "Every report here is anonymous, and stays public for good."}”
            </p>
          </div>
          <div className="h-rule" />
          <div className="h-col">
            <div className="h-col-label">Total reports filed</div>
            <div className="h-big-num">{stats.total}</div>
            <div className="h-big-label">across India</div>
            <div className="h-mini-stats">
              <div>
                <div className="h-mini-stat-num">{stats.cities}</div>
                <div className="h-mini-stat-label">cities covered</div>
              </div>
              <div>
                <div className="h-mini-stat-num">{stats.refusedHelpedPct}%</div>
                <div className="h-mini-stat-label">refused, still served</div>
              </div>
            </div>
          </div>
          <div className="h-rule" />
          <div className="h-col">
            <div className="h-col-label">Top departments</div>
            <div className="bar-row">
              {depts.slice(0, 5).map((d) => (
                <div className="bar-item" key={d.slug}>
                  <div className="bar-name">{d.name.split(" ")[0]}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(d.reports / maxDept) * 100}%` }} />
                  </div>
                  <div className="bar-pct">{d.reports}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="cta-card">
          <div>
            <h3 className="cta-title">Got an office visit coming up?</h3>
            <p className="cta-text">See what that department usually asks for, how often people refuse and still get served, and what the rules say.</p>
          </div>
          <Link className="cta-btn" href="/know-before-you-go">
            Prepare for the visit →
          </Link>
        </div>
      </div>

      <section className="sec" style={{ paddingBottom: 0, borderTop: "none" }}>
        <div className="sec-head" style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 24, marginBottom: 0 }}>
          <div>
            <h2 className="sec-h2">
              Live <em>reports.</em>
            </h2>
          </div>
          <p className="sec-desc">Narrow by state, order by amount, or flip to a table. Nothing here carries a name, and nothing gets taken down.</p>
        </div>
      </section>

      <div className="live-ticker-bar">
        <span className="live-dot" />
        <div className="ticker-track">
          {[...reports, ...reports].slice(0, 20).map((r, i) => (
            <Link key={`${r.id}-${i}`} href={`/reports/${r.id}`}>
              {tickerText(r)} · {formatRelative(r.created_at)}
            </Link>
          ))}
        </div>
      </div>

      <section className="sec">
        <div className="sec-head">
          <h2 className="sec-h2">
            TRANSPARENCY <em>MAP</em>
          </h2>
          <p className="sec-desc">Where the demands are being made. Pick a state on the map or in the ledger to narrow the feed below.</p>
        </div>
        <div className="map-dashboard-grid">
          <IndiaMap stats={states} selected={selectedState} onSelect={setSelectedState} />
          <div>
            <h3 className="ledger-head">By State</h3>
            <div className="ledger-sub">Live totals</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="ledger-sub" style={{ margin: 0 }}>
                Sort:
              </span>
              {(
                [
                  ["reports", "Most reports"],
                  ["bribes", "Highest bribes"],
                  ["refusals", "Most refusals"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  className={`filter-pill${ledgerSort === k ? " active" : ""}`}
                  onClick={() => setLedgerSort(k)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              {ledger.map((s, i) => (
                <button
                  key={s.state}
                  className={`ledger-row${selectedState === s.state ? " active" : ""}`}
                  onClick={() => setSelectedState(selectedState === s.state ? null : s.state)}
                >
                  <div className="ledger-name">
                    <span className="ledger-idx">{String(i + 1).padStart(2, "0")}.</span>
                    {s.state}
                  </div>
                  <div className="ledger-meta">
                    <span>{s.reports} REPORTS</span>
                    <span>
                      AVG <b>{s.avg != null ? formatInr(s.avg) : "—"}</b>
                    </span>
                    <span>
                      REFUSED <b>{s.refusedPct}%</b>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="filter-bar" id="live-feed">
        <div className="filter-pills-group">
          {(
            [
              ["new", "Newest"],
              ["amount", "Highest amount"],
              ["votes", "Most votes"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} className={`filter-pill${sort === k ? " active" : ""}`} onClick={() => setSort(k)}>
              {label}
            </button>
          ))}
          <span className="filter-sep" />
          {(
            [
              ["all", "All"],
              ["paid", "Paid"],
              ["refused", "Refused"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} className={`filter-pill${kind === k ? " active" : ""}`} onClick={() => setKind(k)}>
              {label}
            </button>
          ))}
          {selectedState && (
            <button className="filter-pill active" onClick={() => setSelectedState(null)}>
              {selectedState} ×
            </button>
          )}
        </div>
        <div className="view-toggle">
          <button className={`view-toggle-btn${view === "cards" ? " active" : ""}`} onClick={() => setView("cards")}>
            Cards
          </button>
          <button className={`view-toggle-btn${view === "table" ? " active" : ""}`} onClick={() => setView("table")}>
            Table
          </button>
        </div>
      </div>
      <div className="feed-count">
        {filtered.length} reports{selectedState ? ` in ${selectedState}` : ""}
      </div>

      {featured && view === "cards" && <Spotlight r={featured} />}

      {view === "cards" ? (
        <div className="feed-grid">
          {cards.map((r) => (
            <ReportCell key={r.id} r={r} />
          ))}
          <div className="feed-cell" style={{ cursor: "default" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>Been through the same thing?</h3>
            <p style={{ fontSize: 13, color: "var(--mid)", marginBottom: 16 }}>
              One more entry makes the pattern harder to deny. It takes about a minute, and no one will know it was you.
            </p>
            <Link className="np-btn-fill" href="/report">
              Add your report →
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Dept</th>
                <th>Place</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => (window.location.href = `/reports/${r.id}`)}>
                  <td>{formatDate(r.created_at)}</td>
                  <td>{r.department_name}</td>
                  <td>
                    {r.city}, {r.state}
                  </td>
                  <td>{r.report_type === "refused" ? "Refused" : formatInr(r.amount)}</td>
                  <td>{trim(r.note, 80)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="sec how-it-works-sec" style={{ paddingBottom: 0 }}>
        <div className="sec-head">
          <h2 className="sec-h2">
            How it works. <em>Three steps.</em>
          </h2>
          <p className="sec-desc">
            We ask for three things: the office, the amount, and what was said. We never ask who you are.
          </p>
        </div>
      </section>
      <div className="steps">
        <div className="step">
          <div className="step-n">01</div>
          <h3>Anonymous</h3>
          <p>Pick the department, type the amount, tell the story. There is no sign-up, and we don’t store who sent it.</p>
        </div>
        <div className="step">
          <div className="step-n">02</div>
          <h3>Masked, not moderated</h3>
          <p>Names, numbers and IDs are masked automatically before publishing. No one reads reports first — readers mark them Helpful or Fake, and heavily flagged ones drop out of the feed.</p>
        </div>
        <div className="step">
          <div className="step-n">03</div>
          <h3>Public</h3>
          <p>Approved reports join a permanent open dataset you can browse by state, department, amount or date — and download.</p>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat-block">
          <div className="stat-n">01</div>
          <div className="stat-big">{stats.total}</div>
          <div className="stat-label">Reports filed</div>
          <p className="stat-copy">First-hand accounts from across India. Police, RTO and land-records offices come up most often.</p>
        </div>
        <div className="stat-block">
          <div className="stat-n">02</div>
          <div className="stat-big">{stats.refusedHelpedPct}%</div>
          <div className="stat-label">Refusal success</div>
          <p className="stat-copy">Share of people who said no to the demand and still got the service they came for.</p>
        </div>
        <div className="stat-block">
          <div className="stat-n">03</div>
          <div className="stat-big">{stats.cities}</div>
          <div className="stat-label">Cities covered</div>
          <p className="stat-copy">Big cities and small towns alike. Every place with a report shows up on the map and in the ledger.</p>
        </div>
      </div>

      <section className="sec">
        <div className="sec-head">
          <h2 className="sec-h2">
            In their <em>own words.</em>
          </h2>
          <p className="sec-desc">Straight from the reports, with any names or numbers masked.</p>
        </div>
        <div className="quotes-grid">
          {quotes.map((r) => (
            <Link key={r.id} href={`/reports/${r.id}`} className="quote-card">
              <div className="t-quote-mark">“</div>
              <p>{trim(r.note, 180)}</p>
              <small>
                {r.department_name} · {r.city}
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 24 }}>
        <h2 className="sec-h2" style={{ marginBottom: 8 }}>
          Questions.
        </h2>
        {FAQS.map((f, i) => (
          <div key={f.q} className={`faq-item${openFaq === i ? " open" : ""}`}>
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {f.q}
              <svg className="faq-chevron" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {openFaq === i && <div className="faq-a">{f.a}</div>}
          </div>
        ))}
      </section>

      <section className="close-cta">
        <h2>
          Silence is what
          <br />
          keeps the rate up.
        </h2>
        <p>A minute of your time. No name attached. It adds up.</p>
        <Link className="np-btn-fill" href="/report">
          Report a bribe →
        </Link>
      </section>

      <aside className="data-strip" aria-label="About the data">
        <strong>Where this data comes from.</strong> bribes.fyi shut down. We recovered 41 of its reports (30 June – 26
        July 2026) from the Internet Archive; roughly 32 more from 27 July – 5 August, and anything after, could not be.
        New reports resumed here on 18 August 2026, 6:57 PM IST — if yours was lost, please{" "}
        <Link href="/report">file it again</Link>. <Link href="/data">Full details on the Data page →</Link>
      </aside>

    </>
  );
}

function Redact({ children, on }: { children: React.ReactNode; on: boolean }) {
  return <span className={`np-redact${on ? " np-revealed" : ""}`}>{children}</span>;
}

function trim(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function Spotlight({ r }: { r: Report }) {
  return (
    <div className="spotlight">
      <div className="spotlight-kicker">★ Bribe of the Week · {formatRelative(r.created_at)}</div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{r.department_name}</div>
      <div className="spotlight-quote">“{r.note}”</div>
      <div className="spotlight-meta">
        {r.report_type === "refused" ? "Refused" : formatInr(r.amount)} · Paid in {r.city}, {r.state}
        {r.official_role ? ` to ${r.official_role}` : ""}
      </div>
      <Votes id={r.id} helpful={r.helpful_count} fake={r.fake_count} />
      <div style={{ marginTop: 14 }}>
        <Link href={`/reports/${r.id}`} style={{ fontSize: 13, fontWeight: 500 }}>
          Read the report →
        </Link>
      </div>
    </div>
  );
}

function ReportCell({ r }: { r: Report }) {
  return (
    <article className="feed-cell">
      <Link href={`/reports/${r.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="feed-top">
          <div className="feed-dept">
            <div className="feed-avatar">{initials(r.department_name)}</div>
            <div>
              <div className="feed-dept-name">{r.department_name}</div>
              <div className="feed-city">
                {r.city}, {r.state}
              </div>
            </div>
          </div>
          <div className={`feed-amt${r.report_type === "refused" ? " refused" : ""}`}>
            {r.report_type === "refused" ? "Refused" : formatInr(r.amount)}
          </div>
        </div>
        {r.note && <p className="feed-note">“{trim(r.note, 160)}”</p>}
        <div className="feed-meta">
          <span>{formatDate(r.created_at)}</span>
          <span>· paid via {modeLabel(r.mode)}</span>
          <span>{outcomeLabel(r.outcome)}</span>
        </div>
      </Link>
      <Votes id={r.id} helpful={r.helpful_count} fake={r.fake_count} />
    </article>
  );
}
