-- =====================================================================
-- لوحة العادات: القرآن + الإنجليزية — شغّل هذا الملف كاملًا مرة واحدة
-- Supabase → SQL Editor → New query → الصق → Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- الملفات الشخصية ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- أول حساب يُنشأ في المشروع يصبح مسؤولًا (ولي الأمر) تلقائيًا، والبقية أعضاء
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare uname text := split_part(new.email, '@', 1);
begin
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id, uname,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), uname),
    case when exists (select 1 from public.profiles) then 'member' else 'admin' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- المهام (تدعم التكرار) ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  category text not null default 'other' check (category in ('quran','english','habit','other')),
  notes text,
  start_date date not null,
  start_time time,
  duration_min integer check (duration_min is null or duration_min between 1 and 1440),
  recurrence text not null default 'none'
    check (recurrence in ('none','daily','weekly','biweekly','monthly','yearly')),
  until_date date,
  -- حقول القوالب (مثل خطة الإنجليزية 35 يومًا)
  plan_key text,
  plan_day integer,
  slot text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_idx on public.tasks (user_id, start_date);
create index if not exists tasks_plan_idx on public.tasks (user_id, plan_key);

-- ---------- الإنجاز لكل تكرار ----------
create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurrence_date date not null,
  status text not null default 'pending' check (status in ('pending','done','skipped')),
  note text,
  rating smallint check (rating is null or rating between 1 and 5),
  needs_review boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (task_id, occurrence_date)
);
create index if not exists completions_user_idx on public.completions (user_id, occurrence_date);

-- المالك يؤخذ دائمًا من المهمة نفسها، فلا يستطيع العميل تزويره
create or replace function public.completions_set_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select user_id into new.user_id from public.tasks where id = new.task_id;
  if new.user_id is null then raise exception 'task not found'; end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists completions_owner on public.completions;
create trigger completions_owner before insert or update on public.completions
  for each row execute function public.completions_set_owner();

-- ---------- الأمان (RLS) ----------
alter table public.profiles    enable row level security;
alter table public.tasks       enable row level security;
alter table public.completions enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
-- لا توجد سياسة تعديل للأعضاء: تغيير الأدوار وكلمات المرور يتم عبر واجهة المسؤول فقط

drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists completions_all on public.completions;
create policy completions_all on public.completions for all
  using (user_id = auth.uid() or public.is_admin())
  with check (
    exists (select 1 from public.tasks t
            where t.id = task_id and (t.user_id = auth.uid() or public.is_admin()))
  );
