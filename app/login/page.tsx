"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, usernameToEmail } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: usernameToEmail(username), password,
    });
    if (error) { setErr("اسم المستخدم أو كلمة المرور غير صحيحة"); setBusy(false); return; }
    router.replace("/"); router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <form onSubmit={submit} className="card w-full space-y-4">
        <div className="text-center">
          <div className="text-4xl" aria-hidden>📖</div>
          <h1 className="mt-2 text-xl font-bold">لوحة العادات</h1>
          <p className="text-sm text-mute">القرآن الكريم واللغة الإنجليزية</p>
        </div>
        <div>
          <label className="label" htmlFor="u">اسم المستخدم</label>
          <input id="u" className="input" dir="ltr" autoComplete="username" autoCapitalize="none"
            value={username} onChange={(e) => setU(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="p">كلمة المرور</label>
          <input id="p" type="password" className="input" dir="ltr" autoComplete="current-password"
            value={password} onChange={(e) => setP(e.target.value)} required />
        </div>
        {err && <p role="alert" className="rounded-lg bg-rose-soft p-2 text-sm text-rose">⚠ {err}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "جارٍ الدخول…" : "دخول"}</button>
        <p className="text-center text-xs text-mute">الحسابات يُنشئها ولي الأمر (المسؤول) فقط.</p>
      </form>
    </main>
  );
}
