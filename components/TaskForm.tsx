"use client";
import { useState } from "react";
import { CATEGORY_LABEL, RECURRENCE_LABEL, type Category, type Recurrence, type Task } from "@/lib/types";
import type { TaskDraft } from "@/lib/useData";
import { hhmm } from "@/lib/dates";

interface Props {
  initial?: Task | null;
  defaultDate: string;
  onSave: (d: TaskDraft, id?: string) => Promise<boolean>;
  onClose: () => void;
}

export default function TaskForm({ initial, defaultDate, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "quran");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [date, setDate] = useState(initial?.start_date ?? defaultDate);
  const [time, setTime] = useState(hhmm(initial?.start_time ?? null));
  const [dur, setDur] = useState(initial?.duration_min ? String(initial.duration_min) : "");
  const [rec, setRec] = useState<Recurrence>(initial?.recurrence ?? "none");
  const [until, setUntil] = useState(initial?.until_date ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setErr("اكتب عنوان المهمة");
    if (until && until < date) return setErr("تاريخ نهاية التكرار قبل تاريخ البداية");
    const d = Number(dur);
    if (dur && (!Number.isInteger(d) || d < 1 || d > 1440)) return setErr("المدة بالدقائق من 1 إلى 1440");
    setBusy(true); setErr("");
    const ok = await onSave({
      title: title.trim(), category, notes: notes.trim() || null, start_date: date,
      start_time: time ? `${time}:00` : null, duration_min: dur ? d : null,
      recurrence: rec, until_date: rec === "none" || !until ? null : until,
      plan_key: initial?.plan_key ?? null, plan_day: initial?.plan_day ?? null,
      slot: initial?.slot ?? null, sort_order: initial?.sort_order ?? 0,
    }, initial?.id);
    setBusy(false);
    if (ok) onClose(); else setErr("تعذّر الحفظ، حاول مرة أخرى");
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={initial ? "تعديل مهمة" : "مهمة جديدة"}>
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-lg animate-sheet-up space-y-3 overflow-y-auto rounded-t-3xl border border-line bg-card p-5 sm:rounded-3xl">
        <h2 className="text-lg font-bold">{initial ? "تعديل المهمة" : "مهمة جديدة"}</h2>
        {initial && initial.recurrence !== "none" && (
          <p className="rounded-lg bg-gold-soft p-2 text-xs text-gold">التعديل يشمل كل تكرارات هذه المهمة.</p>
        )}
        <div>
          <label className="label" htmlFor="tt">العنوان</label>
          <input id="tt" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: ورد القرآن بعد الفجر" maxLength={200} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="tc">النوع</label>
            <select id="tc" className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="td">المدة (دقيقة)</label>
            <input id="td" className="input" inputMode="numeric" dir="ltr" value={dur} onChange={(e) => setDur(e.target.value.replace(/\D/g, ""))} placeholder="اختياري" />
          </div>
          <div>
            <label className="label" htmlFor="ts">تاريخ البداية</label>
            <input id="ts" type="date" className="input" dir="ltr" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="tm">الوقت</label>
            <input id="tm" type="time" className="input" dir="ltr" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="tr">التكرار</label>
            <select id="tr" className="input" value={rec} onChange={(e) => setRec(e.target.value as Recurrence)}>
              {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => <option key={r} value={r}>{RECURRENCE_LABEL[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="tu">ينتهي التكرار في</label>
            <input id="tu" type="date" className="input" dir="ltr" value={until} min={date} disabled={rec === "none"} onChange={(e) => setUntil(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="tn">ملاحظات</label>
          <textarea id="tn" className="input !py-2" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {err && <p role="alert" className="rounded-lg bg-rose-soft p-2 text-sm text-rose">⚠ {err}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn btn-primary flex-1" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ"}</button>
          <button type="button" className="btn" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
