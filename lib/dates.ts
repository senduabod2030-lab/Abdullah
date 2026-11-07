// كل التواريخ نصوص بصيغة YYYY-MM-DD بالتوقيت المحلي للجهاز، لتفادي مشاكل UTC
export const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
export const MONTH_NAMES = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
export const WEEK_NAMES = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];

const p2 = (n: number) => String(n).padStart(2, "0");

export function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function fmt(d: Date): string {
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}
export function todayStr(): string {
  return fmt(new Date());
}
export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return fmt(d);
}
export function diffDays(a: string, b: string): number {
  const A = parse(a), B = parse(b);
  return Math.round((Date.UTC(B.getFullYear(), B.getMonth(), B.getDate()) -
    Date.UTC(A.getFullYear(), A.getMonth(), A.getDate())) / 86400000);
}
export function dow(s: string): number {
  return parse(s).getDay(); // 0 = الأحد
}
export function dayName(s: string): string {
  return DAY_NAMES[dow(s)];
}
export function startOfWeek(s: string): string {
  return addDays(s, -dow(s)); // الأسبوع يبدأ الأحد
}
export function daysInMonth(y: number, m0: number): number {
  return new Date(y, m0 + 1, 0).getDate();
}
export function range(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}
export function prettyDate(s: string): string {
  const d = parse(s);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}
export function hhmm(t: string | null): string {
  return t ? t.slice(0, 5) : "";
}
export function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  if (h && m) return `${h} س ${m} د`;
  if (h) return `${h} ساعة`;
  return `${m} دقيقة`;
}

/** التاريخ الهجري (أم القرى) كنص عربي، أو سلسلة فارغة إن لم يدعمه المتصفح */
export function hijri(s: string): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(parse(s));
  } catch { return ""; }
}
