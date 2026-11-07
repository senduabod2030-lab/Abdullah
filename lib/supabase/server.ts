import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Component */ }
        },
      },
    },
  );
}

/** صلاحيات كاملة: للاستخدام داخل مسارات /api فقط بعد التحقق من أن المستدعي مسؤول */
export function supabaseService() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
