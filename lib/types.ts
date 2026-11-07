export type Category = "quran" | "english" | "habit" | "other";
export type Recurrence = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
export type Status = "pending" | "done" | "skipped";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: "admin" | "member";
}

export interface Task {
  id: string;
  user_id: string;
  created_by: string | null;
  title: string;
  category: Category;
  notes: string | null;
  start_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  duration_min: number | null;
  recurrence: Recurrence;
  until_date: string | null;
  plan_key: string | null;
  plan_day: number | null;
  slot: string | null;
  sort_order: number;
}

export interface Completion {
  id: string;
  task_id: string;
  user_id: string;
  occurrence_date: string;
  status: Status;
  note: string | null;
  rating: number | null;
  needs_review: boolean;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  quran: "القرآن",
  english: "الإنجليزية",
  habit: "عادة",
  other: "أخرى",
};

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: "مرة واحدة",
  daily: "كل يوم",
  weekly: "كل أسبوع",
  biweekly: "كل أسبوعين",
  monthly: "كل شهر",
  yearly: "كل سنة",
};
