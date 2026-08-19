"use client";

import { useEffect, useMemo, useState } from "react";
import type { StateStat } from "@/lib/types";
import { INDIAN_STATES } from "@/lib/states";
import { formatInr } from "@/lib/format";

/** Grey ramp: no reports → very light; most reports → near-ink. Inverted in dark mode. */
function shade(count: number, max: number, dark: boolean) {
  if (!count || max <= 0) return dark ? "#1c1c1c" : "#e6e4de";
  const t = Math.pow(count / max, 0.55);
  if (dark) {
    const v = Math.round(60 + t * 190);
    return `rgb(${v},${v},${v})`;
  }
  const v = Math.round(200 - t * 180);
  return `rgb(${v},${v},${v})`;
}

type Tip = { state: string; x: number; y: number };

export function IndiaMap({
  stats,
  selected,
  onSelect,
}: {
  stats: StateStat[];
  selected: string | null;
  onSelect: (state: string | null) => void;
}) {
  const [svg, setSvg] = useState("");
  const [dark, setDark] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    fetch("/india.svg")
      .then((r) => r.text())
      .then(setSvg);
  }, []);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.getAttribute("data-theme") === "dark");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const byName = useMemo(() => new Map(stats.map((s) => [s.state, s])), [stats]);
  const byCode = useMemo(() => new Map(stats.map((s) => [s.code, s])), [stats]);
  const max = Math.max(1, ...stats.map((s) => s.reports));

  // Inject fill + data attributes per state. Fill goes in a style attribute so it wins over the stylesheet.
  const colored = useMemo(() => {
    if (!svg) return "";
    let out = svg;
    for (const st of INDIAN_STATES) {
      const row = byCode.get(st.code);
      const fill = shade(row?.reports ?? 0, max, dark);
      const isSel = selected === st.name;
      const re = new RegExp(`<path id="${st.code}" `);
      out = out.replace(
        re,
        `<path id="${st.code}" data-state="${st.name}" class="${isSel ? "active" : ""}${row?.reports ? " has-data" : ""}" style="fill:${fill}" `,
      );
    }
    return out;
  }, [svg, byCode, max, dark, selected]);

  const stateAt = (e: React.MouseEvent) => (e.target as SVGElement).getAttribute?.("data-state") ?? null;
  const tipRow = tip ? byName.get(tip.state) : null;

  return (
    <div className="india-map-wrap">
      <div
        className="india-map-container"
        role="img"
        aria-label="Map of India by state"
        onClick={(e) => {
          const state = stateAt(e);
          if (state) onSelect(selected === state ? null : state);
        }}
        onMouseMove={(e) => {
          const state = stateAt(e);
          if (!state) return setTip(null);
          const box = e.currentTarget.getBoundingClientRect();
          setTip({ state, x: e.clientX - box.left, y: e.clientY - box.top });
        }}
        onMouseLeave={() => setTip(null)}
        dangerouslySetInnerHTML={{ __html: colored }}
      />
      {tip && (
        <div className="map-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
          <div className="map-tip-state">{tip.state}</div>
          {tipRow && tipRow.reports > 0 ? (
            <>
              <div>
                {tipRow.reports} report{tipRow.reports === 1 ? "" : "s"}
                {tipRow.avg != null ? ` · avg ${formatInr(tipRow.avg)}` : ""}
              </div>
              <div className="map-tip-sub">
                {tipRow.refused} refused · click to {selected === tip.state ? "clear" : "filter"}
              </div>
            </>
          ) : (
            <div className="map-tip-sub">No reports yet</div>
          )}
        </div>
      )}
      <div className="map-legend">
        fewer
        <div className="map-swatch" />
        more reports
        {selected && (
          <button className="map-clear" onClick={() => onSelect(null)}>
            Showing {selected} ×
          </button>
        )}
      </div>
    </div>
  );
}
