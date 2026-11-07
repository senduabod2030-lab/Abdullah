"use client";
import { useState } from "react";
import Bidi from "./Bidi";
import TaskForm from "./TaskForm";
import { Bar, CatChip, Empty, ErrorBox, pct } from "./ui";
import { useView } from "./View";
import { isDone, occurrencesOn, required, type Occurrence } from "@/lib/recurrence";
import { RECURRENCE_LABEL, type Task } from "@/lib/types";
import { SKILLS_GROUP, ENGLISH_KEY } from "@/lib/templates/english35";
import { dayName, fmtMinutes, hhmm, prettyDate } from "@/lib/dates";
import type { DataApi } from "@/lib/useData";

export default function DayPanel({ date, data, title }: { date: string; data: DataApi; title?: string }) {
  const { me } = useView();
  const [editing, setEditing] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const occs = occurrencesOn(data.tasks, date, data.cache);
  const req = required(occs);
  const done = req.filter(isDone).length;

  // تجميع مهام الخطة (نفس الخطة ونفس اليوم) في بطاقة واحدة
  const groups: { key: string; plan?: { key: string; day: number }; items: Occurrence[] }[] = [];
  for (const o of occs) {
    const pk = o.task.plan_key, pd = o.task.plan_day;
    const k = pk && pd ? `${pk}#${pd}` : o.key;
    const g = groups.find((x) => x.key === k);
    if (g) g.items.push(o);
    else groups.push({ key: k, plan: pk && pd ? { key: pk, day: pd } : undefined, items: [o] });
  }

  return (
    <section aria-label={title ?? prettyDate(date)}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold">{title ?? prettyDate(date)}</h2>
        <span className="chip bg-line text-mute">{req.length ? `${done} من ${req.length} مهمة` : "لا مهام"}</span>
        <button className="btn btn-primary mr-auto" onClick={() => setAdding(true)}>＋ مهمة</button>
      </div>
      {req.length > 0 && <div className="mb-4"><Bar value={done} total={req.length} color="green" label="تقدم اليوم" /><p className="mt-1 text-xs text-mute">إنجاز اليوم {pct(done, req.length)}% (حسب المهام المحددة فعليًا)</p></div>}
      <ErrorBox msg={data.error} />
      {occs.length === 0 && <Empty>لا توجد مهام في هذا اليوم. أضف مهمة أو طبّق قالبًا من صفحة القوالب.</Empty>}
      <div className="space-y-3">
        {groups.map((g) =>
          g.plan ? (
            <PlanCard key={g.key} date={date} group={g} data={data} onEdit={setEditing} />
          ) : (
            <OccRow key={g.key} o={g.items[0]} data={data} onEdit={setEditing} />
          ),
        )}
      </div>
      {(adding || editing) && (
        <TaskForm initial={editing} defaultDate={date}
          onSave={(d, id) => data.saveTask(d, id, me.id)}
          onClose={() => { setAdding(false); setEditing(null); }} />
      )}
    </section>
  );
}

function PlanCard({ date, group, data, onEdit }: { date: string; group: { plan?: { key: string; day: number }; items: Occurrence[] }; data: DataApi; onEdit: (t: Task) => void }) {
  const grammar = group.items.filter((o) => !o.task.slot?.startsWith("skill-"));
  const skills = group.items.filter((o) => o.task.slot?.startsWith("skill-"));
  const all = required(group.items);
  const d = all.filter(isDone).length;
  const mins = (xs: Occurrence[]) => xs.reduce((a, o) => a + (o.task.duration_min ?? 0), 0);
  const isEnglish = group.plan?.key === ENGLISH_KEY;
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card2 px-4 py-3">
        <b>{isEnglish ? "خطة الإنجليزية" : group.plan?.key} — اليوم {group.plan?.day}{isEnglish ? " من 35" : ""} — {dayName(date)}</b>
        <span className="chip bg-line text-mute">{d} / {all.length}</span>
        <span className="mr-auto text-xs text-mute">{fmtMinutes(mins(group.items))}</span>
      </div>
      <div className="px-4 pt-3"><Bar value={d} total={all.length} color="green" label="تقدم اليوم" /></div>
      <div className="space-y-1 p-2">
        <div className="px-2 pt-1 text-xs font-bold text-blue">القواعد والتطبيق — {mins(grammar)} دقيقة</div>
        {grammar.map((o) => <OccRow key={o.key} o={o} data={data} onEdit={onEdit} flat />)}
        {skills.length > 0 && <div className="px-2 pt-3 text-xs font-bold text-green">{SKILLS_GROUP} — {mins(skills)} دقيقة</div>}
        {skills.map((o) => <OccRow key={o.key} o={o} data={data} onEdit={onEdit} flat />)}
      </div>
    </div>
  );
}

