"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "./supabase/client";
import { compCache } from "./recurrence";
import type { Completion, Task } from "./types";

const PAGE = 1000;
// Supabase يعيد 1000 صف كحد أقصى، فنجلب على دفعات
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; ; i += PAGE) {
    const { data, error } = await build(i, i + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

export type TaskDraft = Omit<Task, "id" | "user_id" | "created_by">;

export function useData(userId: string, from: string, to: string) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comps, setComps] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const t = await fetchAll<Task>((a, b) =>
        sb.from("tasks").select("*").eq("user_id", userId).lte("start_date", to).order("id").range(a, b));
      const c = await fetchAll<Completion>((a, b) =>
        sb.from("completions").select("*").eq("user_id", userId)
          .gte("occurrence_date", from).lte("occurrence_date", to).order("id").range(a, b));
      setTasks(t.filter((x) => !x.until_date || x.until_date >= from));
      setComps(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحميل البيانات");
    }
    setLoading(false);
  }, [sb, userId, from, to]);

  useEffect(() => { reload(); }, [reload]);

  const cache = useMemo(() => compCache(comps), [comps]);

  async function setComp(taskId: string, date: string, patch: Partial<Pick<Completion, "status" | "note" | "rating" | "needs_review">>) {
    const prev = cache.get(`${taskId}|${date}`);
    // تحديث فوري للواجهة ثم حفظ
    const optimistic: Completion = {
      id: prev?.id ?? `tmp-${taskId}-${date}`, task_id: taskId, user_id: userId, occurrence_date: date,
      status: "pending", note: null, rating: null, needs_review: false, ...prev, ...patch,
    };
    setComps((cs) => [...cs.filter((c) => !(c.task_id === taskId && c.occurrence_date === date)), optimistic]);
    const { data, error } = await sb.from("completions")
      .upsert({ task_id: taskId, user_id: userId, occurrence_date: date, ...(prev ? {
        status: prev.status, note: prev.note, rating: prev.rating, needs_review: prev.needs_review } : {}), ...patch },
        { onConflict: "task_id,occurrence_date" })
      .select().single();
    if (error) { setError(error.message); await reload(); return; }
    setComps((cs) => [...cs.filter((c) => !(c.task_id === taskId && c.occurrence_date === date)), data as Completion]);
  }

  async function saveTask(draft: TaskDraft, id?: string, createdBy?: string) {
    const q = id
      ? sb.from("tasks").update(draft).eq("id", id)
      : sb.from("tasks").insert({ ...draft, user_id: userId, created_by: createdBy ?? null });
    const { error } = await q;
    if (error) { setError(error.message); return false; }
    await reload();
    return true;
  }

  async function deleteTask(id: string) {
    const { error } = await sb.from("tasks").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    await reload();
  }

  return { tasks, comps, cache, loading, error, reload, setComp, saveTask, deleteTask };
}
export type DataApi = ReturnType<typeof useData>;
