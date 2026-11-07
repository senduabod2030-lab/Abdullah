"use client";
import { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Profile } from "@/lib/types";

interface Ctx { me: Profile; target: Profile; profiles: Profile[]; href: (p: string) => string; viewingOther: boolean }
const C = createContext<Ctx | null>(null);

export function ViewProvider({ me, profiles, children }: { me: Profile; profiles: Profile[]; children: React.ReactNode }) {
  const sp = useSearchParams();
  const u = sp.get("u");
  const value = useMemo<Ctx>(() => {
    const target = (me.role === "admin" && profiles.find((p) => p.id === u)) || me;
    return {
      me, target, profiles, viewingOther: target.id !== me.id,
      href: (p: string) => (target.id !== me.id ? `${p}${p.includes("?") ? "&" : "?"}u=${target.id}` : p),
    };
  }, [me, profiles, u]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useView() {
  const v = useContext(C);
  if (!v) throw new Error("ViewProvider missing");
  return v;
}
