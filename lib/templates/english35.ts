import { addDays, dayName } from "../dates";
import type { Task } from "../types";

export const ENGLISH_KEY = "english-35";

type Row = {
  day: number;
  primary: string; related: string;
  pMin: number; rMin: number; aMin: number;
};
type Rest = { day: number; kind: "rest" };
type Review = { day: number; kind: "review"; title: string };

// المنهج المعتمد حرفيًا — لا تُعدَّل الأسماء ولا الدقائق هنا
export const STUDY: Row[] = [
  { day: 1, primary: "أقسام الكلام", related: "تركيب الجملة", pMin: 60, rMin: 40, aMin: 20 },
  { day: 2, primary: "الضمائر", related: "ضمائر الملكية", pMin: 55, rMin: 45, aMin: 20 },
  { day: 3, primary: "أدوات التعريف والتنكير a / an / the", related: "المعدود وغير المعدود", pMin: 60, rMin: 40, aMin: 20 },
  { day: 4, primary: "الأفعال المساعدة Be / Do / Have", related: "تكوين السؤال والنفي", pMin: 70, rMin: 35, aMin: 15 },
  { day: 5, primary: "تصريفات الأفعال V1 / V2 / V3", related: "الأفعال المنتظمة والشاذة وقاعدة ed", pMin: 65, rMin: 40, aMin: 15 },
  { day: 8, primary: "المضارع البسيط", related: "ظروف التكرار", pMin: 70, rMin: 30, aMin: 20 },
  { day: 9, primary: "الماضي البسيط", related: "الأفعال المركبة الشائعة", pMin: 70, rMin: 30, aMin: 20 },
  { day: 10, primary: "المستقبل البسيط", related: "الأفعال الناقصة Modals", pMin: 65, rMin: 35, aMin: 20 },
  { day: 11, primary: "قاعدة ing", related: "المضارع المستمر", pMin: 35, rMin: 65, aMin: 20 },
  { day: 12, primary: "الماضي المستمر", related: "المستقبل المستمر", pMin: 55, rMin: 45, aMin: 20 },
  { day: 15, primary: "المضارع التام", related: "Since / For (منذ / لمدة)", pMin: 75, rMin: 25, aMin: 20 },
  { day: 16, primary: "الماضي التام", related: "الفرق بين الماضي البسيط والماضي التام", pMin: 70, rMin: 30, aMin: 20 },
  { day: 17, primary: "المستقبل التام", related: "By / Before (بحلول / قبل)", pMin: 70, rMin: 30, aMin: 20 },
  { day: 18, primary: "المضارع التام المستمر", related: "الفرق بينه وبين المضارع التام", pMin: 70, rMin: 30, aMin: 20 },
  { day: 19, primary: "الماضي التام المستمر", related: "المستقبل التام المستمر", pMin: 55, rMin: 45, aMin: 20 },
  { day: 22, primary: "Gerund — المصدر بصيغة ing", related: "Infinitive — المصدر مع to", pMin: 55, rMin: 45, aMin: 20 },
  { day: 23, primary: "المقارنة", related: "التفضيل", pMin: 55, rMin: 45, aMin: 20 },
  { day: 24, primary: "الكميات", related: "المحددات Each / Every / Some / Any", pMin: 60, rMin: 40, aMin: 20 },
  { day: 25, primary: "ضمائر الوصل", related: "ربط الجمل", pMin: 70, rMin: 30, aMin: 20 },
  { day: 26, primary: "حروف الجر للزمان والمكان", related: "حروف الجر مع الأفعال والصفات", pMin: 60, rMin: 40, aMin: 20 },
  { day: 29, primary: "الشرط الصفري", related: "الشرط الأول", pMin: 55, rMin: 45, aMin: 20 },
  { day: 30, primary: "الشرط الثاني", related: "الشرط الثالث", pMin: 55, rMin: 45, aMin: 20 },
  { day: 31, primary: "المبني للمجهول", related: "استخدام Be + V3", pMin: 75, rMin: 25, aMin: 20 },
  { day: 32, primary: "الكلام المنقول", related: "تغير الأزمنة والضمائر عند النقل", pMin: 75, rMin: 25, aMin: 20 },
  // اليوم 33: مهمتان فقط (60 + 60)، بلا تطبيق
  { day: 33, primary: "مراجعة شاملة", related: "اختبار قواعد وتصحيح الأخطاء", pMin: 60, rMin: 60, aMin: 0 },
];

export const REVIEWS: Review[] = [
  { day: 7, kind: "review", title: "مراجعة الأساسيات، مع تدريب على تكوين الجمل والأسئلة" },
  { day: 14, kind: "review", title: "مقارنة الأزمنة الستة، مع تمارين لاختيار الزمن الصحيح" },
  { day: 21, kind: "review", title: "مراجعة الأزمنة الاثني عشر والتركيز على الفروق بينها في الاستخدام" },
  { day: 28, kind: "review", title: "كتابة نص قصير يستخدم الروابط والمقارنات وحروف الجر" },
  { day: 35, kind: "review", title: "الاختبار النهائي ومراجعة نقاط الضعف" },
];

export const RESTS: Rest[] = [6, 13, 20, 27, 34].map((day) => ({ day, kind: "rest" as const }));

export const SKILLS = [
  { slot: "listening", name: "الاستماع" },
  { slot: "reading", name: "القراءة" },
  { slot: "writing", name: "الكتابة" },
  { slot: "speaking", name: "التحدث" },
] as const;

export const SKILLS_GROUP = "المهارات الأربع";
export const WEEK_THEMES = [
  "تأسيس القواعد",
  "الأزمنة البسيطة والمستمرة",
  "الأزمنة التامة",
  "توسيع الجمل",
  "القواعد المتقدمة والتطبيق",
];

export type DraftTask = Omit<Task, "id" | "user_id" | "created_by">;

/** يبني مهام الخطة لتاريخ بداية يوم أحد. اليوم 6/13/20/27/34 (الجمعة) بلا مهام */
export function buildEnglishPlan(startSunday: string): DraftTask[] {
  const out: DraftTask[] = [];
  const base = {
    category: "english" as const, notes: null, start_time: null, recurrence: "none" as const,
    until_date: null, plan_key: ENGLISH_KEY,
  };
  const dateOf = (day: number) => addDays(startSunday, day - 1);
  const skills = (day: number, order: number) =>
    SKILLS.forEach((s, i) =>
      out.push({ ...base, title: `${s.name} — ${SKILLS_GROUP}`, start_date: dateOf(day), duration_min: 15,
        plan_day: day, slot: `skill-${s.slot}`, sort_order: order + i }));

  for (const r of STUDY) {
    const d = dateOf(r.day);
    out.push({ ...base, title: r.primary, start_date: d, duration_min: r.pMin, plan_day: r.day, slot: "primary", sort_order: 1 });
    out.push({ ...base, title: r.related, start_date: d, duration_min: r.rMin, plan_day: r.day, slot: "related", sort_order: 2 });
    if (r.aMin > 0)
      out.push({ ...base, title: "التطبيق", start_date: d, duration_min: r.aMin, plan_day: r.day, slot: "practice", sort_order: 3 });
    skills(r.day, 10);
  }
  for (const r of REVIEWS) {
    out.push({ ...base, title: r.title, start_date: dateOf(r.day), duration_min: 120, plan_day: r.day, slot: "review", sort_order: 1 });
    skills(r.day, 10);
  }
  return out;
}

export function planDayInfo(day: number, startSunday: string) {
  const date = addDays(startSunday, day - 1);
  return { day, date, name: dayName(date), week: Math.ceil(day / 7) };
}
