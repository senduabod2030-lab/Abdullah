"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, ErrorBox, pct } from "@/components/ui";
import { useView } from "@/components/View";
import { supabaseBrowser } from "@/lib/supabase/client";
import { compCache, rangeStats, streak, sumStats } from "@/lib/recurrence";
import { addDays, todayStr } from "@/lib/dates";
import type { Completion, Task } from "@/lib/types";

async function all<T>(build: (a: number, b: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const out: T[] = [];
  for (let i = 0; ; i += 1000) {
    const { data, error } = await build(i, i + 999);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

async function api(method: string, body?: unknown, qs = "") {
  const r = await fetch(`/api/admin/users${qs}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "فشل الطلب");
  return j;
}

export default function AdminPage() {
  const { me, profiles } = useView();
  const sb = useMemo(() => supabaseBrowser(), []);
  const today = todayStr();
  const from = addDays(today, -400);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comps, setComps] = useState<Completion[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ username: "", display_name: "", password: "", role: "member" });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pw, setPw] = useState<{ id: string; value: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks(await all<Task>((a, b) => sb.from("tasks").select("*").lte("start_date", today).order("id").range(a, b)));
      setComps(await all<Completion>((a, b) => sb.from("completions").select("*").gte("occurrence_date", from).lte("occurrence_date", today).order("id").range(a, b)));
    } catch (e) { setErr(e instanceof Error ? e.message : "تعذّر التحميل"); }
  }, [sb, today, from]);
  useEffect(() => { load(); }, [load]);

  if (me.role !== "admin") return <p className="card">هذه الصفحة لولي الأمر (المسؤول) فقط.</p>;

  async function run(fn: () => Promise<unknown>, ok: string) {
    setErr(""); setMsg(""); setBusy(true);
    try { await fn(); setMsg(ok); } catch (e) { setErr(e instanceof Error ? e.message : "فشل"); }
    setBusy(false);
  }
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api("POST", form);
      setForm({ username: "", display_name: "", password: "", role: "member" });
      location.reload();
    }, "تم إنشاء الحساب");
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">لوحة ولي الأمر</h1>
      <ErrorBox msg={err} />
      {msg && <p role="status" className="rounded-xl bg-green-soft p-3 text-sm text-green">✓ {msg}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {profiles.map((p) => {
          const ut = tasks.filter((t) => t.user_id === p.id);
          const cache = compCache(comps.filter((c) => c.user_id === p.id));
          const d = sumStats(rangeStats(ut, today, today, cache));
          const w = sumStats(rangeStats(ut, addDays(today, -6), today, cache));
          const m = sumStats(rangeStats(ut, addDays(today, -29), today, cache));
          return (
            <div key={p.id} className="card space-y-3">
              <div className="flex items-center gap-2">
                <b className="text-lg">{p.display_name}</b>
                <span className="chip bg-line text-mute" dir="ltr">{p.username}</span>
                {p.role === "admin" && <span className="chip bg-gold-soft text-gold">ولي الأمر</span>}
              </div>
              {[["اليوم", d], ["آخر 7 أيام", w], ["آخر 30 يومًا", m]].map(([l, s]) => {
                const x = s as typeof d;
                return (
                  <div key={l as string}>
                    <div className="mb-1 flex justify-between text-xs"><span>{l as string}</span><span className="text-mute">{x.total ? `${x.done} / ${x.total} (${pct(x.done, x.total)}%)` : "لا مهام"}</span></div>
                    <Bar value={x.done} total={x.total} color="green" label={l as string} />
                  </div>
                );
              })}
              <p className="text-sm text-mute">🔥 أيام متتالية مكتملة: <b className="text-ink">{streak(ut, today, cache)}</b></p>
              <div className="flex flex-wrap gap-2">
                <Link className="btn" href={p.id === me.id ? "/" : `/?u=${p.id}`}>عرض الجدول</Link>
                <Link className="btn" href={`/templates?u=${p.id}`}>تطبيق قالب</Link>
                <button className="btn" onClick={() => setPw({ id: p.id, value: "" })}>🔑 كلمة مرور</button>
                {p.id !== me.id && (confirm === p.id ? (
                  <><button className="btn btn-danger" disabled={busy} onClick={() => run(async () => { await api("DELETE", undefined, `?id=${p.id}`); location.reload(); }, "تم الحذف")}>تأكيد حذف الحساب وبياناته</button>
                    <button className="btn" onClick={() => setConfirm(null)}>تراجع</button></>
                ) : <button className="btn btn-danger" onClick={() => setConfirm(p.id)}>🗑 حذف</button>)}
              </div>
              {pw?.id === p.id && (
                <div className="flex gap-2">
                  <input className="input" dir="ltr" type="text" placeholder="كلمة المرور الجديدة (6+)" value={pw.value} onChange={(e) => setPw({ id: p.id, value: e.target.value })} />
                  <button className="btn btn-primary" disabled={busy} onClick={() => run(async () => { await api("PATCH", { id: p.id, password: pw.value }); setPw(null); }, "تم تغيير كلمة المرور")}>حفظ</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={create} className="card space-y-3">
        <h2 className="text-lg font-bold">＋ إضافة أخ جديد</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="nu">اسم المستخدم (إنجليزي)</label>
            <input id="nu" className="input" dir="ltr" autoCapitalize="none" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div><label className="label" htmlFor="nd">الاسم الظاهر</label>
            <input id="nd" className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
          <div><label className="label" htmlFor="np">كلمة المرور</label>
            <input id="np" className="input" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          <div><label className="label" htmlFor="nr">الدور</label>
            <select id="nr" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="member">عضو (يرى جدوله فقط)</option><option value="admin">ولي أمر (يرى الجميع)</option></select></div>
        </div>
        <button className="btn btn-primary" disabled={busy}>إنشاء الحساب</button>
      </form>
    </div>
  );
}
