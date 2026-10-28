-- Supabase schema for optional accounts, daily streaks, and leaderboard.
-- Run this in the Supabase SQL Editor (or via Supabase CLI migrations).
-- The Cloudflare Worker should be the only writer to profiles and quiz_attempts.
-- Never expose the Supabase secret/service-role key to browser code.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Language learner'
    check (char_length(display_name) between 1 and 32),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_completed_date date,
  total_points bigint not null default 0 check (total_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  quiz_date date not null,
  lang_code text not null check (lang_code ~ '^[a-z]{2}$'),
  correct_answers smallint not null default 0
    check (correct_answers between 0 and 5),
  points smallint not null default 0 check (points between 0 and 5),
  completed_at timestamptz not null default now(),
  constraint quiz_attempts_one_per_day unique (user_id, quiz_date, lang_code)
);

create index if not exists quiz_attempts_leaderboard_idx
  on public.quiz_attempts (quiz_date desc, points desc);

alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;

-- Profiles contain only public leaderboard fields; no email or private account data.
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Intentionally no browser insert/update/delete policies on either table.
-- The Worker will write using a server-only Supabase secret key and validate
-- the signed-in user before accepting any changes.

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(left(new.raw_user_meta_data ->> 'display_name', 32), ''),
      'Language learner'
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace view public.leaderboard
with (security_invoker = false)
as
select
  user_id,
  display_name,
  current_streak,
  longest_streak,
  total_points
from public.profiles;

grant select on public.leaderboard to anon, authenticated;
