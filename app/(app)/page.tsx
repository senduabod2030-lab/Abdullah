"use client";
import { useMemo, useState } from "react";
import DayPanel from "@/components/DayPanel";
import { Bar, Stat, pct } from "@/components/ui";
import Ring from "@/components/Ring";
import { StatsSkeleton, ListSkeleton } from "@/components/Skeleton";
import { useView } from "@/components/View";
import { useData } from "@/lib/useData";
import { dayStat, rangeStats, streak, sumStats } from "@/lib/recurrence";
import { DAY_NAMES, addDays, hijri, parse, prettyDate, startOfWeek, todayStr } from "@/lib/dates";

export default function TodayPage() {
  const { target } = useView();
  const today = todayStr();
  const [date, setDate] = useState(today);
  const wkStart = startOfWeek(date);
  // نجلب سنة للخلف لحساب السلسلة المتتالية بدقة
  const from = useMemo(() => addDays(today, -400), [today]);
  const data = useData(target.id, from, addDays(wkStart, 6) > today ? addDays(wkStart, 6) : today);

  const week = rangeStats(data.tasks, wkStart, addDays(wkStart, 6), data.cache);
  const ws = sumStats(week);
  const st = streak(data.tasks, today, data.cache);
  const ds = dayStat(data.tasks, today, data.cache);

  return (
    <div className="space-y-5">
      <div className="geo card relative flex flex-wrap items-center gap-5 overflow-hidden !border-brand/30 !p-5 animate-fade-up">
        <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-green/10 blur-3xl" aria-hidden />
        <Ring value={ds.done} total={ds.total} label="إنجاز اليوم" />
        <div className="min-w-[200px] flex-1">
          <p className="text-sm text-brand">{hijri(today)}</p>
          <h1 className="mt-1 text-2xl font-extrabold">أهلًا {target.display_name} 👋</h1>
          <p className="mt-1 text-sm text-mute">{prettyDate(today)}</p>
          <p className="mt-3 text-sm">
            {ds.total === 0 ? "لا توجد مهام اليوم، أضف مهمة أو طبّق قالبًا." : ds.done === ds.total ? "ما شاء الله، أتممت مهام اليوم كلها ✨" : `باقي ${ds.total - ds.done} من ${ds.total} مهام اليوم`}
          </p>
        </div>
      </div>

      {data.loading && data.tasks.length === 0 ? <StatsSkeleton /> : (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat big={`${pct(ds.done, ds.total)}%`} label="إنجاز اليوم" sub={`${ds.done} من ${ds.total}`} tone="green" />
        <Stat big={`${pct(ws.done, ws.total)}%`} label="إنجاز الأسبوع" sub={`${ws.done} من ${ws.total}`} tone="violet" />
        <Stat big={String(st)} label="أيام متتالية مكتملة" sub="الأيام بلا مهام لا تقطعها" tone="gold" />
        <Stat big={`${Math.round(ws.doneMin / 6) / 10}`} label="ساعات منجزة هذا الأسبوع" sub={`من ${Math.round(ws.totalMin / 6) / 10} ساعة مخططة`} />
      </div>)}

      <div className="card">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span>الأسبوع</span><span className="text-mute">{ws.done} / {ws.total}</span>
        </div>
        <Bar value={ws.done} total={ws.total} label="تقدم الأسبوع" />
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {week.map((s, i) => {
            const sel = s.date === date;
            const p = pct(s.done, s.total);
            return (
              <button key={s.date} onClick={() => setDate(s.date)} aria-pressed={sel} aria-label={`${DAY_NAMES[i]} ${parse(s.date).getDate()}: ${s.total ? `${s.done} من ${s.total}` : "بلا مهام"}`}
                className={`rounded-xl border p-1.5 text-center text-xs ${sel ? "border-brand bg-brand-soft" : "border-line"} ${s.date === today ? "ring-1 ring-gold" : ""}`}>
                <div className="font-semibold">{DAY_NAMES[i]}</div>
                <div className="text-mute">{parse(s.date).getDate()}</div>
                <div className={`mt-1 font-bold ${s.total && p === 100 ? "text-green" : "text-ink"}`}>{s.total ? (p === 100 ? "✓" : `${p}%`) : "–"}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between gap-2">
          <button className="btn" onClick={() => setDate(addDays(date, -1))}>→ اليوم السابق</button>
          {date !== today && <button className="btn" onClick={() => setDate(today)}>اليوم</button>}
          <button className="btn" onClick={() => setDate(addDays(date, 1))}>اليوم التالي ←</button>
        </div>
      </div>

      {data.loading && data.tasks.length === 0 ? <ListSkeleton /> : <DayPanel date={date} data={data} />}
    </div>
  );
}
