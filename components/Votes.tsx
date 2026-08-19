"use client";

import { useReports } from "@/lib/store";

export function Votes({ id, helpful, fake }: { id: string; helpful: number; fake: number }) {
  const { vote, getVote } = useReports();
  const current = getVote(id);
  return (
    <div className="votes">
      <button className={`vote-btn${current === "helpful" ? " on" : ""}`} onClick={() => vote(id, "helpful")}>
        Helpful ({helpful})
      </button>
      <button className={`vote-btn${current === "fake" ? " on" : ""}`} onClick={() => vote(id, "fake")}>
        Fake ({fake})
      </button>
    </div>
  );
}
