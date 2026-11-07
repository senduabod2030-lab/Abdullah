"use client";
import { useEffect, useState } from "react";

/** حلقة تقدم دائرية متحركة */
export default function Ring({ value, total, size = 132, label }: { value: number; total: number; size?: number; label: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(pct)); return () => cancelAnimationFrame(t); }, [pct]);
  const r = (size - 14) / 2, c = 2 * Math.PI * r;
  const full = total > 0 && pct === 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${pct}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#e6b34a" /></linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#22342c" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringg)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * shown) / 100} style={{ transition: "stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold">{full ? "✓" : `${pct}%`}</span>
        <span className="text-[11px] text-mute">{total ? `${value} من ${total}` : "لا مهام"}</span>
      </div>
    </div>
  );
}
