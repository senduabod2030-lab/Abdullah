"use client";
import { useState } from "react";
import DayPanel from "@/components/DayPanel";
import { Bar, pct } from "@/components/ui";
import { useView } from "@/components/View";
import { useData } from "@/lib/useData";
import { rangeStats, sumStats } from "@/lib/recurrence";
import { DAY_NAMES, MONTH_NAMES, addDays, parse, startOfWeek, todayStr } from "@/lib/dates";

export default function WeekPage() {
  const { target } = useView();
  const today = todayStr();
  const [ws, setWs] = useState(startOfWeek(today));
  const [sel, setSel] = useState(today);
  const we = addDays(ws, 6);
  const data = useData(target.id, ws, we);
  const stats = rangeStats(data.tasks, ws, we, data.cache);
  const sum = sumStats(stats);
  const a = parse(ws), b = parse(we);

  function go(n: number) { const s = addDays(ws, n * 7); setWs(s); setSel(s); }
  const selDate = sel >= ws && sel <= we ? sel : ws;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">الأسبوع</h1>
        <span className="text-sm text-mute">{a.getDate()} {MONTH_NAMES[a.getMonth()]} – {b.getDate()} {MONTH_NAMES[b.getMonth()]} {b.getFullYear()}</span>
        <div className="mr-auto flex gap-2">
          <button className="btn" onClick={() => go(-1)} aria-label="الأسبوع السابق">→</button>
          <button className="btn" onClick={() => { setWs(startOfWeek(today)); setSel(today); }}>هذا الأسبوع</button>
          <button className="btn" onClick={() => go(1)} aria-label="الأسبوع التالي">←</button>
        </div>
      </div>
      <div className="card">
        <div className="mb-2 flex justify-between text-sm font-semibold"><span>إنجاز الأسبوع</span><span>{sum.done} / {sum.total} ({pct(sum.done, sum.total)}%)</span></div>
        <Bar value={sum.done} total={sum.total} label="إنجاز الأسبوع" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((s, i) => (
          <button key={s.date} onClick={() => setSel(s.date)} aria-pressed={s.date === selDate}
            className={`card text-start ${s.date === selDate ? "!border-blue" : ""} ${s.date === today ? "ring-1 ring-gold" : ""}`}>
            <div className="font-bold">{DAY_NAMES[i]}</div>
            <div className="text-xs text-mute">{parse(s.date).getDate()} {MONTH_NAMES[parse(s.date).getMonth()]}</div>
            <div className="my-2"><Bar value={s.done} total={s.total} color="green" label={`إنجاز ${DAY_NAMES[i]}`} /></div>
            <div className="text-xs">{s.total ? `${s.done} من ${s.total} مهمة` : "لا مهام"}</div>
            <div className="text-xs text-mute">{s.totalMin ? `${Math.round(s.totalMin / 6) / 10} ساعة مخططة` : ""}</div>
          </button>
        ))}
      </div>
      <DayPanel date={selDate} data={data} />
    </div>
  );
}
