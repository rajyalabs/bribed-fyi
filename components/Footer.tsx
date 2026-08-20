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
        <a href="https://github.com/rajyalabs/bribed-fyi" target="_blank" rel="noreferrer">Source</a>
      </nav>
      <div className="foot-icons">
        <a href="https://github.com/rajyalabs/bribed-fyi" aria-label="Source code on GitHub" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
          </svg>
        </a>
        <Link aria-label="Data & downloads" href="/data">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
