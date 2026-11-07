import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "habits.example.com";
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${AUTH_DOMAIN}`;
