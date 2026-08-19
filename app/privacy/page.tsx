import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "What we know about you · bribed.fyi" };

export default function PrivacyPage() {
  return (
    <>
      <header className="page-hero">
        <h1>
          What we know
          <br />
          <em>about you</em>
        </h1>
        <p>Written so that a reporter, a reader, or an official with a court order all get the same answer.</p>
      </header>
      <div className="prose">
        <h2>When you submit a report</h2>
        <p>
          We store the report itself: department, amount, city and state, the role of the person who asked, what
          happened, whether you paid or refused, and the time it was submitted. That is the entire row. There is{" "}
          <strong>no name, no email, no account, no IP address, no device identifier and no cookie</strong> attached to
          a report — nothing in our database says who sent it.
        </p>
        <p>
          Before it is saved, the text you typed is run through automated masking that replaces anything that looks
          like a person’s name, phone number, email, Aadhaar/PAN number, vehicle plate, UPI id or link with{" "}
          <code>[name]</code>, <code>[phone]</code>, <code>[id]</code>, <code>[email]</code> or <code>[link]</code>. You
          see the masked version on the review step before you press submit. The unmasked text is never written to
          disk.
        </p>
        <h2>The one thing we keep for an hour</h2>
        <p>
          To stop one person flooding the site, we allow five reports per hour per connection. For that we store a
          one-way hash of your connection address, salted with a secret and with the current date, in a separate
          rate-limit table. Rows older than one hour are deleted on every new write. Because the hash rotates daily
          and the salt is secret, it cannot be turned back into an address, and after the day ends it cannot even be
          checked against one. It is never linked to a report.
        </p>
        <h2>When you vote Helpful or Fake</h2>
        <p>
          We set a random token in a cookie so you can’t vote twice on the same report. We store a hash of that
          token next to your votes. It contains nothing about you and is not linked to any report you may have
          submitted.
        </p>
        <h2>What we don’t do</h2>
        <ul>
          <li>No analytics, advertising or tracking scripts of any kind.</li>
          <li>No server-side request logs kept by us (Cloudflare’s Workers logging is switched off).</li>
          <li>No accounts, no email list, no third-party sign-in.</li>
        </ul>
        <h2>What sits outside our control</h2>
        <p>
          The site runs on Cloudflare (servers and database in the United States). Like any network provider,
          Cloudflare sees the address of every connection for as long as its own systems keep such records; that is
          governed by Cloudflare’s policies, not ours, and we cannot see or delete it. If that matters to you, use a
          VPN or Tor when you submit — the site works fine with either.
        </p>
        <h2>If a government or court asks us for data</h2>
        <p>
          We comply with lawful orders. What we can hand over is limited to what exists, and for a report that is the
          published row you can already see on the site. We hold no record of who submitted any report, so we cannot
          identify a reporter, and we will say so in writing to whoever asks. We will publish, on this page, a running
          count of legal requests received and what was provided. Legal notices and all other correspondence:{" "}
          <a href="mailto:contact@bribed.fyi">contact@bribed.fyi</a>.
        </p>
        <p className="canary">
          Legal requests received to date: <strong>0</strong>. Reporter identities disclosed: <strong>0</strong> (none
          exist to disclose). Last updated 18 August 2026.
        </p>
        <h2>The law on paying a bribe</h2>
        <p>
          Under India’s Prevention of Corruption Act (Section 8, as amended in 2018), giving a bribe is itself an
          offence — <strong>except</strong> when you were compelled to pay and you report it to law enforcement
          within seven days. Posting here is not that report. If you were forced to pay, please also file with your
          state Anti-Corruption Bureau, the Central Vigilance Commission (<em>cvc.gov.in</em>, portal or 1964
          helpline) or the Lokayukta; that protects you and creates a record the authorities must act on. bribed.fyi
          exists to make the pattern public; the official complaint is what triggers action.
        </p>
        <p>
          <Link href="/terms" className="back-link">
            Terms & Conditions →
          </Link>
        </p>
      </div>
    </>
  );
}
