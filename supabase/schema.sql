-- ============================================================
-- FlowTrack — Supabase Schema
-- Run this in the Supabase SQL editor to set up all tables.
-- ============================================================

-- Enable the moddatetime extension for auto-updating updated_at columns
create extension if not exists moddatetime schema extensions;

-- ─── Workouts ────────────────────────────────────────────────────────────────
create table if not exists public.workouts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  exercise_name text not null,
  sets          int  not null check (sets > 0),
  reps          int  not null check (reps > 0),
  weight_kg     numeric(6,2) not null default 0 check (weight_kg >= 0),
  notes         text,
  start_time    timestamptz,
  end_time      timestamptz,
  status        text not null default 'planned'
                  check (status in ('planned','in-progress','completed','skipped')),
  session_id    uuid,
  sort_order    int  not null default 0,   -- preserves CSV upload row order
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at
create trigger handle_updated_at_workouts
  before update on public.workouts
  for each row execute procedure moddatetime(updated_at);

-- Migration: add sort_order column if upgrading from an earlier schema version
alter table public.workouts add column if not exists sort_order int not null default 0;

-- Row-level security
alter table public.workouts enable row level security;

create policy "Users can read own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Indexes
-- Covers the most common query: fetch workouts for a user+date range, ordered by sort_order
create index if not exists workouts_user_date_order on public.workouts(user_id, date, sort_order);
create index if not exists workouts_session          on public.workouts(session_id);

-- Migration: if you already ran the old schema, replace the old index with the new one
drop index if exists public.workouts_user_date;
create index if not exists workouts_user_date_order on public.workouts(user_id, date, sort_order);

-- ─── Exercise History ─────────────────────────────────────────────────────────
create table if not exists public.exercise_history (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  exercise_name  text not null,
  date           date not null,
  sets           int  not null,
  reps           int  not null,
  weight_kg      numeric(6,2) not null,
  volume_kg      numeric(10,2) generated always as (sets * reps * weight_kg) stored,
  estimated_1rm  numeric(6,2),
  created_at     timestamptz not null default now()
);

alter table public.exercise_history enable row level security;

create policy "Users can read own exercise history"
  on public.exercise_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own exercise history"
  on public.exercise_history for insert
  with check (auth.uid() = user_id);

create index if not exists exercise_history_user_name
  on public.exercise_history(user_id, exercise_name);

-- ─── AI Chat History ──────────────────────────────────────────────────────────
create table if not exists public.ai_chat_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  query      text not null,
  response   text not null,
  context    jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_chat_history enable row level security;

create policy "Users can read own chat history"
  on public.ai_chat_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat history"
  on public.ai_chat_history for insert
  with check (auth.uid() = user_id);

create index if not exists ai_chat_history_user
  on public.ai_chat_history(user_id, created_at desc);

-- ─── User Preferences ────────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users(id) on delete cascade,
  cycle_phase          text not null default 'none'
                         check (cycle_phase in ('follicular','ovulatory','luteal','menstrual','none')),
  units                text not null default 'kg' check (units in ('kg','lbs')),
  goal                 text not null default 'general'
                         check (goal in ('strength','hypertrophy','endurance','weight-loss','general')),
  openai_key           text,
  show_nutrition       boolean not null default false,
  onboarding_completed boolean not null default false,
  theme                text not null default 'dark' check (theme in ('dark','light','system')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Body profile columns (migration-safe)
alter table public.user_preferences add column if not exists age              int  check (age > 0 and age < 120);
alter table public.user_preferences add column if not exists gender           text check (gender in ('male','female','other'));
alter table public.user_preferences add column if not exists height_cm        numeric(5,1) check (height_cm > 0);
alter table public.user_preferences add column if not exists body_weight_kg   numeric(5,1) check (body_weight_kg > 0);
alter table public.user_preferences add column if not exists experience_level text check (experience_level in ('beginner','intermediate','advanced'));

create trigger handle_updated_at_user_prefs
  before update on public.user_preferences
  for each row execute procedure moddatetime(updated_at);

alter table public.user_preferences enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- ─── Auto-create preferences on signup ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime for live tracking
alter publication supabase_realtime add table public.workouts;
