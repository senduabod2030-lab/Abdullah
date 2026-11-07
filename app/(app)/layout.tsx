import { Suspense } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ViewProvider } from "@/components/View";
import Nav from "@/components/Nav";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  // RLS: المسؤول يرى الجميع، والعضو يرى نفسه فقط
  const { data } = await sb.from("profiles").select("id,username,display_name,role").order("created_at");
  const profiles = (data ?? []) as Profile[];
  const me = profiles.find((p) => p.id === user.id);
  if (!me) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="card text-center">لم يُعثر على ملفك الشخصي. تأكد من تشغيل ملف schema.sql ثم أعد الدخول.</div>
      </main>
    );
  }
  return (
    <Suspense>
      <ViewProvider me={me} profiles={profiles}>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pb-8">{children}</main>
      </ViewProvider>
    </Suspense>
  );
}
