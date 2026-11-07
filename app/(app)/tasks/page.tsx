"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Bidi from "@/components/Bidi";
import TaskForm from "@/components/TaskForm";
import { CatChip, Empty, ErrorBox } from "@/components/ui";
import { useView } from "@/components/View";
import { supabaseBrowser } from "@/lib/supabase/client";
import { RECURRENCE_LABEL, type Task } from "@/lib/types";
import { ENGLISH_KEY } from "@/lib/templates/english35";
import { prettyDate, todayStr } from "@/lib/dates";
import type { TaskDraft } from "@/lib/useData";

export default function TasksPage() {
  const { me, target } = useView();
  const sb = useMemo(() => supabaseBrowser(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const all: Task[] = [];
    for (let i = 0; ; i += 1000) {
      const { data, error } = await sb.from("tasks").select("*").eq("user_id", target.id).order("start_date").order("id").range(i, i + 999);
      if (error) { setErr(error.message); break; }
      all.push(...(data as Task[]));
      if (!data || data.length < 1000) break;
    }
    setTasks(all); setLoading(false);
  }, [sb, target.id]);
  useEffect(() => { load(); }, [load]);

  async function save(d: TaskDraft, id?: string) {
    const { error } = id ? await sb.from("tasks").update(d).eq("id", id)
      : await sb.from("tasks").insert({ ...d, user_id: target.id, created_by: me.id });
    if (error) { setErr(error.message); return false; }
    await load(); return true;
  }
  async function del(id: string) {
    const { error } = await sb.from("tasks").delete().eq("id", id);
    if (error) setErr(error.message);
    setConfirm(null); await load();
  }
  async function delPlan(key: string) {
    const { error } = await sb.from("tasks").delete().eq("user_id", target.id).eq("plan_key", key);
    if (error) setErr(error.message);
    setConfirm(null); await load();
  }

  const own = tasks.filter((t) => !t.plan_key && t.title.includes(q.trim()));
  const planKeys = [...new Set(tasks.filter((t) => t.plan_key).map((t) => t.plan_key!))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">إدارة المهام</h1>
        <button className="btn btn-primary mr-auto" onClick={() => setAdding(true)}>＋ مهمة جديدة</button>
      </div>
      <ErrorBox msg={err} />
      {planKeys.map((k) => {
        const n = tasks.filter((t) => t.plan_key === k);
        return (
          <div key={k} className="card flex flex-wrap items-center gap-3">
            <div>
              <b>{k === ENGLISH_KEY ? "خطة الإنجليزية — 35 يومًا" : k}</b>
              <p className="text-xs text-mute">{n.length} مهمة — تبدأ {prettyDate(n[0].start_date)} — تُعدَّل مهامها من صفحات اليوم والأسبوع</p>
            </div>
            {confirm === `plan:${k}` ? (
              <span className="mr-auto flex items-center gap-2 text-sm">حذف الخطة كاملة مع إنجازها؟
                <button className="btn btn-danger" onClick={() => delPlan(k)}>نعم</button>
                <button className="btn" onClick={() => setConfirm(null)}>تراجع</button></span>
            ) : <button className="btn btn-danger mr-auto" onClick={() => setConfirm(`plan:${k}`)}>🗑 حذف الخطة كاملة</button>}
          </div>
        );
      })}
      <input className="input" placeholder="🔎 ابحث في مهامي" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
      {loading ? <p className="text-mute">جارٍ التحميل…</p> : own.length === 0 ? (
        <Empty>لا توجد مهام مخصصة بعد. أضف أول عادة، مثل «ورد القرآن» وكرّرها كل يوم.</Empty>
      ) : (
        <div className="space-y-2">
          {own.map((t) => (
            <div key={t.id} className="card flex flex-wrap items-center gap-2 !p-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold"><Bidi text={t.title} /></div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <CatChip c={t.category} />
                  <span className="chip bg-line text-mute">{prettyDate(t.start_date)}</span>
                  <span className="chip bg-line text-mute">🔁 {RECURRENCE_LABEL[t.recurrence]}</span>
                  {t.until_date && <span className="chip bg-line text-mute">حتى {t.until_date}</span>}
                  {t.until_date && t.until_date < todayStr() && <span className="chip bg-gold-soft text-gold">انتهت</span>}
                </div>
              </div>
              <button className="btn" onClick={() => setEditing(t)}>✎ تعديل</button>
              {confirm === t.id ? (
                <>
                  <button className="btn btn-danger" onClick={() => del(t.id)}>تأكيد الحذف</button>
                  <button className="btn" onClick={() => setConfirm(null)}>تراجع</button>
                </>
              ) : <button className="btn btn-danger" onClick={() => setConfirm(t.id)}>🗑 حذف</button>}
            </div>
          ))}
        </div>
      )}
      {(adding || editing) && <TaskForm initial={editing} defaultDate={todayStr()} onSave={save} onClose={() => { setAdding(false); setEditing(null); }} />}
    </div>
  );
}
