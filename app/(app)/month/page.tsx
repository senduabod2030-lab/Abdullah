"use client";
import { useState } from "react";
import DayPanel from "@/components/DayPanel";
import { Bar, pct } from "@/components/ui";
import { useView } from "@/components/View";
import { useData } from "@/lib/useData";
import { rangeStats, sumStats } from "@/lib/recurrence";
import { DAY_NAMES, MONTH_NAMES, addDays, daysInMonth, fmt, parse, todayStr } from "@/lib/dates";

export default function MonthPage() {
  const { target } = useView();
  const today = todayStr();
  const t = parse(today);
  const [y, setY] = useState(t.getFullYear());
  const [m, setM] = useState(t.getMonth());
  const [sel, setSel] = useState(today);
  const first = fmt(new Date(y, m, 1)), last = fmt(new Date(y, m, daysInMonth(y, m)));
  const data = useData(target.id, first, last);
  const stats = rangeStats(data.tasks, first, last, data.cache);
  const sum = sumStats(stats);
  const lead = parse(first).getDay();
  const selDate = sel >= first && sel <= last ? sel : first;

  function go(n: number) {
    const d = new Date(y, m + n, 1);
    setY(d.getFullYear()); setM(d.getMonth()); setSel(fmt(d));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{MONTH_NAMES[m]} {y}</h1>
        <div className="mr-auto flex gap-2">
          <button className="btn" onClick={() => go(-1)} aria-label="الشهر السابق">→</button>
          <button className="btn" onClick={() => { setY(t.getFullYear()); setM(t.getMonth()); setSel(today); }}>هذا الشهر</button>
          <button className="btn" onClick={() => go(1)} aria-label="الشهر التالي">←</button>
        </div>
      </div>
      <div className="card">
        <div className="mb-2 flex justify-between text-sm font-semibold"><span>إنجاز الشهر</span><span>{sum.done} / {sum.total} ({pct(sum.done, sum.total)}%)</span></div>
        <Bar value={sum.done} total={sum.total} label="إنجاز الشهر" />
      </div>
      <div className="card">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-mute">
          {DAY_NAMES.map((n) => <div key={n} className="py-1">{n.replace("ال", "")}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
          {stats.map((s) => {
            const p = pct(s.done, s.total);
            const full = s.total > 0 && p === 100;
            return (
              <button key={s.date} onClick={() => setSel(s.date)} aria-pressed={s.date === selDate}
                aria-label={`${parse(s.date).getDate()} ${MONTH_NAMES[m]}: ${s.total ? `${s.done} من ${s.total}` : "بلا مهام"}`}
                className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg border text-sm ${s.date === selDate ? "border-blue" : "border-line"} ${s.date === today ? "ring-1 ring-gold" : ""} ${full ? "bg-green-soft" : ""}`}>
                <span className="font-semibold">{parse(s.date).getDate()}</span>
                <span className={`text-[10px] ${full ? "text-green" : "text-mute"}`}>{s.total ? (full ? "✓ مكتمل" : `${s.done}/${s.total}`) : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
      <DayPanel date={selDate} data={data} />
    </div>
  );
}
