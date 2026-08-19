"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Report, ReportDraft } from "./types";

type Vote = "helpful" | "fake";

type Store = {
  reports: Report[];
  ready: boolean;
  /** True when the API was unreachable (read-only, empty). */
  offline: boolean;
  addReport: (draft: ReportDraft) => Promise<Report>;
  vote: (id: string, kind: Vote) => void;
  getVote: (id: string) => Vote | null;
};

const Ctx = createContext<Store | null>(null);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const inflight = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, v] = await Promise.all([
          api<{ reports: Report[] }>("/api/reports"),
          api<{ votes: Record<string, Vote> }>("/api/votes"),
        ]);
        if (cancelled) return;
        setReports(r.reports);
        setVotes(v.votes);
      } catch {
        if (cancelled) return;
        // No API reachable (e.g. plain `next dev` without the Worker) — nothing to show, read-only.
        setReports([]);
        setOffline(true);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addReport = useCallback(async (draft: ReportDraft) => {
    const { report } = await api<{ report: Report }>("/api/reports", {
      method: "POST",
      body: JSON.stringify(draft),
    });
    setReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
    return report;
  }, []);

  const vote = useCallback(
    (id: string, kind: Vote) => {
      if (offline || inflight.current.has(id)) return;
      inflight.current.add(id);

      // Optimistic update
      const previous = votes[id] ?? null;
      const next: Vote | null = previous === kind ? null : kind;
      setVotes((p) => {
        const n = { ...p };
        if (next) n[id] = next;
        else delete n[id];
        return n;
      });
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          let { helpful_count, fake_count } = r;
          if (previous === "helpful") helpful_count -= 1;
          if (previous === "fake") fake_count -= 1;
          if (next === "helpful") helpful_count += 1;
          if (next === "fake") fake_count += 1;
          return { ...r, helpful_count, fake_count };
        }),
      );

      api<{ vote: Vote | null; helpful: number; fake: number }>("/api/votes", {
        method: "POST",
        body: JSON.stringify({ id, kind }),
      })
        .then((res) => {
          setVotes((p) => {
            const n = { ...p };
            if (res.vote) n[id] = res.vote;
            else delete n[id];
            return n;
          });
          setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, helpful_count: res.helpful, fake_count: res.fake } : r)),
          );
        })
        .catch(() => {
          // Roll back
          setVotes((p) => {
            const n = { ...p };
            if (previous) n[id] = previous;
            else delete n[id];
            return n;
          });
        })
        .finally(() => inflight.current.delete(id));
    },
    [votes, offline],
  );

  const getVote = useCallback((id: string) => votes[id] ?? null, [votes]);

  const value = useMemo(
    () => ({ reports, ready, offline, addReport, vote, getVote }),
    [reports, ready, offline, addReport, vote, getVote],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReports() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}