function OccRow({ o, data, onEdit, flat }: { o: Occurrence; data: DataApi; onEdit: (t: Task) => void; flat?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [note, setNote] = useState(o.completion?.note ?? "");
  const t = o.task;
  const c = o.completion;
  const done = c?.status === "done";
  const skipped = c?.status === "skipped";
  const slotLabel: Record<string, string> = { primary: "الدرس الأساسي", related: "الدرس المرتبط", practice: "", review: "المراجعة" };
  const prefix = t.slot ? slotLabel[t.slot] : "";

  return (
    <div className={flat ? "rounded-xl hover:bg-card2/60" : "card !p-3"}>
      <div className="flex items-center gap-3">
        <button role="checkbox" aria-checked={done} aria-label={`إنجاز: ${t.title}`} disabled={skipped}
          onClick={() => data.setComp(t.id, o.date, { status: done ? "pending" : "done" })}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 text-xl transition ${done ? "border-green bg-green text-bg" : "border-line text-transparent hover:border-green"} disabled:opacity-40`}>
          ✓
        </button>
        <button className="min-w-0 flex-1 py-2 text-start" onClick={() => setOpen(!open)} aria-expanded={open}>
          <div className={`font-semibold ${done ? "text-mute line-through" : ""} ${skipped ? "text-mute" : ""}`}>
            {prefix && <span className="text-mute">{prefix}: </span>}<Bidi text={t.title} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {!flat && <CatChip c={t.category} />}
            {t.start_time && <span className="chip bg-line text-mute" dir="ltr">{hhmm(t.start_time)}</span>}
            {t.duration_min && <span className="chip bg-line text-mute">{t.duration_min} د</span>}
            {t.recurrence !== "none" && <span className="chip bg-line text-mute">🔁 {RECURRENCE_LABEL[t.recurrence]}</span>}
            {c?.needs_review && <span className="chip bg-gold-soft text-gold">⚑ يحتاج مراجعة</span>}
            {c?.rating && <span className="chip bg-line text-mute">فهم {c.rating}/5</span>}
            {skipped && <span className="chip bg-line text-mute">تم تخطيه</span>}
          </div>
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-line px-1 pb-2 pt-3 mt-2">
          {t.notes && <p className="whitespace-pre-wrap text-sm text-mute">{t.notes}</p>}
          <div>
            <label className="label" htmlFor={`n-${o.key}`}>ملاحظاتي</label>
            <textarea id={`n-${o.key}`} className="input !py-2" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== (c?.note ?? "") && data.setComp(t.id, o.date, { note: note.trim() || null })} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-mute">تقييم الفهم:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} aria-pressed={c?.rating === n} aria-label={`تقييم ${n}`}
                onClick={() => data.setComp(t.id, o.date, { rating: c?.rating === n ? null : n })}
                className={`h-10 w-10 rounded-lg border text-sm font-bold ${c?.rating === n ? "border-gold bg-gold-soft text-gold" : "border-line text-mute"}`}>{n}</button>
            ))}
            <label className="mr-auto flex min-h-[40px] cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[#f5c451]" checked={!!c?.needs_review}
                onChange={(e) => data.setComp(t.id, o.date, { needs_review: e.target.checked })} /> يحتاج مراجعة
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => onEdit(t)}>✎ تعديل</button>
            {t.recurrence !== "none" && (
              <button className="btn" onClick={() => data.setComp(t.id, o.date, { status: skipped ? "pending" : "skipped" })}>
                {skipped ? "↩ إلغاء التخطي" : "⏭ تخطي هذا اليوم"}
              </button>
            )}
            {!confirmDel ? (
              <button className="btn btn-danger" onClick={() => setConfirmDel(true)}>🗑 حذف</button>
            ) : (
              <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-rose-soft p-2 text-sm">
                <span>{t.recurrence !== "none" ? "حذف كل تكرارات المهمة نهائيًا؟" : "حذف المهمة نهائيًا؟"}</span>
                <button className="btn btn-danger" onClick={() => data.deleteTask(t.id)}>نعم، احذف</button>
                <button className="btn" onClick={() => setConfirmDel(false)}>تراجع</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
