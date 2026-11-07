import { CATEGORY_LABEL, type Category } from "@/lib/types";

export function Bar({ value, total, color = "blue", label }: { value: number; total: number; color?: "blue" | "green" | "gold"; label?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const bg = color === "green" ? "bg-green" : color === "gold" ? "bg-gold" : "bg-blue";
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}
      className="h-2.5 w-full overflow-hidden rounded-full bg-line">
      <div className={`h-full ${bg} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

const CAT_STYLE: Record<Category, string> = {
  quran: "bg-green-soft text-green",
  english: "bg-blue-soft text-blue",
  habit: "bg-gold-soft text-gold",
  other: "bg-line text-mute",
};
export function CatChip({ c }: { c: Category }) {
  return <span className={`chip ${CAT_STYLE[c]}`}>{CATEGORY_LABEL[c]}</span>;
}

export function Stat({ big, label, sub, tone = "ink" }: { big: string; label: string; sub?: string; tone?: "ink" | "blue" | "green" | "gold" | "rose" }) {
  const t = { ink: "text-ink", blue: "text-blue", green: "text-green", gold: "text-gold", rose: "text-rose" }[tone];
  return (
    <div className="card text-center">
      <div className={`text-3xl font-extrabold ${t}`}>{big}</div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
      {sub && <div className="text-xs text-mute">{sub}</div>}
    </div>
  );
}

export function Empty({ icon = "🌱", children }: { icon?: string; children: React.ReactNode }) {
  return <div className="card py-8 text-center text-sm text-mute"><div className="mb-2 text-3xl" aria-hidden>{icon}</div>{children}</div>;
}

export function ErrorBox({ msg }: { msg: string }) {
  return msg ? <p role="alert" className="mb-3 rounded-xl bg-rose-soft p-3 text-sm text-rose">⚠ {msg}</p> : null;
}
