"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useReports } from "@/lib/store";
import { formatInr } from "@/lib/format";

const LINKS = [
  { href: "/", label: "Reports" },
  { href: "/dept", label: "Departments" },
  { href: "/cities", label: "Cities" },
  { href: "/compare", label: "Compare" },
  { href: "/know-before-you-go", label: "Know before you go" },
];

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { reports } = useReports();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return reports
      .filter((r) =>
        [r.department_name, r.city, r.state, r.official_role, r.note]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  }, [q, reports]);

  return (
    <nav className="news-nav" aria-label="Main navigation">
      <Link className="news-nav-logo" href="/">
        <img className="brand-mark" src="/logo.svg" alt="" width={24} height={27} />
        bribed<em>.fyi</em>
      </Link>
      <div className="news-nav-center">
        <ul
          className={`news-nav-links${searchOpen ? " hidden" : ""}`}
          style={{ transition: "opacity 0.22s ease, transform 0.25s ease" }}
        >
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={path === l.href ? "active" : ""}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <form
          className={`nav-search-form${searchOpen ? " open" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (hits[0]) {
              router.push(`/reports/${hits[0].id}`);
              setSearchOpen(false);
              setQ("");
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            autoFocus={searchOpen}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by department, city or role…"
            autoComplete="off"
          />
          {searchOpen && hits.length > 0 && (
            <div className="search-results">
              {hits.map((r) => (
                <Link
                  key={r.id}
                  className="search-hit"
                  href={`/reports/${r.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setQ("");
                  }}
                >
                  {r.report_type === "refused" ? "Refused" : formatInr(r.amount)} · {r.department_name}
                  <small>
                    {r.city}, {r.state}
                    {r.official_role ? ` · ${r.official_role}` : ""}
                  </small>
                </Link>
              ))}
            </div>
          )}
        </form>
      </div>
      <div className="news-nav-right">
        <button
          className="theme-toggle-btn"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </button>
        <button
          className="nav-search-toggle"
          aria-label="Search"
          title="Search (/)"
          onClick={() => setSearchOpen((v) => !v)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <Link className="news-nav-cta" href="/report">
          Report a bribe →
        </Link>
      </div>
    </nav>
  );
}
