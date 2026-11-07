import { Completion, Task } from "./types";
import { daysInMonth, diffDays, parse, range } from "./dates";

/** هل تقع المهمة في هذا التاريخ؟ */
export function occursOn(t: Task, date: string): boolean {
  if (date < t.start_date) return false;
  if (t.until_date && date > t.until_date) return false;
  const diff = diffDays(t.start_date, date);
  switch (t.recurrence) {
    case "none":
      return diff === 0;
    case "daily":
      return true;
    case "weekly":
      return diff % 7 === 0;
    case "biweekly":
      return diff % 14 === 0;
    case "monthly": {
      const s = parse(t.start_date), d = parse(date);
      // لو بدأت يوم 31 تُعرض في آخر يوم من الشهر القصير
      const target = Math.min(s.getDate(), daysInMonth(d.getFullYear(), d.getMonth()));
      return d.getDate() === target;
    }
    case "yearly": {
      const s = parse(t.start_date), d = parse(date);
      if (s.getMonth() !== d.getMonth()) return false;
      const target = Math.min(s.getDate(), daysInMonth(d.getFullYear(), d.getMonth()));
      return d.getDate() === target;
    }
  }
}

export interface Occurrence {
  key: string; // taskId|date
  task: Task;
  date: string;
  completion?: Completion;
}

export function compCache(completions: Completion[]): Map<string, Completion> {
  const m = new Map<string, Completion>();
  for (const c of completions) m.set(`${c.task_id}|${c.occurrence_date}`, c);
  return m;
}

export function sortOcc(a: Occurrence, b: Occurrence): number {
  const ta = a.task.start_time ?? "99:99", tb = b.task.start_time ?? "99:99";
  if (ta !== tb) return ta < tb ? -1 : 1;
  if (a.task.sort_order !== b.task.sort_order) return a.task.sort_order - b.task.sort_order;
  return a.task.title.localeCompare(b.task.title, "ar");
}

export function occurrencesOn(tasks: Task[], date: string, cache: Map<string, Completion>): Occurrence[] {
  const out: Occurrence[] = [];
  for (const t of tasks) {
    if (!occursOn(t, date)) continue;
    out.push({ key: `${t.id}|${date}`, task: t, date, completion: cache.get(`${t.id}|${date}`) });
  }
  return out.sort(sortOcc);
}

/** المطلوب فعليًا = كل ما لم يُتخطَّ */
export function required(occ: Occurrence[]): Occurrence[] {
  return occ.filter((o) => o.completion?.status !== "skipped");
}
export function isDone(o: Occurrence): boolean {
  return o.completion?.status === "done";
}

export interface DayStat { date: string; done: number; total: number; doneMin: number; totalMin: number }

export function dayStat(tasks: Task[], date: string, cache: Map<string, Completion>): DayStat {
  const req = required(occurrencesOn(tasks, date, cache));
  let done = 0, doneMin = 0, totalMin = 0;
  for (const o of req) {
    const m = o.task.duration_min ?? 0;
    totalMin += m;
    if (isDone(o)) { done++; doneMin += m; }
  }
  return { date, done, total: req.length, doneMin, totalMin };
}

export function rangeStats(tasks: Task[], from: string, to: string, cache: Map<string, Completion>): DayStat[] {
  return range(from, to).map((d) => dayStat(tasks, d, cache));
}

export function sumStats(stats: DayStat[]) {
  return stats.reduce(
    (a, s) => ({ done: a.done + s.done, total: a.total + s.total, doneMin: a.doneMin + s.doneMin, totalMin: a.totalMin + s.totalMin }),
    { done: 0, total: 0, doneMin: 0, totalMin: 0 },
  );
}

/** سلسلة الأيام المتتالية المكتملة (الأيام بلا مهام لا تقطع السلسلة) حتى اليوم */
export function streak(tasks: Task[], today: string, cache: Map<string, Completion>): number {
  let n = 0;
  let d = today;
  const minStart = tasks.reduce((m, t) => (t.start_date < m ? t.start_date : m), today);
  for (let i = 0; i < 800 && d >= minStart; i++) {
    const s = dayStat(tasks, d, cache);
    if (s.total === 0) { d = addDaysLocal(d, -1); continue; }
    if (s.done === s.total) n++;
    else if (d !== today) break; // اليوم الجاري غير المكتمل لا يقطع السلسلة
    d = addDaysLocal(d, -1);
  }
  return n;
}
import { addDays as addDaysLocal } from "./dates";
