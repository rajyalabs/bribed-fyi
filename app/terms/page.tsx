import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions · bribed.fyi" };

export default function TermsPage() {
  return (
    <>
      <header className="page-hero">
        <h1>
          Terms &
          <br />
          <em>Conditions</em>
        </h1>
        <p>Last updated: 17 August 2026</p>
      </header>
      <div className="prose">
        <h2>1. What this site is</h2>
        <p>
          bribed.fyi is a free public registry where anyone in India can record, without giving their name, a bribe
          they were asked for — whether they paid it or refused. Individual reports are published, and the totals are
          rolled up by department, city and amount so patterns are visible. There is no fee to submit and we do not
          sell or share user data.
        </p>
        <h2>2. Only report what happened to you</h2>
        <p>
          When you submit, you are stating that the report describes something you personally experienced, as
          accurately as you can recall it. Made-up, inflated or second-hand reports poison the dataset for everyone.
          We may reject, remove or label any report we believe to be fabricated, spam or defamatory.
        </p>
        <h2>3. Anonymity and personal details</h2>
        <p>
          No account is needed and we do not ask who you are. Please leave out names, phone numbers, addresses, ID
          numbers and anything else that could identify a person — yours or theirs. Our software masks such details
          before publication (shown as <code>[name]</code>, <code>[phone]</code>, <code>[id]</code>), and you can see
          the masked version before you submit; but do not rely on it as your only safeguard.
        </p>
        <h2>4. No moderators — how fake reports are handled</h2>
        <p>
          bribed.fyi has no moderation team. Reports are published as soon as they are submitted; no person reads them
          first. Two things stand between a submission and the public: automated masking of personal details
          (section 3) and rate limits against spam. Beyond that, readers are the check. Every report shows Helpful and
          Fake counts that anyone can vote on. A report with 5 or more Fake votes and at least twice as many Fake as
          Helpful is automatically hidden from the public feed and downloads; it is not deleted, remains reachable by
          its link with a notice, and returns if Helpful votes catch up. Publication is therefore not a finding that the
          events described are true — each report is one anonymous person’s account, and should be read as such. If a
          report identifies you and you believe it is false or contains personal data, write to <a href="mailto:contact@bribed.fyi">contact@bribed.fyi</a> and it will be
          reviewed by a human.
        </p>
        <h2>5. Not legal advice</h2>
        <p>
          bribed.fyi is an information project. It is not a law firm, a complaints authority or part of any government.
          Where we link to official anti-corruption channels, that is for your convenience only.
        </p>
        <p>
          For exactly what data exists about reporters and readers, and how legal requests are handled, see{" "}
          <Link href="/privacy">What we know about you</Link>.
        </p>
        <h2>6. The data is public and stays public</h2>
        <p>
          Published reports form an open dataset that anyone can download and reuse under the Creative Commons
          Attribution 4.0 licence (CC BY 4.0). To keep the record honest, reports are not deleted on request once
          published, except where they contain personal information that slipped through masking or where required
          by law.
        </p>
        <h2>7. About this site</h2>
        <p>
          bribed.fyi is run independently by volunteers, with no government, party or corporate funding. Contact:{" "}
          <a href="mailto:contact@bribed.fyi">contact@bribed.fyi</a>. Legal notices to the same address.
        </p>
        <p>
          bribed.fyi is an independent civic-tech project and is not affiliated with any government body. It continues
          the work of bribes.fyi, which shut down in August 2026. 41 reports originally published on bribes.fyi (30 June
          – 26 July 2026) were recovered from the Internet Archive and are republished here under bribes.fyi’s CC BY
          4.0 licence, with their original IDs. See <Link href="/data#provenance">Data → Where the data comes from</Link>{" "}
          for exactly what was and wasn’t recovered.
        </p>
        <p>
          Credits: the raised-fist mark uses the Twemoji ✊ graphic (© Twitter, Inc. and contributors, CC BY 4.0).
          Place-name data used for masking comes from GeoNames (CC BY 4.0). Name lists used for masking are drawn from
          Wikidata (CC0) and open-source name datasets.
        </p>
        <p>
          <Link href="/report" className="back-link">
            ← Back to report form
          </Link>
        </p>
      </div>
    </>
  );
}
