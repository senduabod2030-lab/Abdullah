"use client";
import { useEffect, useMemo, useState } from "react";
import { ErrorBox } from "@/components/ui";
import { useView } from "@/components/View";
import { supabaseBrowser } from "@/lib/supabase/client";
import { TEMPLATES } from "@/lib/templates";
import { addDays, dayName, dow, prettyDate, todayStr } from "@/lib/dates";

export default function TemplatesPage() {
  const { me, target, profiles } = useView();
  const sb = useMemo(() => supabaseBrowser(), []);
  const [who, setWho] = useState(target.id);
  useEffect(() => setWho(target.id), [target.id]);
  const [start, setStart] = useState("");
  const [existing, setExisting] = useState<Record<string, number>>({});
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await sb.from("tasks").select("plan_key").eq("user_id", who).not("plan_key", "is", null).limit(1000);
      const m: Record<string, number> = {};
      (data ?? []).forEach((r: { plan_key: string }) => { m[r.plan_key] = (m[r.plan_key] ?? 0) + 1; });
      setExisting(m);
    })();
  }, [sb, who, msg]);

  const t = TEMPLATES[0];
  const notSunday = !!start && dow(start) !== 0;
  const prevSun = start ? addDays(start, -dow(start)) : "";
  const nextSun = start ? addDays(start, (7 - dow(start)) % 7) : "";
  const hasPlan = (existing[t.key] ?? 0) > 0;
  const whoName = profiles.find((p) => p.id === who)?.display_name ?? "";

  async function apply() {
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (hasPlan) {
        if (!replace) throw new Error("هذه الخطة مطبّقة مسبقًا. فعّل «استبدال الخطة الحالية» إن أردت إعادة تطبيقها.");
        const { error } = await sb.from("tasks").delete().eq("user_id", who).eq("plan_key", t.key);
        if (error) throw new Error(error.message);
      }
      const rows = t.build(start).map((r) => ({ ...r, user_id: who, created_by: me.id }));
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await sb.from("tasks").insert(rows.slice(i, i + 200));
        if (error) throw new Error(error.message);
      }
      setMsg(`تم تطبيق الخطة لـ ${whoName}: ${rows.length} مهمة من ${prettyDate(start)} إلى ${prettyDate(addDays(start, 34))}.`);
    } catch (e) { setErr(e instanceof Error ? e.message : "فشل التطبيق"); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">القوالب الجاهزة</h1>
      <div className="card space-y-4">
        <div>
          <h2 className="text-lg font-bold">{t.name}</h2>
          <p className="mt-1 text-sm text-mute">{t.description}</p>
          <p className="mt-2 text-sm">بعد التطبيق تصبح مهامها عادية: تعدّلها وتحذفها وتسجل إنجازها من صفحات اليوم والأسبوع. الجمعة راحة بلا مهام.</p>
        </div>
        {me.role === "admin" && profiles.length > 1 && (
          <div>
            <label className="label" htmlFor="who">تطبيق الخطة على</label>
            <select id="who" className="input" value={who} onChange={(e) => setWho(e.target.value)}>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.id === me.id ? `جدولي (${p.display_name})` : p.display_name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="st">تاريخ البداية (يجب أن يكون يوم أحد)</label>
          <input id="st" type="date" className="input" dir="ltr" value={start} onChange={(e) => setStart(e.target.value)} min={todayStr()} />
        </div>
        {notSunday && (
          <div role="alert" className="rounded-xl bg-gold-soft p-3 text-sm text-gold">
            ⚠ {prettyDate(start)} هو يوم {dayName(start)}، والخطة تبدأ دائمًا يوم الأحد. اختر الأحد المناسب:
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="btn" onClick={() => setStart(prevSun)}>الأحد السابق: {prettyDate(prevSun)}</button>
              <button className="btn" onClick={() => setStart(nextSun)}>الأحد القادم: {prettyDate(nextSun)}</button>
            </div>
          </div>
        )}
        {start && !notSunday && <p className="text-sm text-green">✓ تبدأ {prettyDate(start)} وتنتهي {prettyDate(addDays(start, 34))}</p>}
        {hasPlan && (
          <label className="flex min-h-[44px] items-center gap-2 rounded-xl bg-rose-soft p-3 text-sm text-rose">
            <input type="checkbox" className="h-5 w-5" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
            الخطة مطبّقة مسبقًا ({existing[t.key]} مهمة). استبدالها يحذف المهام القديمة وإنجازها نهائيًا.
          </label>
        )}
        <ErrorBox msg={err} />
        {msg && <p role="status" className="rounded-xl bg-green-soft p-3 text-sm text-green">✓ {msg}</p>}
        <button className="btn btn-primary" disabled={!start || notSunday || busy || (hasPlan && !replace)} onClick={apply}>
          {busy ? "جارٍ التطبيق…" : "تطبيق الخطة"}
        </button>
      </div>
      <p className="text-sm text-mute">قالب القرآن الكريم سيُضاف عند استلام ملف مواصفاته.</p>
    </div>
  );
}
