create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  city text check (city is null or char_length(city) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can read their own profile'
  ) then
    create policy "Users can read their own profile"
    on public.profiles
    for select
    to authenticated
    using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can create their own profile'
  ) then
    create policy "Users can create their own profile"
    on public.profiles
    for insert
    to authenticated
    with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can delete their own profile'
  ) then
    create policy "Users can delete their own profile"
    on public.profiles
    for delete
    to authenticated
    using (auth.uid() = id);
  end if;
end;
$$;

create table if not exists public.challenges (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  city text not null check (char_length(city) between 2 and 120),
  category text not null check (char_length(category) between 2 and 80),
  location_name text check (location_name is null or char_length(location_name) between 2 and 160),
  latitude numeric(9, 6) check (latitude is null or latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude is null or longitude between -180 and 180),
  points integer not null default 10 check (points > 0),
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists challenges_city_category_idx on public.challenges (city, category);
create index if not exists challenges_active_idx on public.challenges (is_active) where is_active;

drop trigger if exists set_challenges_updated_at on public.challenges;

create trigger set_challenges_updated_at
before update on public.challenges
for each row
execute function public.set_updated_at();

alter table public.challenges enable row level security;
alter table public.challenges force row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'challenges'
      and policyname = 'Anyone can read active challenges'
  ) then
    create policy "Anyone can read active challenges"
    on public.challenges
    for select
    to anon, authenticated
    using (is_active);
  end if;
end;
$$;

create table if not exists public.completions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete restrict,
  evidence_path text,
  validation_status text not null default 'pending' check (validation_status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completions_unique_user_challenge unique (user_id, challenge_id),
  constraint completions_reviewed_when_final check (
    validation_status = 'pending' or reviewed_at is not null
  )
);

comment on table public.completions is
'Completion rows are read-only from the browser. Add a validated server-side RPC or Edge Function before allowing submissions.';

create index if not exists completions_user_status_idx on public.completions (user_id, validation_status);
create index if not exists completions_challenge_idx on public.completions (challenge_id);

drop trigger if exists set_completions_updated_at on public.completions;

create trigger set_completions_updated_at
before update on public.completions
for each row
execute function public.set_updated_at();

alter table public.completions enable row level security;
alter table public.completions force row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'completions'
      and policyname = 'Users can read their own completions'
  ) then
    create policy "Users can read their own completions"
    on public.completions
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    raise exception 'Supabase storage.buckets table is required before applying evidence storage policies';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'objects'
  ) then
    raise exception 'Supabase storage.objects table is required before applying evidence storage policies';
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'evidence',
    'evidence',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
  on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can read their own evidence objects'
  ) then
    create policy "Users can read their own evidence objects"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'evidence'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own evidence objects'
  ) then
    create policy "Users can upload their own evidence objects"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'evidence'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end;
$$;
