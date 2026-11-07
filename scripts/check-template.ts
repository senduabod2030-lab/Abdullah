import { buildEnglishPlan, STUDY, REVIEWS } from "../lib/templates/english35";
import { dayName } from "../lib/dates";

const start = "2026-11-08"; // أحد
if (dayName(start) !== "الأحد") throw new Error("start not Sunday");
const tasks = buildEnglishPlan(start);
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(c ? "✓" : "✗", m); if (!c) fails++; };

const byDay = new Map<number, typeof tasks>();
tasks.forEach((t) => byDay.set(t.plan_day!, [...(byDay.get(t.plan_day!) ?? []), t]));
ok(STUDY.length === 25, "25 يوم دروس جديدة");
ok(REVIEWS.length === 5, "5 أيام مراجعة");
ok(byDay.size === 30, "30 يومًا فيها مهام");
for (const d of [6, 13, 20, 27, 34]) ok(!byDay.has(d), `اليوم ${d} (الجمعة) بلا مهام`);
let total = 0, grammar = 0, skills = 0, allDays = true, fourSkills = true;
for (const [day, ts] of byDay) {
  const g = ts.filter((t) => !t.slot!.startsWith("skill-")).reduce((a, t) => a + t.duration_min!, 0);
  const s = ts.filter((t) => t.slot!.startsWith("skill-"));
  const sm = s.reduce((a, t) => a + t.duration_min!, 0);
  if (g !== 120 || sm !== 60 || s.length !== 4 || s.some((t) => t.duration_min !== 15)) allDays = false;
  if (s.length !== 4) fourSkills = false;
  total += g + sm; grammar += g; skills += sm;
}
ok(allDays, "كل يوم: 120 + 60 = 180 (4 × 15)");
ok(fourSkills, "أربع مهارات في كل يوم");
ok(total === 5400 && total / 60 === 90, `إجمالي ${total / 60} ساعة = 90`);
ok(grammar / 60 === 60, `قواعد/مراجعة ${grammar / 60} ساعة = 60`);
ok(skills / 60 === 30, `مهارات ${skills / 60} ساعة = 30`);
const d33 = byDay.get(33)!.filter((t) => !t.slot!.startsWith("skill-"));
ok(d33.length === 2 && d33.map((t) => t.duration_min).join() === "60,60", "اليوم 33: 60 + 60 بلا تطبيق");
ok(byDay.get(35)![0].title === "الاختبار النهائي ومراجعة نقاط الضعف", "اليوم 35 اختبار نهائي");
ok(byDay.get(9)!.find((t) => t.slot === "primary")!.duration_min === 70, "اليوم 9: أساسي 70");
const dows = [...byDay.keys()].map((d) => dayName(tasks.find((t) => t.plan_day === d)!.start_date));
ok(STUDY.every((r) => dayName(tasks.find((t) => t.plan_day === r.day)!.start_date) !== "الجمعة"), "لا دراسة يوم الجمعة");
ok(REVIEWS.every((r) => dayName(tasks.find((t) => t.plan_day === r.day)!.start_date) === "السبت"), "المراجعات كلها سبت");
process.exit(fails ? 1 : 0);
