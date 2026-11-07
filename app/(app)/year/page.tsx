"use client";
import { useState } from "react";
import { Bar, Stat, pct } from "@/components/ui";
import { useView } from "@/components/View";
import { useData } from "@/lib/useData";
import { rangeStats, sumStats } from "@/lib/recurrence";
import { MONTH_NAMES, fmt, parse, todayStr } from "@/lib/dates";

function cell(done: number, total: number) {
  if (!total) return "bg-line/40";
  const p = done / total;
  if (p === 0) return "bg-rose-soft";
  if (p < 0.5) return "bg-gold-soft";
  if (p < 1) return "bg-blue-soft";
  return "bg-green";
}

export default function YearPage() {
  const { target } = useView();
  const today = todayStr();
  const [y, setY] = useState(parse(today).getFullYear());
  const from = `${y}-01-01`, to = `${y}-12-31`;
  const data = useData(target.id, from, to);
  const stats = rangeStats(data.tasks, from, to, data.cache);
  const sum = sumStats(stats);
  const byMonth = MONTH_NAMES.map((_, m) => sumStats(stats.filter((s) => parse(s.date).getMonth() === m)));
  const activeDays = stats.filter((s) => s.total > 0).length;
  const fullDays = stats.filter((s) => s.total > 0 && s.done === s.total).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">سنة {y}</h1>
        <div className="mr-auto flex gap-2">
          <button className="btn" onClick={() => setY(y - 1)} aria-label="السنة السابقة">→</button>
          <button className="btn" onClick={() => setY(parse(today).getFullYear())}>هذه السنة</button>
          <button className="btn" onClick={() => setY(y + 1)} aria-label="السنة التالية">←</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat big={`${pct(sum.done, sum.total)}%`} label="إنجاز السنة" sub={`${sum.done} من ${sum.total} مهمة`} tone="green" />
        <Stat big={String(fullDays)} label="أيام مكتملة بالكامل" sub={`من ${activeDays} يوم فيه مهام`} tone="blue" />
        <Stat big={`${Math.round(sum.doneMin / 6) / 10}`} label="ساعات منجزة" tone="gold" />
        <Stat big={`${Math.round(sum.totalMin / 6) / 10}`} label="ساعات مخططة" />
      </div>
      <div className="card overflow-x-auto">
        <p className="mb-3 text-xs text-mute">كل مربع يوم. <span className="chip bg-green text-bg">أخضر: مكتمل</span> <span className="chip bg-blue-soft text-blue">أزرق: أكثر من النصف</span> <span className="chip bg-gold-soft text-gold">أصفر: أقل من النصف</span> <span className="chip bg-rose-soft text-rose">أحمر: لم يُنجز</span> <span className="chip bg-line/40 text-mute">رمادي: بلا مهام</span></p>
        <div className="grid min-w-[640px] grid-cols-3 gap-4 md:grid-cols-4">
          {MONTH_NAMES.map((mn, m) => {
            const days = stats.filter((s) => parse(s.date).getMonth() === m);
            return (
              <div key={mn}>
                <div className="mb-1 flex justify-between text-xs"><b>{mn}</b><span className="text-mute">{pct(byMonth[m].done, byMonth[m].total)}%</span></div>
                <div className="grid grid-cols-7 gap-[3px]">
                  {Array.from({ length: parse(days[0].date).getDay() }).map((_, i) => <div key={i} />)}
                  {days.map((s) => (
                    <div key={s.date} title={`${s.date}: ${s.total ? `${s.done}/${s.total}` : "بلا مهام"}`}
                      className={`aspect-square rounded-[3px] ${cell(s.done, s.total)} ${s.date === today ? "ring-1 ring-gold" : ""}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card space-y-2">
        <h2 className="font-bold">حسب الشهر</h2>
        {byMonth.map((s, m) => (
          <div key={m} className="grid grid-cols-[70px_1fr_90px] items-center gap-3 text-sm">
            <span>{MONTH_NAMES[m]}</span><Bar value={s.done} total={s.total} color="green" label={MONTH_NAMES[m]} />
            <span className="text-mute">{s.total ? `${s.done} / ${s.total}` : "–"}</span>
          </div>
        ))}
      </div>
      {data.error && <p className="text-rose">{data.error}</p>}
    </div>
  );
}
