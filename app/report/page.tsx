"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ALL_DEPARTMENTS } from "@/lib/departments";
import { INDIAN_STATES } from "@/lib/states";
import { useReports } from "@/lib/store";
import { formatInr } from "@/lib/format";
import type { Outcome, PayMode, ReportDraft } from "@/lib/types";

const empty: ReportDraft = {
  report_type: "bribe_paid",
  department_slug: "",
  amount: 0,
  mode: "cash",
  city: "",
  state: "",
  official_role: "",
  note: "",
  outcome: "helped",
};

export default function ReportPage() {
  const { addReport } = useReports();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ReportDraft>(empty);
  const [otherName, setOtherName] = useState("");

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(draft.department_slug);
    if (step === 2) {
      const amtOk = draft.report_type === "refused" || draft.amount > 0;
      return amtOk && draft.city.trim() && draft.state && draft.note.trim().length >= 10;
    }
    return true;
  }, [step, draft]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ note: string; official_role: string; changed: boolean } | null>(null);

  // On the review step, ask the server how the free-text fields will look after masking.
  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    setPreview(null);
    fetch("/api/redact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: draft.note, official_role: draft.official_role }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ note: string; official_role: string; changed: boolean }>) : null))
      .then((d) => {
        if (!cancelled && d) setPreview(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [step, draft.note, draft.official_role]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const report = await addReport({
        ...draft,
        department_slug: draft.department_slug === "other" && otherName ? "other" : draft.department_slug,
      });
      router.push(`/reports/${report.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-kicker">· Anonymous · Adds to public data</div>
      <h1>Report a Bribe</h1>
      <p style={{ color: "var(--mid)", fontSize: 14, marginBottom: 8 }}>
        Nothing that identifies you is stored with a report — no name, account, IP or cookie.{" "}
        <Link href="/privacy">What we know about you →</Link>
      </p>
      <p className="law-note">
        <strong>Know the law:</strong> paying a bribe is an offence under the Prevention of Corruption Act, but{" "}
        <em>not</em> if you were compelled to pay and report it to law enforcement within 7 days. Posting here is not
        that report — if you were forced to pay, also complain to your state ACB, the CVC (cvc.gov.in) or Lokayukta.
      </p>
      <div className="stepper">
        <span className={step === 1 ? "on" : ""}>1 Report type</span>
        <span className={step === 2 ? "on" : ""}>2 Details</span>
        <span className={step === 3 ? "on" : ""}>3 Review & submit</span>
      </div>

      {step === 1 && (
        <>
          <div className="field">
            <label>What happened?</label>
            <div className="choice-grid">
              <button
                className={`choice${draft.report_type === "bribe_paid" ? " on" : ""}`}
                onClick={() => setDraft({ ...draft, report_type: "bribe_paid" })}
              >
                I paid a bribe
                <small>How much, and what happened</small>
              </button>
              <button
                className={`choice${draft.report_type === "refused" ? " on" : ""}`}
                onClick={() => setDraft({ ...draft, report_type: "refused", amount: 0 })}
              >
                I refused to pay
                <small>Saying no counts as well</small>
              </button>
            </div>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "24px 0 4px" }}>Which department?</h2>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 14 }}>
            Select the department where you {draft.report_type === "refused" ? "were asked to pay" : "paid"}.
          </p>
          <div className="choice-grid">
            {ALL_DEPARTMENTS.map((d) => (
              <button
                key={d.slug}
                className={`dept-pick${draft.department_slug === d.slug ? " on" : ""}`}
                onClick={() => setDraft({ ...draft, department_slug: d.slug })}
              >
                <div className="feed-avatar">{d.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <small style={{ color: "inherit", opacity: 0.7 }}>{d.blurb}</small>
                </div>
              </button>
            ))}
          </div>
          {draft.department_slug === "other" && (
            <div className="field" style={{ marginTop: 14 }}>
              <label>Specify the department</label>
              <input value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="e.g. Excise, Forest, Court" />
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <>
          {draft.report_type === "bribe_paid" && (
            <div className="field">
              <label>Amount paid (₹)</label>
              <input
                type="number"
                min={1}
                value={draft.amount || ""}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                placeholder="2000"
              />
            </div>
          )}
          <div className="choice-grid">
            <div className="field">
              <label>City / locality</label>
              <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Bengaluru" />
            </div>
            <div className="field">
              <label>State</label>
              <select value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="choice-grid">
            <div className="field">
              <label>Officer role (optional)</label>
              <input
                value={draft.official_role}
                onChange={(e) => setDraft({ ...draft, official_role: e.target.value })}
                placeholder="Constable, Clerk, Inspector…"
              />
            </div>
            <div className="field">
              <label>How was it paid?</label>
              <select value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value as PayMode })}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="agent">Through an agent</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Did you get the service?</label>
            <div className="choice-grid">
              {(
                [
                  ["helped", "Got work done"],
                  ["partial", "Partial help"],
                  ["no_help", "No help"],
                ] as [Outcome, string][]
              ).map(([k, label]) => (
                <button key={k} className={`choice${draft.outcome === k ? " on" : ""}`} onClick={() => setDraft({ ...draft, outcome: k })}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>What happened?</label>
            <textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="Describe the demand, where you were, and what happened after. Do not include names or phone numbers."
            />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p style={{ fontSize: 13, color: "var(--mid)", marginBottom: 16 }}>
            Check this once. After submit it is public and anonymous.
          </p>
          <dl className="review-dl">
            <dt>Type</dt>
            <dd>{draft.report_type === "refused" ? "Refused to pay" : "Paid a bribe"}</dd>
            <dt>Department</dt>
            <dd>{ALL_DEPARTMENTS.find((d) => d.slug === draft.department_slug)?.name}</dd>
            <dt>Amount</dt>
            <dd>{draft.report_type === "refused" ? "—" : formatInr(draft.amount)}</dd>
            <dt>Place</dt>
            <dd>
              {draft.city}, {draft.state}
            </dd>
            <dt>Role</dt>
            <dd>{(preview?.official_role ?? draft.official_role) || "—"}</dd>
            <dt>Mode</dt>
            <dd>{draft.mode}</dd>
            <dt>Outcome</dt>
            <dd>{draft.outcome}</dd>
            <dt>Note</dt>
            <dd>{preview?.note ?? draft.note}</dd>
          </dl>
          {preview?.changed && (
            <p className="mask-note" role="status">
              We masked what looked like names, phone numbers or IDs — shown as <code>[name]</code>, <code>[phone]</code>,{" "}
              <code>[id]</code>. This is what will be published.
            </p>
          )}
        </>
      )}

      <div className="form-nav">
        {step > 1 ? (
          <button className="np-btn-ghost" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        ) : (
          <Link href="/" className="np-btn-ghost">
            Cancel
          </Link>
        )}
        {step < 3 ? (
          <button className="np-btn-fill" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next →
          </button>
        ) : (
          <button className="np-btn-fill" onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit report →"}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" style={{ color: "var(--red, #c0392b)", fontSize: 14, marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}

