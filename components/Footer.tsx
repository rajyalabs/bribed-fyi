"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="foot-logo" href="/">
          <img className="brand-mark" src="/logo.svg" alt="" width={20} height={23} />
          bribed<em>.fyi</em>
        </Link>
        <div className="foot-tagline">Began in August 2026, when bribes.fyi went offline. Here to stay.</div>
        <div className="foot-tagline">
          Run independently by volunteers · <a href="mailto:contact@bribed.fyi">contact@bribed.fyi</a>
        </div>
      </div>
      <nav className="foot-links" aria-label="Footer navigation">
        <Link href="/">Reports</Link>
        <Link href="/dept">Departments</Link>
        <Link href="/cities">Cities</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/data">Data</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <div className="foot-icons">
        <Link aria-label="Data & downloads" href="/data">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
