# bribed.fyi

India's crowdsourced, anonymous bribe registry — report what you paid (or refused to pay), and see the aggregate by department, city, and service.

## Origins and credit

bribed.fyi continues the work of **bribes.fyi**, the original Indian crowdsourced bribe registry, which went offline in August 2026. The concept, the information architecture and the interaction patterns here are modeled on bribes.fyi; this codebase began as an independent recreation of that interface (bribes.fyi's own source was never available to us) and has since been substantially modified and extended — Cloudflare Workers + D1 backend, server-side PII masking, community voting, privacy and provenance pages, and all site copy rewritten. The 41 bribes.fyi reports in the database were recovered from the Internet Archive and are republished under bribes.fyi's CC BY 4.0 data licence. bribed.fyi is not affiliated with bribes.fyi or its operators.

## What's included

- Homepage: live ticker, India transparency map, state ledger, card/table feed, how-it-works, FAQ
- Anonymous 3-step report form
- Report detail, departments, cities, compare, know-before-you-go
- Data export (CSV / JSON), terms
- Light / dark theme, search, helpful/fake votes

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js 15 (App Router), React 19, TypeScript, deployed to Cloudflare Workers via `@opennextjs/cloudflare`. Data lives in Cloudflare D1 (`bribed-fyi-db`). The Cloudflare account is selected via the `CLOUDFLARE_ACCOUNT_ID` environment variable (or `wrangler login` with a single account).

- `lib/store.tsx` — client store; talks to `/api/*`. Shows an empty read-only registry if the API is unreachable (plain `next dev`).
- `app/api/reports` — `GET` approved reports, `POST` new report (validated, 5/hour per hashed IP).
- `app/api/reports/[id]` — single report.
- `app/api/votes` — `GET` this visitor's votes, `POST` toggle helpful/fake. Voter identity is a hashed anonymous cookie; report submitter identity is a salted hash of the IP. Raw IPs are never stored.
- `migrations/0001_init.sql` — `reports` (with `status` pending/approved/rejected) and `votes` (unique per report+voter).

## Develop & deploy

```bash
npm run db:migrate:local      # local D1
npm run preview               # OpenNext build + wrangler dev on http://localhost:8787
CLOUDFLARE_ACCOUNT_ID=<id> npm run deploy   # OpenNext build + wrangler deploy (binds bribed.fyi + www)
npm run db:migrate            # apply new migrations to remote D1
```

Set a real salt before launch: `npx wrangler secret put HASH_SALT`.

Moderation: new reports are auto-approved today. To hide one, `wrangler d1 execute bribed-fyi-db --remote --command "UPDATE reports SET status='rejected' WHERE id='…'"`. A review queue UI is the next step if the terms' "reviewed before publication" promise is to be kept literally.

## Data provenance

bribes.fyi shut down in August 2026 without a final export. The database holds:

- **41 real bribes.fyi reports (30 Jun – 26 Jul 2026)** recovered from Wayback Machine captures of its public API (25–26 Jul 2026), republished under bribes.fyi's CC BY 4.0 licence with original IDs.
- **Not recovered:** ~32 reports from 27 Jul – 5 Aug 2026 (only a 5 Aug city-level aggregate survives: 95 reports / 61 cities), and anything after 5 Aug.
- Everything submitted to bribed.fyi since 18 Aug 2026.

The homepage notice, `/data#provenance` and Terms §7 state this. There is no synthetic seed data.

Logo: India outline from `public/india.svg`; fist is Twemoji U+270A (CC BY 4.0, © Twitter, Inc. and contributors).
