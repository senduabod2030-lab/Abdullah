import { NextResponse } from "next/server";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

const DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "habits.example.com";
const USERNAME = /^[a-z0-9_.-]{3,20}$/;

async function requireAdmin() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" ? user : null;
}
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return bad("غير مصرّح", 403);
  const b = await req.json().catch(() => ({}));
  const username = String(b.username ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const display = String(b.display_name ?? "").trim() || username;
  const role = b.role === "admin" ? "admin" : "member";
  if (!USERNAME.test(username)) return bad("اسم المستخدم: حروف إنجليزية صغيرة وأرقام و ._- من 3 إلى 20");
  if (password.length < 6) return bad("كلمة المرور 6 أحرف على الأقل");
  const svc = supabaseService();
  const { data, error } = await svc.auth.admin.createUser({
    email: `${username}@${DOMAIN}`, password, email_confirm: true, user_metadata: { display_name: display },
  });
  if (error) return bad(error.message.includes("already") ? "اسم المستخدم مستخدم مسبقًا" : error.message);
  if (role === "admin") await svc.from("profiles").update({ role }).eq("id", data.user.id);
  return NextResponse.json({ ok: true, id: data.user.id });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return bad("غير مصرّح", 403);
  const b = await req.json().catch(() => ({}));
  const id = String(b.id ?? "");
  const svc = supabaseService();
  if (b.password !== undefined) {
    if (String(b.password).length < 6) return bad("كلمة المرور 6 أحرف على الأقل");
    const { error } = await svc.auth.admin.updateUserById(id, { password: String(b.password) });
    if (error) return bad(error.message);
  }
  if (b.display_name !== undefined) {
    const name = String(b.display_name).trim();
    if (!name) return bad("الاسم فارغ");
    const { error } = await svc.from("profiles").update({ display_name: name }).eq("id", id);
    if (error) return bad(error.message);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return bad("غير مصرّح", 403);
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (id === admin.id) return bad("لا يمكنك حذف حسابك");
  const { error } = await supabaseService().auth.admin.deleteUser(id);
  if (error) return bad(error.message);
  return NextResponse.json({ ok: true });
}
