"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useView } from "./View";
import { supabaseBrowser } from "@/lib/supabase/client";

const LINKS = [
  { href: "/", label: "اليوم", icon: "🏠" },
  { href: "/week", label: "الأسبوع", icon: "🗓️" },
  { href: "/month", label: "الشهر", icon: "📅" },
  { href: "/year", label: "السنة", icon: "📊" },
  { href: "/tasks", label: "المهام", icon: "✅" },
  { href: "/templates", label: "القوالب", icon: "📚" },
];

export default function Nav() {
  const { me, target, profiles, href, viewingOther } = useView();
  const path = usePathname();
  const router = useRouter();
  const links = me.role === "admin" ? [...LINKS, { href: "/admin", label: "الإدارة", icon: "🛡️" }] : LINKS;

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.replace("/login"); router.refresh();
  }
  function switchUser(id: string) {
    router.push(id === me.id ? path : `${path}?u=${id}`);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <span className="text-lg font-bold">📖 لوحة العادات</span>
          <nav className="hidden flex-1 gap-1 md:flex" aria-label="التنقل الرئيسي">
            {links.map((l) => {
              const active = path === l.href;
              return (
                <Link key={l.href} href={href(l.href)} aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-blue-soft text-blue" : "text-mute hover:text-ink"}`}>
                  {l.icon} {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mr-auto flex items-center gap-2">
            {me.role === "admin" && profiles.length > 1 && (
              <select aria-label="عرض جدول" className="input !min-h-[40px] !w-auto" value={target.id}
                onChange={(e) => switchUser(e.target.value)}>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.id === me.id ? "جدولي" : p.display_name}</option>)}
              </select>
            )}
            <span className="hidden text-sm text-mute sm:inline">{me.display_name}</span>
            <button className="btn !min-h-[40px]" onClick={logout}>خروج</button>
          </div>
        </div>
        {viewingOther && (
          <div className="bg-gold-soft px-4 py-1.5 text-center text-sm text-gold">
            👁 تعرض جدول <b>{target.display_name}</b> بصلاحية ولي الأمر
          </div>
        )}
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-bg/95 backdrop-blur md:hidden" aria-label="التنقل">
        {links.map((l) => {
          const active = path === l.href;
          return (
            <Link key={l.href} href={href(l.href)} aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center text-[11px] font-semibold ${active ? "text-blue" : "text-mute"}`}>
              <span className="text-lg" aria-hidden>{l.icon}</span>{l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
