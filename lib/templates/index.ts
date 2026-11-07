import { buildEnglishPlan, ENGLISH_KEY } from "./english35";

export interface TemplateDef {
  key: string;
  name: string;
  description: string;
  needsSunday: boolean;
  build: (start: string) => ReturnType<typeof buildEnglishPlan>;
}

// يُضاف قالب القرآن هنا عند استلام ملف المواصفات الخاص به
export const TEMPLATES: TemplateDef[] = [
  {
    key: ENGLISH_KEY,
    name: "خطة الإنجليزية — 35 يومًا",
    description:
      "5 أسابيع: 25 يوم دروس جديدة، 5 مراجعات (السبت)، 5 أيام راحة (الجمعة). كل يوم دراسة/مراجعة 180 دقيقة = 120 قواعد + 60 المهارات الأربع.",
    needsSunday: true,
    build: buildEnglishPlan,
  },
];
